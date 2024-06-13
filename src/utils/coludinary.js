import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuring cloudinary with the provided environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, name) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });

        // File has been uploaded successfully
        console.log("File is uploaded successfully:", response);
        fs.unlinkSync(localFilePath);
            console.log(`Temporary file ${localFilePath} has been deleted.`);
        return response;
    } catch (error) {
        console.error(`File upload failed for ${name}:`, error);

        if (fs.existsSync(localFilePath)) {
            // Remove the locally saved temp file if it exists
            fs.unlinkSync(localFilePath);
            console.log(`Temporary file ${localFilePath} has been deleted.`);
        }

        return null;
    }
};

export { uploadOnCloudinary };
