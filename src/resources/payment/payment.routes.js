import express from 'express';
import jwtauth from '../../middlewares/jwt.config.js';
import paymentController from './payment.controller.js';
const router = express.Router();


const PaymentController = new paymentController();
router.post('/subscribe/pro', jwtauth, PaymentController.createProSubscription);
router.get('/subscription/status',jwtauth, PaymentController.getSubscriptionStatus);

export default router;