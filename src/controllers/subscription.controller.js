
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Subscription } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';
import { ApiResponse } from '../utils/ApiResponse.js'
const userSubscribed = asyncHandler( async (req,res)=>{
  // user is verified so we have req.user in req object
  // we are on route api/v1/users/c/:username , we have username of channel which we want to subscribe
  // so we will make a document/entry in subscriptions collection/table { channel: username._id , subscriber: req.user._id }
  const { username } = req.params
  if(!username)
    throw new ApiError(400,"channel's username is invalid")
  console.log(username)
  const channel = await User.findOne({ username: username })
  console.log(channel)
  if(!channel)
    throw new ApiError(400,"channel does not exist ")

  const subscribed = await Subscription.create({
    channel: channel._id,
    subscriber: req?.user?._id
  })
  if(!subscribed)
    throw new ApiError(400,"failed to create a subscriber document")

  return res.status(200)
  .json(new ApiResponse(
    200,
    subscribed,
    "user subscribed to channel successfully"
  ))
})

const userUnsubscribed = asyncHandler( async(req, res)=>{
  // user is verified , so we have req.user._id
  // we will find channel's id from /users/c/:username url's username
  // then we will findAnd delete the subscription document which is { channel: username._id, subscriber: req.user._id}
  const { username } = req.params
  if(!username)
    throw new ApiError(400,"username is not invalid")

  const channel = await User.findOne({ username: username})
  if(!channel)
    throw new ApiError(400,"channel not found in db")

  const response = await Subscription.findOneAndDelete({
    channel: channel._id,
    subscriber: req?.user?._id
  })
  if(!response)
    throw new ApiError(400," failed to delete subscription document/entry in Subscription Collection/table")

  return res.status(200)
  .json(new ApiResponse(
    200,
    response,
    "channel unsubscribed successfully"
  ))
})










export {
  userSubscribed,
  userUnsubscribed
}