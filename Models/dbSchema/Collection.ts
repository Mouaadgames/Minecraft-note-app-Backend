import mongoose from "mongoose";
const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },

  description: String, //could be null

  numberOfBooks: { type: Number, require: true }, // calculated on the server every time a book added

  bookshelves: [String], // just ids // 8 bookshelfs are created with the creation of the collection

  owner: { // owner id
    type: String,
    require: true
  },

  sharedWith: [ //provided only from the owner and  
    [String, String] // id and username
  ],
  globalWriteAccess: Boolean // all books will inherits this 
})


export const Collection = mongoose.model("Collection", collectionSchema)