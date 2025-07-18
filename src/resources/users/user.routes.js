import express from 'express';
import userController from './user.controller.js';
import jwtauth from '../../middlewares/jwt.config.js';
const router = express.Router();


const UserController = new userController();
router.post('/auth/signup', UserController.userSignUp.bind(UserController));
router.post('/auth/send-otp', UserController.sendOTP.bind(UserController));
router.post('/auth/verify-otp', UserController.verifyOTP.bind(UserController));
router.post('/auth/forgot-password', UserController.forgotPassword.bind(UserController));
router.post('/auth/change-password', jwtauth, UserController.changePassword.bind(UserController));
router.get('/user/me', jwtauth, UserController.getUser.bind(UserController));

export default router;