import messageQueue from "../../config/queue.config";
import CustomError from "../customError";

export default class MessageQueueService {
  // Add a new job to the queue
  static async addGeminiJob(jobData) {
    try {
      const job = await messageQueue.add(jobData, {
        delay: 1000, // 1 second delay
        attempts: 3, // Retry 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 50, // Keep last 50 completed jobs
        removeOnFail: 20, // Keep last 20 failed jobs
      });
      
      console.log(`Added job ${job.id} to queue`);
      return job;
    } catch (error) {
      console.error('Error adding job to queue:', error);
      throw new CustomError("Error adding job to queue", 500);
    }
  }
  
  // // Get queue statistics
  // static async getQueueStats() {
  //   try {
  //     const waiting = await messageQueue.getWaiting();
  //     const active = await messageQueue.getActive();
  //     const completed = await messageQueue.getCompleted();
  //     const failed = await messageQueue.getFailed();
      
  //     return {
  //       waiting: waiting.length,
  //       active: active.length,
  //       completed: completed.length,
  //       failed: failed.length
  //     };
  //   } catch (error) {
  //     console.error('Error getting queue stats:', error);
  //     throw error;
  //   }
  // }
  
  // // Clean old jobs
  // static async cleanQueue() {
  //   try {
  //     await messageQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24 hours
  //     await messageQueue.clean(24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 24 hours
  //     console.log('Queue cleaned successfully');
  //   } catch (error) {
  //     console.error('Error cleaning queue:', error);
  //     throw error;
  //   }
  // }
  
  // // Pause queue
  // static async pauseQueue() {
  //   await messageQueue.pause();
  //   console.log('Queue paused');
  // }
  
  // // Resume queue
  // static async resumeQueue() {
  //   await messageQueue.resume();
  //   console.log('Queue resumed');
  // }
}