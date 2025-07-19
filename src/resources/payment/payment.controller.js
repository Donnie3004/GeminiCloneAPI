import { pool } from "../../config/db.config.js";
import stripe from "../../config/stripe.config.js";
import dotenv from 'dotenv';
import CustomError from "../../utils/customError.js";
import UserRepo from "../users/user.repository.js";
import WebhookController from "../webhook/webhook.controller.js";
dotenv.config();

export default class PaymentController{

  async createProSubscription(req, res, next){
    try {
      const userId = req.user.id; // From JWT middleware
      const mobile = req.user.mobile;
      const userRepoObj = new UserRepo();
      
      const user = await userRepoObj.checkUserExists(mobile);

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Check if user already has active subscription
      if (user.StripSubscription === 'Pro') {
        throw new CustomError("User already have pro subscription", 400);
      }

      // Create or retrieve Stripe customer
      let customer;
      if (user.subscription_id) {
        customer = await stripe.customers.retrieve(user.subscription_id);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          phone: user.mobile,
          metadata: {
            userId: userId.toString()
          }
        });
        await userRepoObj.updateSubscription(userId,customer.id);
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: process.env.STRIPE_PRO_PRICE_ID, // your Stripe Price ID for Pro Plan
            quantity: 1,
          },
        ],
        customer: customer.id, // required for Stripe customer creation
        metadata: {
          mobile: user.mobile,
        },
        success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/cancel`,
      })

      console.log(session);

      return res.status(200).json({
        success: true,
        data: {
          sessionId: session.id,
          customerId: customer.id,
          paymentURL: session.url
        }
      });

    } catch (error) {
      console.error('Subscription creation error:', error);
      next(error);
    }
  }

  async getSubscriptionStatus(req, res){
    try {
      const mobile = req.user.mobile;
      const userRepoObj = new UserRepo();
      const user = await userRepoObj.checkUserExists(mobile);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      let subscriptionDetails = null;
      
      if (user.subscription_id) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
          subscriptionDetails = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            currentPeriodStart: subscription.current_period_start,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          };
        } catch (stripeError) {
          console.error('Error fetching Stripe subscription:', stripeError);
        }
      }

      res.json({
        success: true,
        data: {
          tier: user.subscriptionTier || 'basic',
          status: user.subscriptionStatus || 'inactive',
          dailyMessageCount: user.dailyMessageCount || 0,
          dailyLimit: user.subscriptionTier === 'pro' ? null : 5,
          subscriptionDetails
        }
      });

    } catch (error) {
      console.error('Get subscription status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get subscription status',
        error: error.message 
      });
    }
  }
  
}
