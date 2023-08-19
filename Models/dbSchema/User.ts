import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    unique: true
  },
  password: {
    type: String,
    require: true,
  },
  collectionOwned: [
    String
  ],
  collectionShared: [
    String
  ]
})





export const User = mongoose.model("user", userSchema)
