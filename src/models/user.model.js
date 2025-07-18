import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
  username: {
  type: String,
  unique:true,
  required: true,
  minlength: 3,
  maxlength: 30,
},

 email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
 },
   phone: {
  type: String,
  required: true,
  unique: true,
  trim: true,
 },

  avatar:{
    type:String,
    default:null
  },
  role:{
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  password:{
    type:String,
    required:[true, 'password is required']
  },
  refreshToken:{
    type:String,
    default:null,
  }

    }
,{
    timestamps:true
}
)

userSchema.pre("save",  async function (next) {
  if(this.isModified("password")){  this.password = await bcrypt.hash(this.password, 10)
  next()}
else{
  return next()
}  
})

userSchema.methods.isPasswordCorrect = async function (password) {
 return await bcrypt.compare(password, this.password)
  
}

userSchema.methods.generateAccessToken = function(){
 return jwt.sign({
    _id:this._id,
    email:this.email,
    username:this.username,
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn:  process.env.ACCESS_TOKEN_EXPIRY
  }
)
}
userSchema.methods.generateRefreshToken = function()
{
 return jwt.sign({
    _id:this._id,
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn:  process.env.REFRESH_TOKEN_EXPIRY
  }
)

}




export const User = mongoose.model("User" , userSchema)