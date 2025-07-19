import jwt from 'jsonwebtoken';
import CustomError from "../../utils/customError.js";
import generateOTP from '../../utils/generateOTP.js';
import UserRepo from './user.repository.js';
import dotenv from 'dotenv';
import validator from 'validator';
import { hashingPassword } from '../../utils/password_hashing.js';
dotenv.config();


export default class UserController {

  constructor(){
    this.repo = new UserRepo();
  }

  getUser(req, res){
    try {
      return res.status(200).json({
        success:true,
        data:req.user
      });
    } catch (error) {
      throw new CustomError();
    }
  }

  async changePassword(req, res, next){
    try {
      if(!req.user){
        throw new CustomError("Kindly login to change password", 400);
      }
      const {newpassword} = req.body;
      const {mobile} = req.user;
      
      if(!newpassword){
        throw new CustomError("Kindly enter the new password", 400);
      }

      await this.repo.updatePassword(mobile, newpassword);
      return res.status(200).json({
        success:true,
        message:"Password changed succefully",
      });
    } catch (error) {
      next(error);
    }
  }
  // User signup function where we validate for unique mobile number from DB.
  async userSignUp(req, res, next){
    try {
      let {name, mobile, email, password} = req.body;

      if(!name || !mobile || !email || !password){
        throw new CustomError("Kindly fill in all the fields..!", 400);
      }

      if(!validator.isAlpha(name)){
        throw new CustomError("Name should have only alphabets..!", 400);
      }

      if(!validator.isEmail(email)){
        throw new CustomError("Enter a valid Email...!", 400);
      }

      if(mobile.length !== 10){
        throw new CustomError("Mobile should be 10-digit number...!", 400);
      }

      const user_exists = await this.repo.checkUserExists(mobile);

      if(user_exists){
        throw new CustomError("User with current mobile number already exists..!", 400);
      }

      const hashed_password = await hashingPassword(password);

      let user_obj = {
        name : name.trim(),
        email:email,
        mobile: mobile,
        password: hashed_password
      };

      let user_created = await this.repo.registerUserToDB(user_obj);

      if(!user_created){
        throw new CustomError("Falied to add user, please try later", 507); 
      }

      return res.status(201).json({
        success:true,
        message:"User added sucessfully",
        user:user_created
      });

    } catch (error) {
      next(error);
    }
  }

  async sendOTP(req, res, next){
    try {
      let {mobile} = req.body;

      if(mobile.length !== 10){
        throw new CustomError("Mobile should be 10-digit number...!", 400);
      }

      const user_exists = await this.repo.checkUserExists(mobile);

      if(!user_exists){
        throw new CustomError("Mobile number not registered", 404);
      }
      
      const otp_obj = generateOTP(mobile);
      const otp_db_obj = await this.repo.sendOTPToDB(otp_obj);

      if(!otp_db_obj){
        throw new CustomError("Not able to generate OTP..! Please try again later", 500);
      }

      return res.status(201).json({
        success:true,
        message:"OTP Generated",
        mobile:otp_db_obj.mobile,
        OTP:otp_db_obj.otp_code,
        ExpiresIn: `30 seconds`
      });

    } catch (error) {
      next(error);
    }
  }

  async verifyOTP(req, res, next){
    try {
      const {mobile, otp} = req.body;

      if (!mobile || !otp) {
        throw new CustomError("Mobile No. and OTP are required", 400);
      }

      const otp_obj = await this.repo.sendOTPdetails(mobile);

      if (otp_obj.mobile !== mobile) {
        throw new CustomError("No OTP requested for this Mobile Number", 400);
      }

      if (Date.now() > otp_obj.expiresAt) {
        const data = await this.repo.deleteOTP(otp_obj.mobile, otp_obj.id);
        console.log("Data : " , data);
        return res.status(401).json({ message: "OTP expired" });
      }

      if (otp_obj.otp !== otp) {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      const payload = {
        mobile : mobile
      }

      const token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn:Number(process.env.JWT_SESSION_TIME)});

      // I am doing hard delete we can just change the status (is_used) also..!
      await this.repo.deleteOTP(otp_obj.mobile, otp_obj.id);

      return res.json({ 
        success:true,
        message:"OTP verified successfully",
        token: token
      });

    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next){
    try {
      const {mobile, newpassword} = req.body;

      if(!mobile || !newpassword){
        throw new CustomError("Mobile number and new password required...!", 400);
      }

      const user_exists = await this.repo.checkUserExists(mobile);

      if(!user_exists){
        throw new CustomError("User not exists, please sign up", 400);
      }

      await this.repo.updatePassword(mobile, newpassword);

      return res.json({ 
        success:true,
        message:"Password updated successfully...!",
      });

    } catch (error) {
      next(error);
    }
  }
}