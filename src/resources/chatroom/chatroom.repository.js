import { pool } from "../../config/db.config.js";
import { v4 as uuidv4 } from 'uuid';
export default class ChatroomRepo {
  async createChatroom(userId, title, description){
    
    const query = `INSERT INTO chatrooms (id, user_id, title, description) VALUES ($1, $2, $3, $4) RETURNING id, user_id, title, description, created_at, updated_at`;

    const result = await pool.query(query, [uuidv4(), userId, title, description]);
    const chatroom = result.rows[0];
    return chatroom;
  }

  async getAllChatrooms(userId){
    console.log(userId);
    const query = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.created_at,
          c.updated_at
        FROM chatrooms c
        WHERE c.user_id = $1`;

    const result = await pool.query(query, [userId]);
    const chatrooms = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    return chatrooms;
  }

  async getChatroomById(Chatroomid, userId){ // completed details left with messages
    console.log(Chatroomid, userId);
    const query = `
      SELECT id, title, description, created_at, updated_at
      FROM chatrooms 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [Chatroomid, userId]);
    const chatroom = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    console.log(chatroom);
    return chatroom;
  }

  async checkChatroomExists(id, userId){
    const chatroomQuery = 'SELECT id FROM chatrooms WHERE id = $1 AND user_id = $2';
    const chatroomResult = await pool.query(chatroomQuery, [id, userId]);
    return chatroomResult;   
  }

  async dbvalidations(userId){
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
      console.log(user);
      return user;
  }

  async sendMessageToDB(id, userId, content){
    const userMessageQuery = `
        INSERT INTO messages (id, chatroom_id, user_id, content, message_type)
        VALUES ($1, $2, $3, $4, 'user')
        RETURNING id, content, message_type, created_at
      `;
      
      const userMessageResult = await pool.query(userMessageQuery, [uuidv4(), id, userId, content]);
      const userMessage = userMessageResult.rows[0];

      // Increment user's daily message count
      await pool.query(
        'UPDATE users SET daily_message_count = daily_message_count + 1 WHERE id = $1',
        [userId]
      );

      return userMessage;
  }

  
}