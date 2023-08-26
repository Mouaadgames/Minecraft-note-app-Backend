import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { doseItHaveAccessToThisCollection } from "../Models/accessFunction";
import { Book } from "../Models/dbSchema/Book";
import { getUsersId } from "./getFromDbController";
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
  return insertedCollection
}



//the 8 collection bookshelves are created and we pass the ids back 
async function createNewBookshelves() {
  let newBookshelves = []
  for (let i = 0; i < 8; i++) {
    newBookshelves.push({
      name: "bookshelf" + (i + 1).toString(),
      numberOfBooks: 0,
      filledPlaces: [false, false, false, false, false, false, false, false],
      books: [],
      parentCollection: "not set utile now from the server"
    })
  }

  return await Bookshelf.insertMany(newBookshelves)
}




export async function AddNewBook() {
  /* TODO :
   * dose is have access to this book shelf (write access)
   * if it possible add add it (is not full)
   * create the book with the bookshelf id 
   * set the full place the the next empty place 
   * update the books ids in the bookshelves and the books counters in bookshelf and the corresponding collection
   * 
   */
}



//linking Functions // think about this ???