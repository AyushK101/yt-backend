import { v2 as cloudinary } from 'cloudinary'
import { ApiError } from './ApiError.js';
import dotenv from 'dotenv'


dotenv.config()

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const cloudinaryDeleteImg = async (url)=> {
  if(!url)
    throw new ApiError(
      400,
      "url to delete previous file from cloudinary is invalid"
    )
  let arr = url.split('/')
  let public_id = arr[7].replace(".png","")

  const response = await cloudinary.uploader.destroy(public_id, {
    resource_type: 'image'
  })
  return response
}
