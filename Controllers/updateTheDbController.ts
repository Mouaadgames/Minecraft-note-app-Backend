

import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { doseItHaveAccessToThisBook, doseItHaveAccessToThisCollection } from "../Models/accessFunction";
import { GetBookInfo, GetBookPages, GetBookshelf, GetCollection, getUsersId } from "./getFromDbController";
import { log } from "console";
import { Book } from "../Models/dbSchema/Book";
import { isAwaitExpression } from "typescript";
//edit collection
export async function EditThisCollection(userId: string, collectionId: string, name?: string, description?: string, sharedWith?: string[], globalWriteAccess?: boolean) {
  if (name === undefined && description === undefined && sharedWith === undefined && globalWriteAccess === undefined) return true
  console.log("in edit coll");

  const currentCollection = await Collection.findById(collectionId)
  if (!currentCollection) return null
  if (!doseItHaveAccessToThisCollection(userId, currentCollection, true)) return false

  const oldSharedWith = new Set(currentCollection.sharedWith.map((user) => user[0]))
  currentCollection.name = name !== undefined ? name : currentCollection?.name
  currentCollection.description = description !== undefined ? description : currentCollection?.description
  currentCollection.sharedWith = sharedWith !== undefined ? await getUsersId(sharedWith) : currentCollection?.sharedWith
  if (currentCollection.sharedWith.length !== 0) {
    if (globalWriteAccess !== undefined)
      currentCollection.globalWriteAccess = globalWriteAccess
    else if (currentCollection.globalWriteAccess === undefined) {
      currentCollection.globalWriteAccess = false // default G.W.A value
    }
  }

  //filtering add and removed users in this collection shredWith property

  if (Array.from(oldSharedWith).length !== 0) {

    let newAddedUsers: string[] = []
    currentCollection.sharedWith.forEach(element => {
      if (!oldSharedWith.has(element[0])) {
        newAddedUsers.push(element[0])
      }
      oldSharedWith.delete(element[0])
    })

    let removedUsers = Array.from(oldSharedWith)
    //mutating DB

    if (newAddedUsers.length)
      await User.updateMany({ $or: newAddedUsers.map(_id => { return { _id } }) }, { $push: { collectionShared: collectionId } })
    if (removedUsers.length) {
      const usersRemovedFrom = await User.find({ $or: removedUsers.map(_id => { return { _id } }) }, { collectionShared: true })
      usersRemovedFrom.forEach(async (user) => {
        const newUserCollectionShared = user.collectionShared.filter(coll => coll !== collectionId)
        user.collectionShared = newUserCollectionShared
        await user.save()
      })
    }
  }
  else if (currentCollection.sharedWith.length)
    await User.updateMany({ $or: currentCollection.sharedWith.map(element => { return { _id: element[0] } }) }, { $push: { collectionShared: collectionId } })


  await currentCollection.save()
  console.log("collection is saved");

  console.log(await Collection.findById(currentCollection.id));

  return true
}

export async function EditBookshelf(userId: string, bookshelfId: string, name: string) {
  const currentBookshelf = await GetBookshelf(bookshelfId, userId)
  if (!currentBookshelf) return false
  currentBookshelf.name = name
  currentBookshelf?.save()
  return true
}

export async function EditBookPlace(userId: string, bookId: string, newPlace: number) {
  /**
   * is the new place is valid
   * get the book with checking access
   * get Bookshelf without checking access
   * see the new place if it could be moved 
   * check the new place if it could be swap with - if it dose the user have write access to it
   * check the current book place 
   * swap values 
   */

  if (!(newPlace >= 0 && newPlace <= 7)) return false

  const thisBook = await GetBookInfo(bookId, userId, true)
  if (!thisBook) return false

  const currentBookshelf = await Bookshelf.findById(thisBook.bookshelf, { books: true, filledPlaces: true })
  if (!currentBookshelf) return false

  const elementInTheNewPlace = await Book.findById(currentBookshelf.books[newPlace], { access: true, bookshelf: true })
  if (elementInTheNewPlace) {

    if (!await doseItHaveAccessToThisBook(userId, elementInTheNewPlace, true, true)) {
      return false
    }

  }
  const indexOfTheCurrentBook = currentBookshelf.books.indexOf(bookId)
  if (indexOfTheCurrentBook === -1) return false


  currentBookshelf.books[newPlace] = currentBookshelf.books[indexOfTheCurrentBook]
  currentBookshelf.books[indexOfTheCurrentBook] = elementInTheNewPlace?.id === undefined ? null : elementInTheNewPlace.id

  const filledPlaceTemp = currentBookshelf.filledPlaces[newPlace]
  currentBookshelf.filledPlaces[newPlace] = currentBookshelf.filledPlaces[indexOfTheCurrentBook]
  currentBookshelf.filledPlaces[indexOfTheCurrentBook] = filledPlaceTemp
  await currentBookshelf.save()
  return true
}

export async function EditBookBookshelf(userId: string, bookId: string, bookshelfId: string) {
  /** TODO:
   * check get the book with checking access 
   * get the bookshelf to add to with checking access
   * dose it have space to add to  
   * the get from bookshelf without checking
   * remove the book from it 
   * add it to the corespondent place
   * 
   */
  const currentBook = await Book.findById(bookId, { pages: false })
  if (!currentBook) return false
  if (!await doseItHaveAccessToThisBook(userId, currentBook, true)) return false

  const newBookshelf = await Bookshelf.findById(bookshelfId)
  if (!newBookshelf) return false
  if (newBookshelf.numberOfBooks === 8) return false

  const currentBookshelf = await Bookshelf.findById(currentBook.bookshelf)
  if (!currentBookshelf) return false
  if (currentBookshelf.parentCollection !== newBookshelf.parentCollection) return false //TODO : this could be fetcher if i remove it and add other ui element to make  it work

  const bookIndex = currentBookshelf.books.indexOf(currentBook.id)
  if (bookIndex === -1) return false

  currentBookshelf.books[bookIndex] = ""
  currentBookshelf.numberOfBooks--

  let nextEmptyPlace = 0
  for (let i = 0; i < newBookshelf.filledPlaces.length; i++) {
    const place = newBookshelf.filledPlaces[i];
    if (!place) {
      nextEmptyPlace = i
      break
    }
  }
  newBookshelf.books[nextEmptyPlace] = bookId
  newBookshelf.filledPlaces[nextEmptyPlace] = true
  newBookshelf.numberOfBooks++

  currentBook.bookshelf = newBookshelf.id

  await currentBook.save()
  await currentBookshelf.save()
  await newBookshelf.save()
  return true
}

export async function EditBookInfo(userId: string, bookId: string, title: string, icon: number, readOnly?: boolean, hiddenFrom?: string[]) {
  /**
   * get the book with write access 
   * change Book info 
   * save
   */
  const currentBook = await Book.findById(bookId, { pages: false })
  if (!currentBook) return false
  if (!await doseItHaveAccessToThisBook(userId, currentBook, true)) return false
  currentBook.title = title
  currentBook.icon = icon
  if (readOnly && currentBook.access)
    currentBook.access.readOnly = readOnly
  if (hiddenFrom && currentBook.access)
    currentBook.access.hiddenFrom = hiddenFrom

  await currentBook.save()
  return true

}

export async function WriteToTheBook(userId: string, bookId: string, pages?: string[][]) { // should be optimized
  /**
   * i need to think about it ??
   */
}
