import { Queue } from 'bullmq';
import  dotenv  from 'dotenv';
dotenv.config();

const messageQueue = new Queue(process.env.QUEUE_NAME, {  
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379
  },
});

export default messageQueue;