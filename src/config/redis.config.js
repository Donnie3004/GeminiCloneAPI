import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

// const redis = new Redis({
//   host: process.env.REDIS_HOST, 
//   port: Number(process.env.REDIS_PORT),      
// });

const redis = new Redis(process.env.REDIS_URL)

export default redis;