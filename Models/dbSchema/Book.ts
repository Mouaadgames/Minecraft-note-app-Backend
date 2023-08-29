import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    pageNumber: { type: Number, require: true },
    lines: [String]
  }
)

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  numberOfPages: { type: Number, required: true },
  icon: { type: Number, required: true },
  pages: [pageSchema],
  access: {
    readOnly: Boolean, // if never be null that will defaults to the collection parameters and stay 
    hiddenFrom: [String] // if nothing this will be an empty array
  },
  bookshelf: { type: String, required: true }
})

export const Book = mongoose.model("Book", bookSchema)