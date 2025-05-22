import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video"
    }
  ]
},{timestamps: true})

export const Playlist = mongoose.model("Playlist",playlistSchema)