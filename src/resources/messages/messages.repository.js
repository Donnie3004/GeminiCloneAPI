import { pool } from "../../config/db.config.js";
import { v4 as uuidv4 } from 'uuid';

export default class MessageRepository {
  async getMessageHistory(chatroomId){
    console.log("Inside getmessage history");
    const historyQuery = `
      SELECT content, message_type, created_at
      FROM messages
      WHERE chatroom_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const historyResult = await pool.query(historyQuery, [chatroomId]);
    const history = historyResult.rows.reverse();
    return history;
  }

  async insertAIResponse(chatroomId, userId, aiResponse){
    const insertQuery = `
      INSERT INTO messages (id, chatroom_id, user_id, content, message_type)
      VALUES ($1, $2, $3, $4, 'ai')
      RETURNING id, content, message_type, created_at
    `;
    const saved = await pool.query(insertQuery, [uuidv4(), chatroomId, userId, aiResponse]);
    const aiMessage = saved.rows[0];
    console.log(aiMessage);
    return aiMessage;    
  }

  async InsertfailedResponse(chatroomId, userId){
    const fallback = "Sorry, I encountered an error processing your message. Please try again.";
    const query = `
      INSERT INTO messages (chatroom_id, user_id, content, message_type)
      VALUES ($1, $2, $3, 'ai')
    `;
    const failed_resp = await pool.query(query, [uuidv4(), chatroomId, userId, fallback]);
    const reply = failed_resp.rows[0];
    return reply;
  }
}