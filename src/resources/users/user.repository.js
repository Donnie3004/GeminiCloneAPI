
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../../config/db.config.js';

export default class UserRepo{

  async registerUserToDB(user_obj){
    const query = `
        INSERT INTO users (id, mobile_number, name, email, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, mobile_number, name, email, password_hash, subscription_tier, subscription_id, daily_message_count, last_reset_date, created_at, updated_at
      `;

    const result = await pool.query(query, [uuidv4(), user_obj.mobile, user_obj.name, user_obj.email, user_obj.password]);
    const chatroom = result.rows[0];
    return chatroom;
  }

  async checkUserExists(mobile){
    const query = `SELECT U.id, U.name, U.email, U.mobile_number, U.password_hash, U.subscription_tier, U.created_at FROM users U WHERE U.mobile_number = $1`;
    const result = await pool.query(query, [mobile]);
    const final_user = result.rows.map(row => ({
      id: row.id, 
      name: row.name,
      email: row.email,
      mobile: row.mobile_number,
      password : row.password_hash,
      StripSubscription : row.subscription_tier,
      createdAT : row.created_at
    }));
    return final_user[0];
  }

  async sendOTPToDB(otp_obj) {

    const new_otp_check = await this.sendOTPdetails(otp_obj.mobile);
    
    if(new_otp_check){
      await this.deleteOTP(otp_obj.mobile, new_otp_check.id);
    }

    const query = `
        INSERT INTO otps (id, mobile_number, otp_code, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, mobile_number, otp_code, expires_at, created_at
      `;

    const result = await pool.query(query, [uuidv4(), otp_obj.mobile, otp_obj.details.otp, otp_obj.details.expiresAt]);

    const otp_db_obj = result.rows;
    return otp_db_obj[0];
  }

  async sendOTPdetails(mobile){
    const query = `SELECT U.id, U.mobile_number, U.otp_code, U.expires_at, U.is_used FROM otps U WHERE U.mobile_number = $1 AND U.is_used = $2`;
    const result = await pool.query(query, [mobile, false]);
    const final_user = result.rows.map(row => ({
      id: row.id,
      mobile: row.mobile_number, 
      otp: row.otp_code,
      expiresAt: row.expires_at, 
      isused : row.is_used
    }));
    console.log("Send details : ", final_user[0]);
    return final_user[0];
  }

  async deleteOTP(mobile, otp_id){
    console.log(mobile, otp_id);
    const query = `DELETE FROM otps O WHERE O.id = $1 AND O.mobile_number = $2`;
    await pool.query(query,[otp_id, mobile]);
    return;
  }

  async updatePassword(mobile, newpassword){
    console.log("inside updated passs");
    const query = `UPDATE users SET password_hash = $1 WHERE mobile_number = $2;`;
    await pool.query(query, [newpassword, mobile]);
  }

  async updateSubscription(userId, subsId){
    const query = `UPDATE users SET subscription_id = $1 WHERE id = $2;`;
    await pool.query(query, [subsId, userId]);
  }

  async updateSubscriptionStatus(mobile){
    console.log("iinside susb update..!");
    const query = `UPDATE users SET subscription_tier = $1 WHERE id = $2 AND subscription_id IS NOT NULL;`;
    await pool.query(query, ["Pro", mobile]);
  }

}