import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { Book } from "../Models/dbSchema/Book";
import { isValidObjectId } from "mongoose";
import { doseItHaveAccessToThisBook, doseItHaveAccessToThisBookshelf, doseItHaveAccessToThisCollection } from "../Models/accessFunction";



//utilFunction

function validateIds(ids: String[]) {
  let resultIds = []
  let validateId
  for (validateId of ids) {
    if (!isValidObjectId(validateId)) {
      console.error("This Provided id : " + validateId + " -> is not valid");
      continue
    }
    resultIds.push(validateId)
  }
  return resultIds
}

//User
export async function GetUser(id: String) {
  if (!isValidObjectId(id)) {
    console.error("user id provided is not valid ");
    return 
  }
  return await User.findById(id, { username: true, collectionOwned: true, collectionShared: true })
}

//collections
export async function GetCollection(id: String, userId: String) {
  if (!isValidObjectId(id)) {
    console.error("collection id provided is not valid ");
    return 
  }
  const collectionFromDb = await Collection.findById(id)
  if (!doseItHaveAccessToThisCollection(userId, collectionFromDb)) return {}
  return collectionFromDb
}

export async function GetCollections(ids: String[]) {
  const idsToWorkWith = validateIds(ids)

  if (!idsToWorkWith.length) return [] // make the check to the other var after filtering bad ids
  const findQuery = { $or: idsToWorkWith.map(id => { return { _id: id } }) }

  const result = await Collection.find(findQuery)

  if (!result) return []
  return result
}

//bookshelves
export async function GetBookshelf(id: String, userId: String) {
  if (!isValidObjectId(id)) {
    console.error("Bookshelf id provided is not valid ");
    return 
  }
  const bookshelfFromDb = await Bookshelf.findById(id)
  if (!doseItHaveAccessToThisBookshelf(userId, bookshelfFromDb)) return {}

  return bookshelfFromDb
}

export async function GetBookshelves(ids: String[]) {
  const idsToWorkWith = validateIds(ids)

  if (!idsToWorkWith.length) return [] // make the check to the other var after filtering bad ids
  const findQuery = { $or: idsToWorkWith.map(id => { return { _id: id } }) }

  const result = await Bookshelf.find(findQuery)

  if (!result) return []
  return result
}

//Books

export async function GetBook(id: String, userId: String) {
  if (!isValidObjectId(id)) {
    console.error("Book id provided is not valid ");
    return {}
  }
  const bookFromDb = await Book.findById(id)

  if (!doseItHaveAccessToThisBook(userId, bookFromDb)) return {}
  return bookFromDb
}

export async function GetBooks(ids: String[]) {
  const idsToWorkWith = validateIds(ids)

  if (!idsToWorkWith.length) return [] // make the check to the other var after filtering bad ids
  const findQuery = { $or: idsToWorkWith.map(id => { return { _id: id } }) }

  const result = await Book.find(findQuery)
  if (!result) return []
  return result
}
