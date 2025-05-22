import { v2 as cloudinary } from 'cloudinary'
import { ApiError } from './ApiError.js';
import dotenv from 'dotenv'


dotenv.config()

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const cloudinaryDelete = async (url)=> {
  // console.log(url)
  console.log("inside delete")
  if(!url)
    throw new ApiError(
      400,
      "url to delete previous file from cloudinary is invalid"
    )
  let arr = url.split('/')
  // let public_id;
  // if( arr[7] == '.png') 
  //   public_id = arr[7].replace(".png","")
  // } else if ( arr[7] == '.jpg') {
  //   public_id =arr[7].replace(".jpg","")
  // } else if ( arr[7] == '.mp4' ) {
  //   public_id = arr[7].replace(".mp4","")
  // }
  
  let public_id = arr[arr.length -1 ].split(".")[0]
  console.log(public_id)
  let extension = arr[arr.length -1 ].split(".")[1]
  console.log(extension)  
  if( extension == 'mp4') {
    const response = await cloudinary.uploader.destroy(public_id, {resource_type: 'video'}, (error, result) => {
      if (error) {
        console.error('Error deleting video:', error);
      } else {
        console.log('Video deleted successfully:', result);
      }
    });
    return response
  } else {
    const response = await cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        console.error('Error deleting video:', error);
      } else {
        console.log('Video deleted successfully:', result);
      }
    });
    return response
  }

  
}
