import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    pageNumber: { type: Number, require: true },
    lines: [String]
  }
)

const bookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  numberOfPages: { type: Number, required: true },
  icon: { type: Number, required: true },
  pages: [pageSchema]
})

export const Book = mongoose.model("Book", bookSchema)