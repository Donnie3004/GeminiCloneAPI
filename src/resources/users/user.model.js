import { v4 as uuidv4 } from 'uuid';

export default class UserModel {
  constructor(_id, _name, _mobileNo, _password) {
    this.id = _id;
    this.name = _name;
    this.mobileNo = _mobileNo;
    this.password = _password;
  }

  static getCurrentUser(){
    return users;
  }

  static checkUserByMobileNo(_mobileNo){
    const user_found = users.find(obj => obj.mobileNo === _mobileNo);
    return user_found;
  }

  static userSignUp(userObj){
    const new_user = new UserModel(uuidv4(), userObj.name, userObj.mobile, userObj.password);
    users.push(new_user);
    return new_user;
  }


  static changePassword(_userID, newPassword){
    let user_found = users.find(obj => obj.id === _userID);
    if(!user_found){
      return user_found;
    }
    console.log("Model ::::: ", user_found);
    user_found.password = newPassword;
    console.log("Model ::::: ", user_found);
    return user_found; 
  }

}

let users = [];