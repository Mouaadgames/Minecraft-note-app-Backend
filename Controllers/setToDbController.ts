import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { Book } from "../Models/dbSchema/Book";
import { GetBookshelf, getUsersId } from "./getFromDbController";
//creation Functions

// new collection
export async function AddNewCollection({ userId, name, description, sharedWith, globalWriteAccess }: { userId: string, name: string, description: string, sharedWith?: string[], globalWriteAccess?: boolean }) {
  console.log("adding to db");

  const bookshelvesArray = await createNewBookshelves()
  const usersIds = await getUsersId(sharedWith)
  // add to user
  const newCollection = {
    name,
    description,
    numberOfBooks: 0,
    bookshelves: bookshelvesArray.map(x => x.id),
    owner: userId,
    sharedWith: usersIds,
    globalWriteAccess
  }

  const insertedCollection = await Collection.create(newCollection)
  // link collection to
  // owner
  await User.findByIdAndUpdate(userId, { $push: { collectionOwned: insertedCollection.id } })
  //sharedWith
  if (usersIds.length)
    await User.updateMany(
      { $or: usersIds.map((v) => { return { _id: v[0] } }) },
      { $push: { collectionShared: insertedCollection.id } }
    )
  //bookShelves
  // update in one query 
  await Bookshelf.updateMany(
    { $or: bookshelvesArray.map(({ _id }) => { return { _id } }) },
    { $set: { parentCollection: insertedCollection.id } })
  return true
}



//the 8 collection bookshelves are created and we pass the ids back 
async function createNewBookshelves() {
  let newBookshelves = []
  for (let i = 0; i < 8; i++) {
    newBookshelves.push({
      name: "bookshelf" + (i + 1).toString(),
      numberOfBooks: 0,
      filledPlaces: [false, false, false, false, false, false, false, false],
      books: Array(8), // with empty books
      parentCollection: "not set utile now from the server"
    })
  }

  return await Bookshelf.insertMany(newBookshelves)
}



//create book
export async function AddNewBook(userId: string, bookshelfId: string, title: string, icon: number, readOnly?: boolean, hiddenFrom?: string[]) {
  /* TODO :
   * dose is have access to this book shelf (write access)
   * if it possible add add it (is not full)
   * create the book with the bookshelf id 
   * set the full place the the next empty place 
   * update the books ids in the bookshelves and the books counters in bookshelf and the corresponding collection
  */
  //getting the bookShelf obj from db 
  const currentBookshelf = await GetBookshelf(bookshelfId, userId, true)
  if (!currentBookshelf) return false  //dose it return te data that we want or req is declined due to access,permission
  if (currentBookshelf.numberOfBooks === 8) return false
  const currentCollection = await Collection.findById(currentBookshelf.parentCollection, { globalWriteAccess: true, numberOfBooks: true })
  if (!currentCollection) return false
  const newBook = await Book.create({
    title: title,
    icon: icon,
    numberOfPages: 0,
    access: {
      readOnly: currentCollection?.globalWriteAccess, // TODO what if the collection is not shared
      hiddenFrom: []
    },
    pages: [],
    bookshelf: currentBookshelf.id
  })
  let newEmptyPlace = 0
  for (let i = 0; i < currentBookshelf.filledPlaces.length; i++) {
    const place = currentBookshelf.filledPlaces[i];
    if (!place) {
      newEmptyPlace = i
      break
    }
  }
  currentBookshelf.books[newEmptyPlace] = newBook.id
  currentBookshelf.filledPlaces[newEmptyPlace] = true
  currentBookshelf.numberOfBooks++
  console.log(currentCollection);

  currentCollection.numberOfBooks !== undefined && currentCollection.numberOfBooks++
  await currentBookshelf.save()
  await currentCollection.save()
  return true
}
