import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { Book } from "../Models/dbSchema/Book";
import { Types, isValidObjectId } from "mongoose";
import { doseItHaveAccessToThisBook, doseItHaveAccessToThisBookshelf, doseItHaveAccessToThisCollection } from "../Models/accessFunction";

//types 

type collection = {
  _id: string;
  bookshelves: string[];
  sharedWith: string[][];
  description?: string | undefined;
  globalWriteAccess?: boolean | undefined;
  name?: string | undefined;
  numberOfBooks?: number | undefined;
  owner?: string | undefined;
}

//utilFunction

function validateIds(ids: String[]) {
  let resultIds = []
  let validateId
  for (validateId of ids) {
    if (!isValidObjectId(validateId)) {
      console.error("This Provided id : " + validateId + " -> is not valid");
      resultIds.push(null)
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
  console.log(id);

  const collectionFromDb = await Collection.findById(id)
  if (!doseItHaveAccessToThisCollection(userId, collectionFromDb)) return
  const result: collection = JSON.parse(JSON.stringify(collectionFromDb))

  return { ...result, id: result._id, sharedWith: result?.sharedWith.map((v) => v[1]) }
}

export async function GetCollections(ids: String[]) {
  const idsToWorkWith = validateIds(ids)

  if (!idsToWorkWith.length) return [] // make the check to the other var after filtering bad ids
  const findQuery = { $or: idsToWorkWith.map(id => { return { _id: id } }) }

  const resultFromDb = await Collection.find(findQuery)

  if (!resultFromDb) return []

  let result: collection[] = JSON.parse(JSON.stringify(resultFromDb))

  console.log(
    result.map((collection) => {
      return { ...collection, id: collection._id, sharedWith: collection?.sharedWith.map((v) => v[1]) }
    }))
  return result.map((collection) => {
    return { ...collection, id: collection._id, sharedWith: collection?.sharedWith.map((v) => v[1]) }
  })
}
//bookshelves
export async function GetBookshelf(id: String, userId: String) {
  if (!isValidObjectId(id)) {
    console.error("Bookshelf id provided is not valid ");
    return
  }
  const bookshelfFromDb = await Bookshelf.findById(id)
  if (!await doseItHaveAccessToThisBookshelf(userId, bookshelfFromDb)) return

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

function isHiddenFromThis(userId: String, data: bookType | null) {
  const hiddenFrom = data?.access?.hiddenFrom
  if (hiddenFrom) {
    for (let i = 0; i < hiddenFrom.length; i++) {
      const hiddenUserId = hiddenFrom[i];
      if (userId === hiddenUserId) {
        return true
      }
    }
  }
  return false
}

export async function GetBookInfo(id: String, userId: String) {
  if (!isValidObjectId(id)) {
    console.error("Book id provided is not valid ");
    return 
  }
  const bookFromDb = await Book.findById(id, { name: true, numberOfPages: true, icon: true, access: true ,bookshelf:true})

  if (!await doseItHaveAccessToThisBook(userId, bookFromDb)) return 
  console.log(bookFromDb);

  return {
    id: bookFromDb?.id,
    title: bookFromDb?.name,
    numberOfPages: bookFromDb?.numberOfPages,
    icon: bookFromDb?.icon,
    readOnly: bookFromDb?.access?.readOnly,
    isHidden: isHiddenFromThis(userId, bookFromDb),
    bookshelf: bookFromDb?.bookshelf,
    hiddenFrom: [], // TODO : only owner is abel to see this
    pages: [] // TODO : make it limited and offset ed
  }
}

export async function GetBookPages(id: string, userId: string, pageLimit: number = 0, offset: number = 0) {
  if (!isValidObjectId(id)) {
    console.error("Book id provided is not valid ");
    return 
  }

  const bookFromDb = await Book.findById(id, { "pages": { $slice: [offset, pageLimit] } })
  if (!await doseItHaveAccessToThisBook(userId, bookFromDb)) return 
  console.log(bookFromDb);
  return bookFromDb

}

export async function GetBooks(ids: String[], userId: string) {
  const validIds = validateIds(ids)
  if (!validIds.length) return [] // make the check to the other var after filtering bad ids
  const findQuery: { $or: { _id: String | null; }[] } = { $or: validIds.map(id => { return { _id: id } }) }

  const resultFromDb = await Book.find(findQuery)
  console.log(resultFromDb)
  // organize book 
  const resultFromDbObj: any = {} // need to get a better type that any
  resultFromDb.forEach((bookElem) => {
    resultFromDbObj[bookElem.id] = bookElem
  })

  console.log(resultFromDbObj);


  const orderedResult = validIds.map((bookId) => {
    if (!bookId) return null
    return resultFromDbObj[String(bookId)]
  })
  //pares data
  const result = orderedResult.map((book) => {
    if (!book) return null
    console.log(book);

    return {
      id: book?.id,
      title: book?.name,
      numberOfPages: book?.numberOfPages,
      icon: book?.icon,
      readOnly: book?.access?.readOnly,
      isHidden: isHiddenFromThis(userId, book)
    }
  })
  return result
}


export async function getUsersId(names: string[] | undefined) { // return [[userId,userName],[...],...]
  console.log(names);
  if (!names?.length) return []

  const usersSharedWithAndTheirIds = await User.find(
    { $or: names.map(name => { return { username: name } }) },
    { _id: true, username: true }
  )
  const result = usersSharedWithAndTheirIds.map(user => { return [user.id, user.username] })
  return result
}