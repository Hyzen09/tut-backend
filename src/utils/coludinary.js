import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret:CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uplodeOnCloudinary = async(localFilePath)=>{
    try{
        if(!localFilePath) return null
        const responce = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto',
        })
        //file has been uploaded sucessfully
        console.log("file is uploaded sucessfully",responce.url);
        return responce
    }catch(error){
        fs.unlinkSync(localFilePath) //REMPVE THE LOCALY SAVED temp FILE as the upload opeeration got failed 
    }
}

export {uplodeOnCloudinary}