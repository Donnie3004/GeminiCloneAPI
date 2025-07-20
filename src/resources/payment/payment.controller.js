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
      if (user.StripeCustomerID) {
        customer = await stripe.customers.retrieve(user.StripeCustomerID);
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

  async getSubscriptionStatus(req, res, next){
    try {
      const mobile = req.user.mobile;
      const userRepoObj = new UserRepo();
      const user = await userRepoObj.checkUserExists(mobile);

      if (!user) {
        throw new customElements('User not found', 404);
      }

      let subscriptionDetails = null;
      
      console.log(user);
      
      if (user.StripeSubscriptionID) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.StripeSubscriptionID);
          subscriptionDetails = {
            id: subscription.id,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          };
        } catch (stripeError) {
          console.error('Error fetching Stripe subscription:', stripeError);
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          tier: user.subscription_tier || 'Basic',
          dailyLimit: user.subscription_tier === 'Pro' ? "No Limit" : 5,
          subscriptionDetails
        }
      });

    } catch (error) {
      console.error('Get subscription status error:', error);
      next(error);
    }
  }
  
}
