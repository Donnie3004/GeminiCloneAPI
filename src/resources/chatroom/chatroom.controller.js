import CustomError from "../../utils/customError.js";
import ChatroomRepo from "./chatroom.repository.js";

export default class name {

  constructor(){
    this.repo = new ChatroomRepo();
  }

  async createChatroom(req, res, next) {
    try {

      // Check for validation errors
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Validation failed',
      //     errors: errors.array()
      //   });
      // }

      const { title , description} = req.body;
      const userId = req.user.id; // From JWT middleware

      // Insert new chatroom
    
      const chatroom_created = await this.repo.createChatroom(userId, title, description);

      if(!chatroom_created){
        throw new CustomError("Failed to create a chatroom..!", 500);
      }


      // // Clear cache for this user since we added a new chatroom
      // // chatroomCache.del(`chatrooms_${userId}`);

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
      //const cacheKey = `chatrooms_${userId}`;

      // Check cache first
      // let cachedChatrooms = chatroomCache.get(cacheKey);
      // if (cachedChatrooms) {
      //   return res.status(200).json({
      //     success: true,
      //     message: 'Chatrooms retrieved successfully (cached)',
      //     data: {
      //       chatrooms: cachedChatrooms
      //     }
      //   });
      // }

      // If not in cache, fetch from database
      
      const all_chatrooms = await this.repo.getAllChatrooms(userId);

      // // Cache the results
      // chatroomCache.set(cacheKey, chatrooms);

      if(!all_chatrooms){
        throw new CustomError("No chatrooms found for the current user", 404);
      }

      res.status(200).json({
        success: true,
        message: 'Chatrooms retrieved successfully',
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
      // const page = parseInt(req.query.page) || 1;
      // const limit = parseInt(req.query.limit) || 50;
      // const offset = (page - 1) * limit;

      // First, check if chatroom exists and belongs to user
      

      // const specific_chatroom = ChatRoomModel.chatroomById(id, userId);

      const specific_chatroom = await this.repo.getChatroomById(id, userId);

      if(!specific_chatroom){
        throw new CustomError(`No chatroom exists/Access denied for id ${id}`, 404);
      }
      
      // Get messages for this chatroom with pagination
      // const messagesQuery = `
      //   SELECT 
      //     id,
      //     content,
      //     message_type,
      //     created_at
      //   FROM messages 
      //   WHERE chatroom_id = $1 
      //   ORDER BY created_at DESC
      //   LIMIT $2 OFFSET $3
      // `;

      // const messagesResult = await pool.query(messagesQuery, [id, limit, offset]);
      
      // Get total message count for pagination
      // const countQuery = 'SELECT COUNT(*) FROM messages WHERE chatroom_id = $1';
      // const countResult = await pool.query(countQuery, [id]);
      // const totalMessages = parseInt(countResult.rows[0].count);

      // const messages = messagesResult.rows.map(msg => ({
      //   id: msg.id,
      //   content: msg.content,
      //   message_type: msg.message_type,
      //   created_at: msg.created_at
      // }));

      res.status(200).json({
        success: true,
        message: 'Chatroom retrieved successfully',
        data: specific_chatroom
          // chatroom: {
          //   ...chatroom,
          //   messages: messages.reverse(), // Reverse to show oldest first
          //   pagination: {
          //     current_page: page,
          //     per_page: limit,
          //     total_messages: totalMessages,
          //     total_pages: Math.ceil(totalMessages / limit)
          //   }
          // }
        });

    } catch (error) {
      console.error('Error getting chatroom:', error);
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Validation failed',
      //     errors: errors.array()
      //   });
      // }

      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      // Check if chatroom exists and belongs to user

      const chatroomResult = await this.repo.checkChatroomExists(id, userId);
      
      if (chatroomResult.rows.length === 0) {
        throw new CustomError('Chatroom not found or access denied', 404);
      }

      //From here --------------
      // Check user's subscription and daily limits
      const userQuery = `
        SELECT 
          subscription_tier,
          daily_message_count,
          last_reset_date
        FROM users 
        WHERE id = $1
      `;
      
      const userResult = await pool.query(userQuery, [userId]);
      const user = userResult.rows[0];

      // Reset daily count if it's a new day
      if (user.last_reset_date < new Date().toISOString().split('T')[0]) {
        await pool.query(
          'UPDATE users SET daily_message_count = 0, last_reset_date = CURRENT_DATE WHERE id = $1',
          [userId]
        );
        user.daily_message_count = 0;
      }

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
      const userMessageQuery = `
        INSERT INTO messages (chatroom_id, user_id, content, message_type)
        VALUES ($1, $2, $3, 'user')
        RETURNING id, content, message_type, created_at
      `;
      
      const userMessageResult = await pool.query(userMessageQuery, [id, userId, content]);
      const userMessage = userMessageResult.rows[0];

      // Increment user's daily message count
      await pool.query(
        'UPDATE users SET daily_message_count = daily_message_count + 1 WHERE id = $1',
        [userId]
      );

      // Here we'll add the message to queue for Gemini API processing
      // For now, we'll return immediately and process async
      const messageQueue = require('../services/messageQueue');
      await messageQueue.addGeminiJob({
        chatroomId: id,
        userId: userId,
        userMessage: content,
        messageId: userMessage.id
      });

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
          processing_status: 'queued'
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}