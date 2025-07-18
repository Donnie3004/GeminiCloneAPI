import jwt from 'jsonwebtoken';
import CustomError from "../../utils/customError.js";
import generateOTP from '../../utils/generateOTP.js';
import UserRepo from './user.repository.js';
import dotenv from 'dotenv';
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
        return res.status(400).json({
          success:false,
          message:"Kindly login to change password"
        });
      }

      const {newpassword} = req.body;
      const {mobile} = req.user;
      console.log(newpassword, mobile);

      await this.repo.updatePassword(mobile, newpassword);
      return res.status(200).json({
        success:true,
        message:"Password succefully changed",
      });
    } catch (error) {
      next(error);
    }
  }

  async userSignUp(req, res, next){
    try {
      let {name, mobile, email, password} = req.body;

      const user_exists = await this.repo.checkUserExists(mobile);

      if(user_exists){
        throw new CustomError("User with current mobile number already exists..!", 400);
      }

      let user_obj = {
        name : name.trim(),
        email:email,
        mobile: mobile,
        password: password
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

      const user_exists = await this.repo.checkUserExists(mobile);

      if(!user_exists){
        throw new CustomError("Mobile number not registered", 404);
      }
      
      const otp_obj = generateOTP(mobile);
      const otp_db_obj = await this.repo.sendOTPToDB(otp_obj);

      if(!otp_db_obj){
        throw new CustomError("Not able to generate OTP..! Please try again", 500);
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

      console.log(mobile, otp);

      if (!mobile || !otp) {
        throw new CustomError("Mobile No. and OTP are required", 400);
      }

      const otp_obj = await this.repo.sendOTPdetails(mobile);

      console.log(otp_obj);

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

      const token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn:6000});

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

      const user_exists = await this.repo.checkUserExists(mobile);

      if(!user_exists){
        throw new CustomError("User not exists please sign up", 400);
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