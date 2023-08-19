import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { Book } from "../Models/dbSchema/Book";
import { isValidObjectId } from "mongoose";

//User
export async function GetUser(id: String) {
  if (!isValidObjectId(id)) {
    console.error("user id provided is not valid ");
    return {}
  }
  return await User.findById(id, { username: true, collectionOwned: true, collectionShared: true })
}

//collections
export async function GetCollection(id: String, userId: String) {
  if (!isValidObjectId(id)) {
    console.error("user id provided is not valid ");
    return {}
  }
  return await Collection.findById(id)
}

export async function GetCollections(ids: [String]) {
  const idsToWorkWith = []
  let validateId
  for (validateId of ids) {
    if (!isValidObjectId(validateId)) {
      console.error("collection id provided is not valid ");
      continue
    }
    idsToWorkWith.push(validateId)
  }
  if (!idsToWorkWith.length) return [] // make the check to the other var after filtering bad ids
  const findQuery = { $or: idsToWorkWith.map(id => { return { _id: id } }) }

  const result = await Collection.find(findQuery)

  if (!result) return []
  return result
}

//bookshelfs
export async function GetBookshelf(id: String, userId: String) {
  if (!isValidObjectId(id)) {
    console.error("Bookshelf id provided is not valid ");
    return {}
  }
  return await Bookshelf.findById(id)
}

export async function GetBookshelfs(ids: [String]) {
  const idsToWorkWith = []
  let validateId
  for (validateId of ids) {
    if (!isValidObjectId(validateId)) {
      console.error("Bookshelf id provided is not valid ");
      continue
    }
    idsToWorkWith.push(validateId)
  }
  if (!idsToWorkWith.length) return [] // make the check to the other var after filtering bad ids
  const findQuery = { $or: idsToWorkWith.map(id => { return { _id: id } }) }

  const result = await Bookshelf.find(findQuery)

  if (!result) return []
  return result
}

//Books

export async function GetBook(id: String, userId:String) {
  if (!isValidObjectId(id)) {
    console.error("Book id provided is not valid ");
    return {}
  }
  return await Book.findById(id)
}

export async function GetBooks(id: String) {
  if (!isValidObjectId(id)) {
    console.error("Book id provided is not valid ");
    return {}
  }
  return await Book.findById(id)
}
