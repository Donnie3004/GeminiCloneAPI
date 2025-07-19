import express from 'express';
import jwtauth from '../../middlewares/jwt.config.js';
import chatroomController from './chatroom.controller.js';
const router = express.Router();


const ChatroomController = new chatroomController();
router.post('/', jwtauth, ChatroomController.createChatroom.bind(ChatroomController));
router.get('/', jwtauth, ChatroomController.getAllChatrooms.bind(ChatroomController));
router.get('/:id', jwtauth, ChatroomController.getChatroomById.bind(ChatroomController));
router.post('/:id/message', jwtauth, ChatroomController.sendMessage.bind(ChatroomController));

export default router;