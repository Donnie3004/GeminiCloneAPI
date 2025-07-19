import dotenv from 'dotenv';
import stripe from '../../config/stripe.config.js';
import UserRepo from '../users/user.repository.js';

dotenv.config();


export default class WebhookController {

  constructor() {
    this.handleWebhook = this.handleWebhook.bind(this);
  }

  async handleWebhook (req, res, next)  {
    console.log("insidie webhook..!");
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      // Construct and verify the event
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      console.log("Event : " , event);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful subscription payment
    if (event.type === 'invoice.payment_succeeded') {
      const session = event.data.object; 

      // Get the mobile number from metadata
      const mobile = session.customer_phone;
      console.log("Mobileeeeeeeee: ", mobile);
      if (!mobile) {
        console.error("No mobile number found in session metadata");
        return res.status(400).send("Missing mobile number");
      }

      try {
        const userRepoObj = new UserRepo();
        await userRepoObj.updateSubscriptionStatus(mobile);
      } catch (dbErr) {
        console.error('DB update failed:', dbErr.message);
        return res.status(500).send('Internal DB Error');
      }
    }

    return res.status(200).json({ received: true });
  }
}
