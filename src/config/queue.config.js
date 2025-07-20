import { Queue } from 'bullmq';
import  dotenv  from 'dotenv';
import IORedis from 'ioredis';
dotenv.config();

const redisConnection = new IORedis(process.env.REDIS_URL);

// Wait for Redis to connect before continuing
redisConnection.on('error', err => {
  console.error('Redis connection error:', err);
});

let messageQueue;
redisConnection.on('ready', () => {
  console.log('Redis is ready, initializing BullMQ...');
  messageQueue = new Queue(process.env.QUEUE_NAME, {  
    connection: redisConnection
  });
});

export default messageQueue;

// connection: {
//     host: process.env.REDIS_HOST || 'localhost',
//     port: Number(process.env.REDIS_PORT) || 6379
//}