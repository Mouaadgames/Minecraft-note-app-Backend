import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { Book } from "../Models/dbSchema/Book";

//creation Functions
export async function AddNewCollection({ userId, name, description, sharedWith, sharingAccess }: { userId: string, name: string, description: string, sharedWith?: string[], sharingAccess?: boolean }) {
  let bookshelvesArray = await createNewBookshelfs()
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


async function createNewBookshelfs() {
  let newBookshelfs = []
  for (let i = 0; i < 8; i++) {
    newBookshelfs.push({
      name: "bookshelf" + (i + 1).toString(),
      numberOfBooks: 0,
      filledPlaces: [false, false, false, false, false, false, false, false],
      books: [],
      parentCollection: "not set utile now from the server"
    })
  }

  return await Bookshelf.insertMany(newBookshelfs)
}



//linking Functions // think about this 


