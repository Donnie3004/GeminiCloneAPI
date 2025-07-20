import { QueueEvents } from "bullmq";
import messageQueue from "../../config/queue.config.js";
import CustomError from "../customError.js";
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
//process.env.REDIS_URL,


// const connection = new IORedis({
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//   family:0,
//   maxRetriesPerRequest: null
// });


const redisConnection = new IORedis(process.env.REDIS_URL);

// Wait for Redis to connect before continuing
redisConnection.on('error', err => {
  console.error('Redis connection error:', err);
});
let queueEvents;
redisConnection.on('ready', async () => {
  const queueName = process.env.QUEUE_NAME || 'gemini-message-processing';
  queueEvents = new QueueEvents(queueName, { redisConnection });
  await queueEvents.waitUntilReady(); 
});

export default class MessageQueueService {
  // Add a new job to the queue
  static async addGeminiJob(jobData) {
    try {
      const job = await messageQueue.add('gemini-job', jobData, {
        delay: 1000,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 50,
        removeOnFail: 20,
      });

      console.log(`Added job ${job.id} to queue`);

      return job;
    } catch (error) {
      console.error('Error adding job to queue:', error);
      throw new CustomError("Error adding job to queue", 500);
    }
  }

  static getQueueEvents() {
    return queueEvents;
  }
}