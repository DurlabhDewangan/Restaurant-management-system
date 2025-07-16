import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessTokenAndRefreshTokens = async(userId)=> {
   try {
      const user = await User.findById(userId)
    const accessToken =   user.generateRefreshToken()
      const refreshToken = user.generateAccessToken()

      user.refreshToken = refreshToken
     await user.save({validateBeforeSave:false})

     return{accessToken, refreshToken}

      
   } catch (error) {
      throw new ApiError(500, "something went wrong while generating refresh and access token")
   }
}



const registerUser = asyncHandler( async(req,res) => {


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

   const { username, email , phone , password} = req.body 

   if(username === ""){
    throw new ApiError(400, "name is required")
   }

   if(email === ""){
    throw new ApiError(400, "email is required")
   }
   if(phone === ""){
    throw new ApiError(400, "phone number is required")
   }
   if(password === ""){
    throw new ApiError(400, "password is required")
   }

   const existedUser = await User.findOne(
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
    username: username.toLowerCase(),
    avatar: avatar.url,
    email,
    phone,
    password
   })

 const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
)
 

 if(!createdUser){
    throw new ApiError(500, "something went wrong while registering the user")
 }


 return res.status(201).json(
    new ApiResponse(200, createdUser, "user registered succesfully")
 )




} )

const loginUser = asyncHandler(async(req,res) =>{

   // this is mine 
 //to do list 

 //get the info
 //email and password not empty
 //email and password === database email password
 //give access token and refresh token 
 //now if user come again after expiring access token 
 // we check if he having refresh token if yes 
 //then end point hit and new access token 
 //if no login again with password


 // this is sir's
// req body data
//find the user
//password check
//access and refresh token gnerate
//send cookie

const {email , password} = req.body

if (!email){
   throw new ApiError(400, "email is required")
}
if (!password){
   throw new ApiError(400, "password is required")
}

const user = await User.findOne({email})


if (!user){
   throw new ApiError(404, "User does not exist")
}

 const isPasswordValid = await user.isPasswordCorrect(password)

 if(!isPasswordValid){
   throw new ApiError(401, "Password incorrect")
 }

  const {accessToken, refreshToken} = await generateAccessTokenAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
   httpOnly: true,
   secure:true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
   new ApiResponse(
      200,
      {
         user: loggedInUser, accessToken , refreshToken
      },
      "user logged In successfully"
   )
  )



})

const logoutUser = asyncHandler(async(res,req) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshToken:undefined
         }
      },
         {
            new:true
         }
   )
 

    const options = {
   httpOnly: true,
   secure:true
  }

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200,{},"User logged Out"))

})

const refreshAccessToken = asyncHandler(async(req, res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
      throw new ApiError(401, "unauthorized request")
   }

   try {
      const decodedToken  = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
   
     const user =  await User.findById(decodedToken?._id)
   
     if(!user){
      throw new ApiError(401, "invalid refresh token")
     }
   
     if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
     }
   
     const options = {
      httpOnly:true,
      secure:true
     }
   
     const {accessToken,newRefreshToken}  = await generateAccessTokenAndRefreshTokens(user._id)
   
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
      new ApiResponse(200,{accessToken, refreshToken : newRefreshToken}, "Access toke refreshed")
     )
   } catch (error) {
      throw new ApiError(401, error?.message || "invalid refresh token")
      
   }

})


export{registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken
}