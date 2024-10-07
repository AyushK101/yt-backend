import { asyncHandler } from '../utils/asyncHandler.js';
import { Video } from '../models/video.model.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { cloudinaryDelete } from '../utils/cloudinaryDelete.js';

const uploadVideo = asyncHandler( async (req, res)=>{
  // using multer uploading video and thumbnail to DiskStorage 
  // then taking their path and uploading on cloudinary 
  // first uploading thumbnail , then video
  // if video upload fails then deleting thumbnail from cloudinary and throwing error bcz either both or nothing
  const videoLocalPath = req?.files?.video?.[0]?.path
  const thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path
  const { title, description } = req.body
  if(!title)
    throw new ApiError(400,"title is required")
  if(!videoLocalPath)
    throw new ApiError(400,"video is required")
  if(!thumbnailLocalPath)
    throw new ApiError(400,"thumbnail is required")


  const thumbnailResponse  = await uploadOnCloudinary(thumbnailLocalPath)
  if(!thumbnailResponse.url)
    throw new ApiError(404,"failed to upload video on cloudinary")

  const videoResponse = await uploadOnCloudinary(videoLocalPath)
  if(!videoResponse.url) {
    const thumbnailDeleteResponse = await uploadOnCloudinary(thumbnailResponse.url)
    if(!thumbnailDeleteResponse)
      throw new ApiError(400,"failed to delete thumbnail after video upload failed")
    throw new ApiError(404,"failed to upload video and deleting respective thumbnail also")
  }

  // now have to add to video collection with the owner filed as owner.user._id
  // { title, thumbnail, videoFile , duration: videoResponse.duration,  }
  const videoDocCreateResponse = await Video.create({
    title: title,
    thumbnail: thumbnailResponse.url,
    duration: videoResponse.duration,
    description: description || "description is not provided by user",
    isPublished: true, //! create public or private functionality
    views: 0, //! create views count functionality
    videoFile: videoResponse.url,
    owner: req.user?._id
  })
  

  return res.status(200)
  .json(new ApiResponse(
    200,
    {
      videoDocCreateResponse,
      videoResponse,
      thumbnailResponse
    },
      "video and thumbnail uploaded"
  ))

})

const deleteVideo = asyncHandler( async (req, res)=>{
  const { videoId } = req.params
  if(!videoId)
    throw new ApiError(400,"videoId is required")

  const video = await Video.findById(videoId)
  //! ownership check is also required 
  if(req.user?._id != video?.owner)
    throw new ApiError(404,"unauthorized operation!")

  if(!video)
    throw new ApiError(400,"requested video not found")

  const videoUrl = video.videoFile
  const thumbnailUrl = video.thumbnail
  console.log(videoUrl)
  console.log(thumbnailUrl)
  const videoDelResponse = await cloudinaryDelete(videoUrl)
  console.log(videoDelResponse)
  if(videoDelResponse.result != "ok")
    throw new ApiError(400,"failed to remove video from cloudinary")
  
  const thumbnailDelResponse = await cloudinaryDelete(thumbnailUrl)
  if(thumbnailDelResponse.result != "ok")
    throw new ApiError(400,"failed to delete video's thumbnail from cloudinary")

  const videoDelResponseDb = await Video.deleteOne({
    _id: video._id
  })
  console.log(videoDelResponseDb)
  if( videoDelResponseDb.acknowledged != true)
    throw new ApiError(400,"failed to delete video from database")

  return res.status(200)
  .json(new ApiResponse(
    200,
    {
      video,
      videoDelResponse,
      thumbnailDelResponse,
      videoDelResponseDb
    },
    "video deleted successfully"
  ))





})

const getVideos = asyncHandler( async (req, res)=>{
  const allVideos = await Video.find({})
  if(allVideos.length == 0) {
    res.status(200).send(new ApiResponse(
      200,
      allVideos,
      "no video available"
    ))
  }

  res.status(200)
  .json(new ApiResponse(
    200,
    allVideos,
    "all videos fetched successfully"
  ))

})

const getVideoById = asyncHandler( async(req, res)=>{
  // take id of the video clicked by user from grid of videos displayed
  const { videoId } = req.params
  if(!videoId)
    throw new ApiError(400,"videoIs is not valid")

  const video = await Video.find({ _id: videoId})
  if(!videoId)
    throw new ApiError(400," request video not found")

  res.status(200)
  .json(new ApiResponse(
    200,
    video,
    "request video fetched successfully"
  ))

})

//only title and description , video and thumbnail can also be updated but not now 
const updateVideo = asyncHandler( async(req, res)=>{
  const { videoId } = req.params
  const { title, description } = req.body

  if( title?.length == 0 && description?.length == 0 )
    throw new ApiError(404," title and description cannot be empty")
  
  const oldVideo = await Video.findOne({_id: videoId})
  console.log(oldVideo)
  console.log(req.user?._id , oldVideo?.owner)
  if(!req.user?._id.equals(oldVideo?.owner) )
    throw new ApiError(404,"unauthorized operation!")

  const updatedVideo = await Video.updateOne(
    {
      _id: oldVideo._id
    },
    {
      $set: {
        title: title || oldVideo.title,
        description: description || oldVideo.description
      }
    }
  )
  
  res.status(200)
  .json(new ApiResponse(
    200,
    updatedVideo,
    "video updated successfully"
  ))

})





export {
  uploadVideo,
  deleteVideo,
  getVideos,
  getVideoById,
  updateVideo
}