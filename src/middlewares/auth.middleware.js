// will verify if user is present or not 
import { ApiError } from '../utils/ApiError.js'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';

dotenv.config()

export const verifyJwt = async ( req, _, next) => {
  try {
    // optional chaining for mobile as they don't have cookies
    const accessToken = req?.cookies?.accessToken || req?.header("Authorization")?.replace("bearer ","")
    if(!accessToken)
      throw new ApiError(404,'unauthorized request') 
  
    let decodedToken;
    try {
      decodedToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        throw new ApiError(401,"unauthorized access: accessToken verification failed")      
    }
    
    const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    if(!user)
      throw new ApiError(401,"invalid accessToken")
  
    req.user = user
    next()
  } catch (error) {
    next(new ApiError(401,error?.message+" or user logged out already" || "invalid access token"))  
  }
}
