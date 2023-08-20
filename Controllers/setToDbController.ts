import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { Book } from "../Models/dbSchema/Book";

//creation Functions

// new collection
export async function AddNewCollection({ userId, name, description, sharedWith, sharingAccess }: { userId: string, name: string, description: string, sharedWith?: string[], sharingAccess?: boolean }) {
  let bookshelvesArray = await createNewBookshelves()
  // add to user
  let newCollection = {
    name,
    description,
    numberOfBooks: 0,
    bookshelves: bookshelvesArray.map(x => x.id),
    owner: userId,
    sharedWith,
    sharingAccess
  }

  const insertedCollection = await Collection.create(newCollection)
  await User.findByIdAndUpdate(userId, { $push: { collectionOwned: insertedCollection.id } })
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