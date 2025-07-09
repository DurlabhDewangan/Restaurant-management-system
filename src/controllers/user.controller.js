import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req,res) => {

    // this is my 
   //we provide form to our user
   //detail fill and post 
   // check if username , password  , mobile , email is available or not 
   //then validate with otp
   //opt fill 
   //registered successfully

   //now sir
   //get user details from frontend
   //validation - not empty
   //check if user already exists:username, email
   //check for image
   //upload them to cloudinary
   // create user object - create entry db
   //remove password and refresh token field from response
   // check for user creation 
   //return response

   const {username, fullname, email , phone , password} = req.body 
   console.log("email:" , email , "phone", phone);

   if(fullname = ""){
    throw new ApiError(400, "fullname is required")
   }
   if(username= ""){
    throw new ApiError(400, "username is required")
   }
   if(email = ""){
    throw new ApiError(400, "email is required")
   }
   if(phone = ""){
    throw new ApiError(400, "phone number is required")
   }
   if(password = ""){
    throw new ApiError(400, "password is required")
   }

   const existedUser = User.findOne(
    {$or:[{username},{email}]}
   )

   if(existedUser){
    throw new ApiError(409, "User with email or username already exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;

   if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if (!avatar){
    throw new ApiError(404, "Avatar file is required")
   }

   const user = await User.create({
    fullname,
    avatar: avatar.url,
    email,
    password,
    username: username.toLowerCase()

   })

 const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
)

 if(!createdUser){
    throw new ApiError(500, "something went wrong while registering the user")
 }




} )

export{registerUser}