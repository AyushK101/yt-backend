import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async function(localFilePath) {
  try {
    if(!localFilePath) return "file path not found"
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto'
    })
    console.log("file uploaded successfully", response.url)
    return response;
  } catch (error) {
      fs.unlinkSync(localFilePath) // remove the locally saved temp file if upload fails
      return "file upload FAILED";
  }
}

export { uploadOnCloudinary }
 