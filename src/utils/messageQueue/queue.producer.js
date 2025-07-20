import { QueueEvents } from "bullmq";
import messageQueue from "../../config/queue.config.js";
import CustomError from "../customError.js";
import IORedis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: undefined,
  maxRetriesPerRequest: null
});

const queueName = process.env.QUEUE_NAME || 'gemini-message-processing';
const queueEvents = new QueueEvents(queueName, { connection });
await queueEvents.waitUntilReady(); 


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