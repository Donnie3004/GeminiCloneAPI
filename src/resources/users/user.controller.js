
import validator from 'validator';
import jwt from 'jsonwebtoken';
import CustomError from "../../utils/customError.js";
import UserModel from './user.model.js';
import generateOTP from '../../utils/generateOTP.js';
import dotenv from 'dotenv';
dotenv.config();


export default class UserController {

  constructor(){
    this.otpStore = {};
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

  changePassword(req, res, next){
    try {
      if(!req.user){
        return res.status(400).json({
          success:false,
          message:"Kindly login to change password"
        });
      }

      const {newpassword} = req.body;
      const {id} = req.user;
      // console.log(newpassword, id);
      const password_updated = UserModel.changePassword(id, newpassword);

      if(!password_updated){
        throw new CustomError("Not able to change password, please try later", 502);
      }
      return res.status(502).json({
        success:true,
        message:"Password succefully changed",
        data:password_updated
      });
    } catch (error) {
      next(error);
    }
  }

  userSignUp(req, res, next){
    try {
      let {name, mobile, password} = req.body;

      const user_exists = UserModel.checkUserByMobileNo(mobile);

      if(user_exists){
        throw new CustomError("User with current mobile number already exists..!", 400);
      }

      let user_obj = {
        name : name.trim(),
        mobile: mobile,
        password: password
      };

      let user_created = UserModel.userSignUp(user_obj);

      if(!user_created){
        throw new CustomError("Falied to add user, please try later", 507); 
      }

      return res.status(201).json({
        success:true,
        message:"User added sucessfully",
        user:user_obj
      });

    } catch (error) {
      next(error);
    }
  }

  sendOTP(req, res, next){
    try {
      let {mobile} = req.body;

      const user_exists = UserModel.checkUserByMobileNo(mobile);

      if(!user_exists){
        throw new CustomError("Mobile number not registered", 404);
      }
      
      const otp_obj = generateOTP(mobile);

      this.otpStore = otp_obj;

      return res.status(201).json({
        success:true,
        message:"OTP Generated",
        mobile:otp_obj.mobile,
        OTP:otp_obj.details.otp,
        ExpiresIn: `30 seconds`
      });

    } catch (error) {
      next(error);
    }
  }

  verifyOTP(req, res, next){
    try {
      const {mobile, otp} = req.body;

      if (!mobile || !otp) {
        throw new CustomError("Mobile No. and OTP are required", 400);
      }

      if (this.otpStore.mobile !== mobile) {
        throw new CustomError("No OTP requested for this Mobile Number", 400);
      }

      if (Date.now() > this.otpStore.details.expiresAt) {
        delete this.otpStore.details;
        return res.status(401).json({ message: "OTP expired" });
      }

      if (this.otpStore.details.otp !== otp) {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      const payload = {
        mobile : mobile
      }

      const token = jwt.sign(payload, process.env.SECRET_KEY, {expiresIn:6000});

      delete this.otpStore.details; 

      return res.json({ 
        success:true,
        message:"OTP verified successfully",
        token: token
      });

    } catch (error) {
      next(error);
    }
  }

  forgotPassword(req, res, next){
    this.sendOTP(req, res, next);
  }
}