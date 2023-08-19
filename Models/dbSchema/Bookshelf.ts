import mongoose from "mongoose";

const bookshelfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  numberOfBooks: { type: Number, required: true },
  filledPlaces: [Boolean], // to show pictures on
  books: [String],
  parentCollection: { type: String, required: true }
})

export const Bookshelf = mongoose.model("Bookshelf", bookshelfSchema)

