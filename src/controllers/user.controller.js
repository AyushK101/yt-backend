import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js'
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
  const { fullName, username, email, password } = req.body;
  if (
    [fullName, username, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exists!");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "avatar file is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) throw new ApiError(400, "avatar upload failed");

  const user = await User.create({
    username: username.toLowerCase(),
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "" ,
    email: email,
    password: password
  })

  const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if(!createdUser) throw new ApiError(500,"something went wrong while registering the user")

  return res.status(200).json(
    new ApiResponse(200,createdUser,"user registered successfully")
  )

});

export { registerUser };
