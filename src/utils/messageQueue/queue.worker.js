import { Worker } from "bullmq";
import MessageRepository from "../../resources/messages/messages.repository.js";
import chatWithGemini from "../geminiApiHit.js";
import CustomError from "../customError.js";


const worker = new Worker('gemini-message-processing', async (job) => {
  const { chatroomId, userId, userMessage } = job.data;

  try {
    console.log(`Processing job ${job.id} for chatroom ${chatroomId}`);
    const messageRepo = new MessageRepository();
    const history = await messageRepo.getMessageHistory(chatroomId);

    let context = "You are a helpful AI assistant. Here's the conversation history:\n\n";
    
    history.forEach(msg => {
      const role = msg.message_type === 'user' ? 'User' : 'Assistant';
      context += `${role}: ${msg.content}\n`;
    });
    
    
    context += `\nUser: ${userMessage}\n\nPlease provide a helpful response:`;

    const aiResponse = await chatWithGemini(context);

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
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
});

// Event listeners
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

worker.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled.`);
});