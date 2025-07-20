// // import { Queue } from 'bullmq';
// // import  dotenv  from 'dotenv';
// // dotenv.config();

// // const messageQueue = new Queue('gemini-message-processing', {  // put in .env
// //   connection: {
// //     host: process.env.REDIS_HOST || 'localhost',
// //     port: Number(process.env.REDIS_PORT) || 6379,
// //     password: process.env.REDIS_PASSWORD || undefined,
// //   },
// //  // connection: new URL(process.env.REDIS_URL)
// // });

// // export default messageQueue;

// import { Queue } from 'bullmq';
// import dotenv from 'dotenv';
// dotenv.config();

// // Use URL object to safely parse parts from REDIS_URL
// const redisURL = new URL(process.env.REDIS_URL);

// const messageQueue = new Queue('gemini-message-processing', {
//   connection: {
//     host: redisURL.hostname,
//     port: Number(redisURL.port),
//     username: redisURL.username || undefined,
//     password: redisURL.password || undefined,
//     family: 0 //  This enables dual stack (IPv4 + IPv6)
//   }
// });

// export default messageQueue;

import { Queue } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = new URL(process.env.REDIS_URL);

const messageQueue = new Queue('gemini-message-processing', {
  connection: {
    host: redisUrl.hostname,
    port: Number(redisUrl.port),
    password: redisUrl.password,
    username: redisUrl.username,
    family: 0 // Required for Railway's IPv6 networking
  }
});

export default messageQueue;