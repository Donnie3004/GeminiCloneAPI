import redis from "../../config/redis.config.js";
import CustomError from "../../utils/customError.js";
import MessageQueueService from "../../utils/messageQueue/queue.producer.js";
import ChatroomRepo from "./chatroom.repository.js";


const CHATROOM_CACHE_KEY = "all_chatrooms";

export default class name {

  constructor(){
    this.repo = new ChatroomRepo();
  }

  async createChatroom(req, res, next) {
    try {
      const { title , description} = req.body;
      const userId = req.user.id; // From JWT middleware

      if(!title || !description){
        throw new CustomError("Enter title and description...!", 400);
      }

      // Insert new chatroom
      const chatroom_created = await this.repo.createChatroom(userId, title, description);

      if(!chatroom_created){
        throw new CustomError("Failed to create a chatroom..!", 500);
      }

      const updatedChatrooms = await this.repo.getAllChatrooms(userId);
      console.log("UpdatedChatroom : ", updatedChatrooms);
      await redis.set(CHATROOM_CACHE_KEY, JSON.stringify(updatedChatrooms));
      
      res.status(201).json({
        success: true,
        message: 'Chatroom created successfully',
        data: chatroom_created
      });

    } catch (error) {
      console.error('Error creating chatroom:', error);
      next(error);
    }
  }

  async getAllChatrooms(req, res, next) {
    try {
      const userId = req.user.id;

      const cached = await redis.get(CHATROOM_CACHE_KEY);

      if (cached) {
        console.log("Returning chatrooms from cache");
        const data = JSON.parse(cached);
        return res.status(200).json({
          success:true,
          message: 'Chatrooms retrieved successfully from cached',
          data:data
        });
      }

      // If not in cache, fetch from database
      const all_chatrooms = await this.repo.getAllChatrooms(userId);

      // // Cache the results
      await redis.set(CHATROOM_CACHE_KEY, JSON.stringify(all_chatrooms));

      if(!all_chatrooms){
        throw new CustomError("No chatrooms found for the current user", 404);
      }

      res.status(200).json({
        success: true,
        message: 'Chatrooms retrieved successfully from DB',
        chatrooms: all_chatrooms
      });

    } catch (error) {
      console.error('Error getting chatrooms:', error);
      next(error);
    }
  }

  async getChatroomById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const specific_chatroom = await this.repo.getChatroomById(id, userId);

      if(!specific_chatroom){
        throw new CustomError(`No chatroom exists/Access denied for id ${id}`, 404);
      }

      res.status(200).json({
        success: true,
        message: 'Chatroom retrieved successfully',
        data: specific_chatroom
        });

    } catch (error) {
      console.error('Error getting chatroom:', error);
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      if(!content || !id){
        throw new CustomError("Please enter the content/question and id", 400);
      }

      // Check if chatroom exists and belongs to user
      const chatroomResult = await this.repo.checkChatroomExists(id, userId);
      
      if (chatroomResult.rows.length === 0) {
        throw new CustomError('Chatroom not found or access denied', 404);
      }

      //From here --------------
      // Check user's subscription and daily limits
      
      const user = await this.repo.dbvalidations(userId);

      // Check rate limits for Basic tier
      if (user.subscription_tier === 'Basic' && user.daily_message_count >= 5) {
        return res.status(429).json({
          success: false,
          message: 'Daily message limit exceeded. Upgrade to Pro for unlimited messages.',
          limit_info: {
            subscription_tier: user.subscription_tier,
            daily_limit: 5,
            messages_used: user.daily_message_count
          }
        });
      }

      // Save user message

      const userMessage = await this.repo.sendMessageToDB(id, userId, content);
      
      console.log("User meesage : ", userMessage);

      // Here we'll add the message to queue for Gemini API processing
      // For now, we'll return immediately and process async

      const job = await MessageQueueService.addGeminiJob({
        chatroomId: id,
        userId: userId,
        userMessage: content,
        messageId: userMessage.id
      });

      const queueEvenets = MessageQueueService.getQueueEvents();

      const result = await job.waitUntilFinished(queueEvenets); //wait for gemini for response
      
      res.status(200).json({
        success: true,
        message: 'Message sent successfully. AI response will be generated shortly.',
        data: {
          user_message: {
            id: userMessage.id,
            content: userMessage.content,
            message_type: userMessage.message_type,
            created_at: userMessage.created_at
          },
          AI_Response: result.aiMessage
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      next(error)
    }
  }
}