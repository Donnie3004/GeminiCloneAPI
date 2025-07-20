import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserRepo from '../resources/users/user.repository.js';
import CustomError from '../utils/customError.js';
dotenv.config();

const jwtauth = async (req, res, next) => {
  if(req.headers && req.headers.authorization){
    const [authType, token] = req.headers.authorization.split(" ");
    if(authType == 'Bearer'){
      try {
        let payload = jwt.verify(token, process.env.SECRET_KEY);
        
        const userRepoObj = new UserRepo();
        let user_still_exists = await userRepoObj.checkUserExists(payload.mobile);
        
        if(!user_still_exists){
          throw new CustomError('user not found', 400);
        }
        
        req.user = user_still_exists;
        next();
      } catch (error) {
        console.error(error);
        throw new CustomError("Unauthorized", 401);
      }
    } 
  } else {
    throw new CustomError('Kindly login with correct credentials', 400);
  }
}


export default jwtauth;