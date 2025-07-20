import { Queue } from 'bullmq';
import  dotenv  from 'dotenv';
dotenv.config();

const messageQueue = new Queue('gemini-message-processing', {  // put in .env
  // connection: {
  //   host: process.env.REDIS_HOST || 'localhost',
  //   port: Number(process.env.REDIS_PORT) || 6379,
  //   password: process.env.REDIS_PASSWORD || undefined,
  // },
  connection: new URL(process.env.REDIS_URL)
});

export default messageQueue;