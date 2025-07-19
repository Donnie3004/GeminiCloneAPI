import express from 'express';
import userRouter from './src/resources/users/user.routes.js';
import errorHandler from './src/middlewares/errorHandler.js';
import paymentRouter from './src/resources/payment/payment.routes.js';
import { pool } from './src/config/db.config.js';
import chatroomRouter from './src/resources/chatroom/chatroom.routes.js';
// import webhookRouter from './src/resources/webhook/webhook.routes.js';
import bodyParser from 'body-parser';
import webhookController from './src/resources/webhook/webhook.controller.js';


const app = express();
const port = 3000;

const WebhookController = new webhookController();
app.post('/webhook', express.raw({ type: 'application/json' }), WebhookController.handleWebhook);
// app.use('/webhook', webhookRouter);

app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.use('/', userRouter);
app.use('/chatroom', chatroomRouter);
app.use('/payment', paymentRouter);

app.use(errorHandler);

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log("PostgreSQL connected successfully...!");
    app.listen(port, () => {
        console.log(`Application started at port ${port}`);
    });
    
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error);
    process.exit(1); // Exit the app if DB connection fails
  }
}
startServer();