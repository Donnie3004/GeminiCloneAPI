import dotenv from 'dotenv';
import stripe from '../../config/stripe.config.js';
import UserRepo from '../users/user.repository.js';
import CustomError from '../../utils/customError.js';
dotenv.config();


export default class WebhookController {

  constructor() {
    this.handleWebhook = this.handleWebhook.bind(this);
  }

  async handleWebhook (req, res, next)  {
    console.log("Inside worker controller..!");
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new CustomError(`Webhook Error: ${err.message}`, 400);
    }

    console.log(event);



    switch (event.type) {
      case 'customer.subscription.created':{
        try {
          const userRepoObj = new UserRepo();
          const mob_obj = await userRepoObj.getMobileNoForHook(event.data.object.customer); 
          const mobile = mob_obj.mobile;
          if (!mobile) {
            console.error("No mobile number found in session metadata");
            throw new CustomError('Missing mobile number', 400);
          }
          await userRepoObj.updateSubscriptionId(mobile, event.data.object.id);
        } catch (dbErr) {
          console.error('DB update failed:', dbErr.message);
          return res.status(500).send('Internal DB Error');
        }
        break;
      }
      case 'invoice.payment_succeeded' :{
        const mobile = event.data.object.customer_phone;
        if (!mobile) {
          console.error("No mobile number found in session metadata");
          throw new CustomError('Missing mobile number', 400);
        }
        try {
          const userRepoObj = new UserRepo();
          await userRepoObj.updateSubscriptionStatus(mobile);
        } catch (error) {
          console.error("No mobile number found in session metadata");
          throw new CustomError('Missing mobile number', 400);
        }
        break;
      }
    }
    return res.status(200).json({ received: true });
  }
}