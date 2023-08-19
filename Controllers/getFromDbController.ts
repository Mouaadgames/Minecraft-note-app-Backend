import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { Book } from "../Models/dbSchema/Book";
import { Types, isValidObjectId } from "mongoose";
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

type collectionType = {
  bookshelves: string[] | undefined;
  sharedWith: string[][] | undefined;
  globalWriteAccess: boolean | undefined;
  owner?: string | undefined;
  description?: string | undefined;
  name?: string | undefined;
  numberOfBooks?: number | undefined;
}
function doseItHaveAccessToThisCollection(userId: String, data: collectionType | null) {
  if (userId === data?.owner) return true
  if (!data?.sharedWith?.length) return false
  for (let i = 0; i < data?.sharedWith.length; i++) {
    const sharedWithUser = data?.sharedWith[i][0];
    if (userId === sharedWithUser) return true
  }
  return false
}

type bookshelfType = {
  name: string | undefined;
  numberOfBooks: number | undefined;
  filledPlaces: boolean[] | undefined;
  books: string[] | undefined;
  parentCollection: string | undefined;
}
async function doseItHaveAccessToThisBookshelf(userId: String, data: bookshelfType | null) {
  const BookshelfCollectionId = data?.parentCollection
  const collectionData = await Collection.findById(BookshelfCollectionId, { owner: true, sharedWith: true })
  return doseItHaveAccessToThisCollection(userId, collectionData)
}

type bookType = {
  name: string;
  numberOfPages: number;
  icon: number;
  pages: Types.DocumentArray<{
    lines: string[];
    pageNumber?: number | undefined;
  }>;
  bookshelf?: string | undefined;
  access?: {
    readOnly?: boolean | undefined,
    hiddenFrom: string[] | undefined
  } | undefined;
}
async function doseItHaveAccessToThisBook(userId: String, data: bookType | null) {
  const BookBookshelfId = data?.bookshelf
  const hiddenFrom = data?.access?.hiddenFrom
  if (hiddenFrom) {
    for (let i = 0; i < hiddenFrom.length; i++) {
      const hiddenUserId = hiddenFrom[i];
      if (userId === hiddenUserId) {
        return false
      }
    }
  }
  const bookshelfData = await Bookshelf.findById(BookBookshelfId, { parentCollection: true })
  return doseItHaveAccessToThisBookshelf(userId, bookshelfData)
}


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

//bookshelfs
export async function GetBookshelf(id: String, userId: String) {
  if (!isValidObjectId(id)) {
    console.error("Bookshelf id provided is not valid ");
    return {}
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
