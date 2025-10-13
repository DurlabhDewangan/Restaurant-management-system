import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


    cloudinary.config({ 
        cloud_name: process.env.COUDINARY_CLOUD_NAME, 
        api_key: process.env.COUDINARY_API_KEY, 
        api_secret: process.env.COUDINARY_API_SECRET 
    });


    const uploadOnCloudinary = async (localFilePath) => {
        try{
        if(!localFilePath) return null
        //upload the file on cloudinary
     const response =  await  cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto"
           })
              //file has been uploaded successfull
              fs.unlinkSync(localFilePath)
              return response;
        } catch (error){
          fs.unlinkSync(localFilePath)// remove the locally saved temporary file as the upload operation got failed
          return null;
        }
    }


    const getCloudinaryPublicId = (url) => {
        const parts = url.split("/")
        console.log("the cloudinary url", parts)
        const fileName = parts[parts.length - 1];
         console.log("the cloudinary filename", fileName)
        const publicIdParts = fileName.split(".");
         console.log("the cloudinary publicIdParts", publicIdParts)
        const publicId = publicIdParts[0];
        console.log("the cloudinary publidId:", publicId)

    

        if(publicId){
            console.log(publicId)
        }

        return publicId;

        
    }


    
 const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      throw new Error(`Failed to delete image: ${result.result}`);
    }

    console.log("✅ Image deleted from Cloudinary:", publicId);
    return result;
  } catch (error) {
    console.error("❌ Error deleting image from Cloudinary:", error.message);
    throw error;
  }
};





    export{uploadOnCloudinary, getCloudinaryPublicId, deleteFromCloudinary}