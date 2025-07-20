// import Redis from 'ioredis';
// import dotenv from 'dotenv';
// dotenv.config();

// // const redis = new Redis({
// //   host: process.env.REDIS_HOST, 
// //   port: Number(process.env.REDIS_PORT),      
// // });

// const redis = new Redis(process.env.REDIS_URL)

// export default redis;

import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error:', err));

await redis.connect(); // Use inside async context only

export default redis;