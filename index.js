import express from 'express';
import userRouter from './src/resources/users/user.routes.js';
import errorHandler from './src/middlewares/errorHandler.js';

const app = express();
const port = 3000;

app.use(express.urlencoded({extended:true}));
app.use(express.json());



app.use('/', userRouter);
app.use(errorHandler);

app.listen(port, (err)=>{
  if(err){
    console.error(err);
  }
  console.log(`Application started at port ${port}`);
})