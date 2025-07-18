import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserRepo from '../resources/users/user.repository.js';
dotenv.config();

const jwtauth = async (req, res, next) => {
  // Read from headers
  if(req.headers && req.headers.authorization){
    const [authType, token] = req.headers.authorization.split(" ");
    if(authType == 'Bearer'){
      // decode the token
      try {
        let payload = jwt.verify(token, process.env.SECRET_KEY);
        // check whether the user is same or not been deleted from DB;
        const userRepoObj = new UserRepo();
        let user_still_exists = await userRepoObj.checkUserExists(payload.mobile);
        if(!user_still_exists){
          return res.status(400).json({
            success:false,
            message:'user not found'
          });
        }
        req.user = user_still_exists;
        console.log(req.user);
        next();
      } catch (error) {
        console.error(error);
        return res.status(401).json({
          success:false,
          message:'Unauthorized'
        })
      }
    } 
  } else {
    return res.status(400).json({
        success:false,
        message:'Kindly login with correct credentials'
    });
  }
}


export default jwtauth;