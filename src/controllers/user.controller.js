import { asyncHandler } from "../utils/asyncHandler.js" 
import { ApiError } from "../utils/ApiError.js" 
import { User } from "../models/user.model.js" 
import { uploadOnCloudinary } from "../utils/cloudinary.js" 
import { ApiResponse } from "../utils/ApiResponse.js" 
import jwt from "jsonwebtoken" 
import { cloudinaryDeleteImg } from "../utils/cloudinaryDeleteImg.js"
import mongoose from "mongoose"


const generateAccessAndRefreshToken = async function(userId) {
  try {
    const user = await User.findById(userId)    
    const refreshToken = user.generateRefreshToken() 
    const accessToken = user.generateAccessToken() 
    
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500,"something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user data from frontend
  // validation
  // check if already exist : username + email
  // check for images,  check for avatar :
  // if available then upload to cloudinary, avatar
  // create user object - create entry in DB
  // remove password and refresh token field from response
  // check for user creation
  // return response
  const { fullName, username, email, password } = req.body 

  if (
    [fullName, username, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required") 
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  })

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists!") 
  }

  const avatarLocalPath = req?.files?.avatar?.[0]?.path 
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path 
  
  // console.log(req.files)
  // let coverImageLocalPath 
  // if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ) {
  //   coverImageLocalPath = req.files.coverImage[0].path
  // }

  if (!avatarLocalPath) throw new ApiError(400, "avatar file is required") 

  const avatar = await uploadOnCloudinary(avatarLocalPath) 
  const coverImage = await uploadOnCloudinary(coverImageLocalPath) 

  if (!avatar.url) 
    throw new ApiError(400, "avatar upload failed") 

  const user = await User.create({
    username: username.toLowerCase(),
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password: password,
  }) 

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ) 
  if (!createdUser)
    throw new ApiError(500, "something went wrong while registering the user") 

  // here return has not effect
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "user registered successfully")) 
}) 


const loginUser = asyncHandler( async( req, res)=> {
  //req.body => data
  //username or email based
  // user exist or not if not return 'user not found'
  //check password , if not return 'wrong password'
  //access and refresh token
  //send cookie
  
  const { username, email, password} = req.body

  if( !username && !email ) 
    throw new ApiError(400,"username or email is required ")  

  const user = await User.findOne({
    $or: [{username},{email}]
  })

  if(!user)
    throw new ApiError(404,"user does not exist")

  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid)
    throw new ApiError(404,"password is not valid")

  const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

  // here we can either update our user or make a new call
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  // cookies only modifiable from server 
  const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .cookie("accessToken",accessToken, options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken
      },
      'user logged in successfully'
    )
  )
})

const logoutUser = asyncHandler( async function(req, res) {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true // response will have new/updated value
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200,{},"User logged out successfully"))
})

const refreshAccessToken = asyncHandler( async (req, res)=>{
  // taking refreshToken from cookie of user's request
  // find user with the refresh token in db
  // if user is not found give register route
  // if user is found verify refresh token 
  // then call generateRefreshAndAccessToken
  const incomingRefreshToken = req?.cookies?.refreshToken || req?.header("Authorization")?.replace("bearer ","")
  if(!incomingRefreshToken)
    throw new ApiError(401,"unauthorized request as token is not valid")
  
  let decodedToken 
  try { //todo as jwt.verify don't return undefined but throw error . for capturing error use try/catch 
    decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  } catch (error) {
    throw new ApiError(401, error?.message || "unauthorized request as token verification failed") 
  }
  
  let user 
  try {
    user = await User.findById(decodedToken?._id) 
  } catch (error) {
    throw new ApiError(500,"invalid refresh token as user not found ")
  }

  if(incomingRefreshToken != user.refreshToken )
    throw new ApiError(401,"refresh token is expired or used") 
  
  const options = {
    httpOnly: true,
    secure: true
  }
  
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(
    200,
    {
      accessToken,
      refreshToken
    },
    "accessToken and refreshToken area refreshed",
  ))






}) 

const changeCurrentUserPassword = asyncHandler( async (req, res)=>{
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user?._id) //! due to auth middleware , req.user is added to req already
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword) 
  if(!isPasswordCorrect)
    throw new ApiError(409,"password is incorrect")
  
  user.password = newPassword
  const response = await user.save({validateBeforeSave: false}) // only save method will call save pre hook which will call bcrypt.hash() 
  if(!response)
    throw new ApiError(500,"password update failed")

  return res.status(200)
  .json(new ApiResponse(
    200,
    newPassword,
  ),
  "password updated successfully"
  ) 


})

const getCurrentUser = asyncHandler( async (req, res)=>{

  res.status(200).
  json(new ApiResponse(
    200,
    req.user,
    "current user fetched successfully"
  )
  )
})

const updateAccountDetails = asyncHandler( async(req, res)=>{
  const {fullName, email, } = req.body
  if( !fullName || !email)
    throw new ApiError(400,"all fields are required",)

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName || req.user?.fullName,
      email: email || req.user?.email
      }
    },
    {
      new: true
    }
  ).select("-password")

  return res.status(200)
  .json(new ApiResponse(
    200,
    updatedUser,
    "account detail updated successfully"
  ))

  
    
    
})

const updateUserAvatar = asyncHandler( async (req, res)=>{
  //route +> ('/update-user-avatar',multer, jwtVerify )
  const prevAvatarUrl = req.user?.avatar

  const avatarLocalPath = req?.file?.path
  if(!avatarLocalPath)
    throw new ApiError(400,"avatar file not found")

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url)
    throw new ApiError(400,"avatar upload failed while updating avatar")

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { 
      new: true
    }
  ).select("-password")

  const deleteAvatarResponse = await cloudinaryDeleteImg(prevAvatarUrl)
  if(deleteAvatarResponse.result != 'ok')
    throw new ApiError(
      400,
      "failed to delete prevAvatar from cloudinary"
    )
  console.log(`deleteAvatarResponse: `,deleteAvatarResponse)

  return res.status(200)
  .json(new ApiResponse(
    200,
    user
  ),
  "avatar updated successfully"
  )
})

const updateUserCoverImage = asyncHandler( async(req, res)=>{
  const prevCoverImageUrl = req.user?.coverImage

  const coverImageLocalPath = req?.file?.coverImage
  if(!coverImageLocalPath)
    throw new ApiError(400,"coverImage file is missing")

  const coverImage =  await uploadOnCloudinary(coverImageLocalPath)
  if(!coverImage.url)
    throw new ApiError(400,"failed to upload coverImage on cloudinary while updating coverImage")

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    {
      new: true
    }
  ).select("-password")

  const deleteCoverImageResponse = await cloudinaryDeleteImg(prevCoverImageUrl)
  if(deleteCoverImageResponse.result != 'ok')
    throw new ApiError(
      400,
      "failed to delete prevCoverImage from cloudinary"
    )
  console.log(`deleteCoverImageResponse: `,deleteCoverImageResponse)

  return res.status(200)
  .json(new ApiResponse(
    200,
    user
  ),
  "coverImage updated successfully"
  )
})

const getUserChannelProfile = asyncHandler( async(req, res)=>{
  const { username } = req.params
  if(!username?.trim())
    throw new ApiError(
      400,
      "searched user is invalid"
  )

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        subscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: {$in: [req.user?._id, "$subscriber.subscriber"]}, // in can go and watch in arrays and objects both
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        avatar: 1,
        coverImage: 1,
        username: 1,
        fullName: 1,
        subscribedToCount: 1,
        subscribersCount: 1,
        isSubscribed: 1,
        email: 1,

      }
    }
  ])

  console.log(`channel: ${channel}`)

  if(!channel?.length)
    throw new ApiError(
      404,
      "channel does not exist"
  )
  
  return res.status(200)
  .json(new ApiResponse(
    200,
    channel[0],
    "user channel fetched successfully"
  ))

})

const getWatchHistory = asyncHandler( async(req, res)=>{
  
  const user = User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.user._id) // as mongoose don't implicitly convert idString to objectId(string) in aggregate.
      }
    },
    {
      $lookup: { //  result of this lookup will embed the related video documents into the watchHistory array.
        from : "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [ 
          {
            $lookup: { // After this lookup, the watchHistory array will now contain an owner field for each video, which is an array of one object, containing the selected fields.
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [ 
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner" // extract first element(obj) of owner array and then replace owner with that.  
              }
            }
          }
        ]
      }
    }
  ])

  console.log(`user in getWatchHistory: ${user}`)

  return res.status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory
    ),
    "user's watch history fetched successfully"
  )
})



export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentUserPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,

 } 
