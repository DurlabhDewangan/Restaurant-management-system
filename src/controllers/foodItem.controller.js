import { FoodItem } from "../models/foodItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary,deleteFromCloudinary,getCloudinaryPublicId } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createFoodItem = asyncHandler(async(req , res , next) => {


    const {foodName , price , description , isAvailable , category , } = req.body

    if(foodName === ""){
        throw new ApiError(400 , "foodName is required")
    }
    if(price === ""){
        throw new ApiError(400 , "price is required")
    }
    if(description === ""){
        throw new ApiError(400 , "description is required")
    }

    if(isAvailable === ""){
        throw new ApiError(400 , "Availability is required")
    }
    if(category === ""){
        throw new ApiError(400 , "category is required")
    }

     const existedFoodItem = await FoodItem.findOne({foodName})
    if(existedFoodItem){
    throw new ApiError(409, "This foodItem already exists")
   }

    const imageLocalPath = req.file?.path;

       if (!imageLocalPath) {
        throw new ApiError(400, "imagelocalPath not found")
       }

       const image = await uploadOnCloudinary(imageLocalPath);

       
   if (!image){
    throw new ApiError(404, "image file is required")
   }

   const foodItem = await FoodItem.create({
    foodName,
    price,
    description,
    isAvailable,
    category,
    image:image.url
   })

   if(!foodItem){
    throw new ApiError(500, " something went wrong while creating foodItem")
   }

    return res.status(201).json(
    new ApiResponse(201, foodItem, "foodItem created successfully")
 )

})

const getAllFoodItems = asyncHandler(async(req,res)=>{

    const foodItems = await FoodItem.find({})

    if(!foodItems  || foodItems.length === 0){
        throw new ApiError(404, " No fooditem found")
    }

    return res.status(200).json(
        new ApiResponse(200, foodItems, "All food items are fetched")
    )
})

const getSingleFoodItem = asyncHandler(async(req,res)=>{


    const{foodName} = req.params;
    
    const foodItem = await FoodItem.findOne({foodName})

    if(!foodItem){
        throw new ApiError(404,"Food item not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200, foodItem , "foodItem is fetched"
        ))
})


const updateFoodItem = asyncHandler(async (req, res) => {
  // 1. Get ID from req.params and updated values from req.body
  // 2. Check if the food item with given ID exists in the database
  // 3. If an image file is uploaded (req.file), upload it and include the URL in the updates
  // 4. Use findByIdAndUpdate() to update the document with new values
  // 5. Return the updated food item in the response

  const {id} = req.params
  const updates = req.body
  console.log(updates)

 const existingFoodItem  = await FoodItem.findById(id)

 if(!existingFoodItem){
  throw new ApiError(404, "foodItem not found")
 }

 console.log(existingFoodItem)

 if(req.file){

   const oldImageUrl = existingFoodItem.image;
  const publicId = getCloudinaryPublicId(oldImageUrl);
  await deleteFromCloudinary(publicId); 


 const localpath = req.file.path
 const imageUpload =  await uploadOnCloudinary(localpath)
 if(!imageUpload?.url){
  throw new ApiError(400, "Image upload failed")
 }

 updates.image = imageUpload.url
 }

 const updatedFoodItem = await FoodItem.findByIdAndUpdate(id , updates, {
  new:true,
  runValidators:true,
 })

 console.log(updatedFoodItem)

 res.status(200).json(new ApiResponse(200 , updatedFoodItem , "You food card is updated now !!!"))


});

 const deletedFoodItem = asyncHandler(async(req,res) =>{

    //get id in params
    //check id = db id (foodItem existing or not)
    //delete the image from cloudinary
    //delete the foodItems from mongodb
    //success res and deleted food Item


    const {id} = req.params
    const existingFoodItem = await FoodItem.findById(id);
    if(!existingFoodItem){
        throw new ApiError(404,"foodItem not found")
    }

   const imageUrl =  existingFoodItem.image
  const  publicId = getCloudinaryPublicId(imageUrl)
 const  deletedImage = await deleteFromCloudinary(publicId);
  console.log("This image is deleted from cloudinary while deleting foodItem from mongo:::",deletedImage)

  const deletedFoodItem = await FoodItem.findByIdAndDelete(id)

  res.status(200).json(new ApiResponse(200, deletedFoodItem, "Food Item is deleted successfully"))


 })










export{createFoodItem, getAllFoodItems, getSingleFoodItem, updateFoodItem,deletedFoodItem
}


