// // import Redis from 'ioredis';
// // import dotenv from 'dotenv';
// // dotenv.config();

// // // const redis = new Redis({
// // //   host: process.env.REDIS_HOST, 
// // //   port: Number(process.env.REDIS_PORT),      
// // // });
// // let redis
// // try {
// //   redis = new Redis(process.env.REDIS_URL)
// // } catch (error) {
// //   Error(error);
// // }

// // export default redis;


// // import Redis from 'ioredis';
// // // import dotenv from 'dotenv';
// // // dotenv.config();

// // // let redis;
// // // try {
// // //   // Add ?family=0 to the Redis URL to support IPv6
// // //   redis = new Redis(`${process.env.REDIS_URL}?family=0`);
// // // } catch (error) {
// // //   console.error("Redis connection error:", error);
// // // }

// // // export default redis;


// import Redis from 'ioredis';
// import dotenv from 'dotenv';
// dotenv.config();

// let redis;

// try {
//   // Supports IPv6 and Railway's internal networking
//   redis = new Redis(`${process.env.REDIS_URL}?family=0`);

//   // Optional: Add error listener for runtime issues
//   redis.on('error', (err) => {
//     console.error('Redis runtime error:', err);
//   });
  
//   console.log('Redis initialized');
// } catch (error) {
//   console.error('Redis connection error (initial):', error);
//   process.exit(1); // Optional: exit if Redis can't start
// }

// export default redis;


import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redis = new Redis(`${process.env.REDIS_URL}?family=0`);

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  process.exit(1);
});

export default redis;