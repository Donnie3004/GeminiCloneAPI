import { Worker } from "bullmq";
import MessageRepository from "../../resources/messages/messages.repository.js";
import chatWithGemini from "../geminiApiHit.js";
import CustomError from "../customError.js";
import IORedis from 'ioredis';
import dotenv from "dotenv";
dotenv.config();

// const redisURL = new URL(process.env.REDIS_URL);

const redisConnection = new IORedis(process.env.REDIS_URL);

redisConnection.on('error', err => {
  console.error('Redis connection error:', err);
});


redisConnection.on('ready', () => {
  console.log("Redis connection is ready.");
  const worker = new Worker(process.env.QUEUE_NAME, async (job) => {
    try {
      const { chatroomId, userId, userMessage } = job.data;
      console.log(`Processing job ${job.id} for chatroom ${chatroomId}`);
      
      const messageRepo = new MessageRepository();
      const history = await messageRepo.getMessageHistory(chatroomId);

      let context = "You are a helpful AI assistant. Here's the conversation history:\n\n";
      
      history.forEach(msg => {
        const role = msg.message_type === 'user' ? 'User' : 'Assistant';
        context += `${role}: ${msg.content}\n`;
      });
      
      
      context += `\nUser: ${userMessage}\n\nPlease provide a helpful response:`;
      console.log(context);
      const aiResponse = await chatWithGemini(context);
      console.log(aiResponse);
      if(!aiResponse){
        const reply = await messageRepo.InsertfailedResponse(chatroomId, userId);
        throw new CustomError(reply.fallback, 500);
      }

      const aiMessage = await messageRepo.insertAIResponse(chatroomId, userId, aiResponse);

      console.log(`AI response saved for job ${job.id}: ${aiMessage.id}`);
      return { success: true, aiMessage };

    } catch (error) {
      console.error(`Error in job ${job.id}:`, error);
    }
  }, {
    // connection: {
    //   host: REDIS_HOST  || 'localhost',
    //   port: REDIS_PORT || 6379,
    //   maxRetriesPerRequest: null,
    //   family:0
    // },
    connection : redisConnection
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
  });

  worker.on('stalled', (job) => {
    console.warn(`Job ${job.id} stalled.`);
  });
});