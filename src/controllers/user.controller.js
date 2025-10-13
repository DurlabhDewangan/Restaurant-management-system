import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessTokenAndRefreshTokens = async(userId)=> {
   try {
      const user = await User.findById(userId)
    const accessToken =   user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
     await user.save({validateBeforeSave:false})

     return{accessToken, refreshToken}

      
   } catch (error) {
      throw new ApiError(500, "something went wrong while generating refresh and access token")
   }
}



const registerUser = asyncHandler( async(req,res) => {

   //get user details from frontend
   //validation - not empty
   //check if user already exists:username
   //check for image
   //upload them to cloudinary
   // create user object - create entry db
   //remove password and refresh token field from response
   // check for user creation 
   //return response

   const { username, phone , password} = req.body 

   if(username === ""){
    throw new ApiError(400, "name is required")
   }

   if(phone === ""){
    throw new ApiError(400, "phone number is required")
   }
   if(password === ""){
    throw new ApiError(400, "password is required")
   }

   const existedUser = await User.findOne(
    {phone}
   )

   if(existedUser){
    throw new ApiError(409, "User with mobile number already exists")
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

 //to do list 

 //req body data
 // validation - phone and password not empty
 // find user
 // phone and password === database's phone, password
 // access token and refresh token generate
 //send cookie


const {phone , password} = req.body

if (!phone){
   throw new ApiError(400, "phone is required")
}
if (!password){
   throw new ApiError(400, "password is required")
}

const user = await User.findOne({phone})


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

const logoutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset:{
            refreshToken:1
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
   
     const {accessToken,refreshToken}  = await generateAccessTokenAndRefreshTokens(user._id)
   
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
      new ApiResponse(200,{accessToken, refreshToken : refreshToken}, "Access token refreshed")
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