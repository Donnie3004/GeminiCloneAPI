import express from 'express';
import userRouter from './src/resources/users/user.routes.js';
import errorHandler from './src/middlewares/errorHandler.js';
import { pool } from './src/config/db.config.js';
import chatroomRouter from './src/resources/chatroom/chatroom.routes.js';
const app = express();
const port = 3000;

app.use(express.urlencoded({extended:true}));
app.use(express.json());



app.use('/', userRouter);
app.use('/chatroom', chatroomRouter);
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