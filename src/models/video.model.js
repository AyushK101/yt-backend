import mongoose, { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const VideoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String, // cloudinary url
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  duration: {
    type: Number, // cloudinary url
    required: true,
  },
  videoFile: {
    type: String, // cloudinary url
    required: true
  },
  description: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true,
    required: true
  }
},{
  timestamps: true,
  _id: true,
})

VideoSchema.plugin(mongooseAggregatePaginate)

export const Video = model("Video",VideoSchema)