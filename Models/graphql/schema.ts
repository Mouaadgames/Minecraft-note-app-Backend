import { GetUser, GetCollection, GetCollections, GetBookshelf, GetBookshelves, GetBookInfo, GetBookPages, GetBooks } from "../../Controllers/getFromDbController"
import { AddNewCollection, AddNewBook } from "../../Controllers/setToDbController"
import { EditThisCollection, EditBookshelf, EditBookBookshelf, EditBookInfo, EditBookPlace, WriteToTheBook } from "../../Controllers/updateTheDbController";
import { makeExecutableSchema } from '@graphql-tools/schema'

const schema = `#graphql
  type User{
    id:String!
    username:String!
    collectionOwned:[Collection]!
    collectionShared:[Collection]!
  }

  type Collection {
    id:String!
    name:String!
    description:String!
    numberOfBooks:Int!
    bookshelves:[Bookshelf!]!
    owner:String!
    sharedWith:[String]! #just userId and username go's here to check if the user have access to this collection
    globalWriteAccess:Boolean # false : read only true: read write null : no sharing 
  }

  type Bookshelf{
    id:String!
    name:String!
    numberOfBooks:Int!
    filledPlaces:[Boolean!]!
    books:[BookInfo]!
    parentCollection:Collection!
  }

  type BookInfo{
    id:String
    title:String
    numberOfPages:Int
    icon:Int
    isHidden:Boolean!
    readOnly:Boolean
    hiddenFrom:[String]
  }

  type BookPages{
    PagesData:[Page]
  }

  type Page{
    pageNumber:Int!
    lines:[String]!
  }

  type Query{
    user:User # the user is defined by the JWT  
    collection(id:String!):Collection
    bookshelf(id:String!):Bookshelf
    bookInfo(id:String!):BookInfo
    bookPages(id:String!,pageLimit:Int,offset:Int):BookPages
  }

  type Mutation {
    addCollection(name:String!,description:String!,sharedWith:[String],globalWriteAccess:Boolean):Boolean
    editCollection(collectionId:String!,name:String,description:String,sharedWith:[String],globalWriteAccess:Boolean):Boolean
    deleteCollection(collectionId:String!):Boolean

    editBookshelf(bookshelfId:String!,name:String!):Boolean

    addBook(bookshelfId:String!,title:String!,icon:Int!,readOnly:Boolean,hiddenFrom:[String]):Boolean
    editBookPlace(bookId:String!,newPlace:Int!):Boolean
    editBookBookshelf(bookId:String!,bookshelfId:String!):Boolean
    editBookInfo(bookId:String!,title:String!,icon:Int!,readOnly:Boolean!,hiddenFrom:[String]!):Boolean
    writeToTheBook(bookId:String!,data:[[String]]!):Boolean
    deleteBook(bookId:String!):Boolean
  }
`


const resolvers = {
  Query: {
    user: (_: any, __: any, { currentUser }: { currentUser: string }) => GetUser(currentUser),
    collection: (_: any, { id }: { id: string }, { currentUser }: { currentUser: string }) => GetCollection(id, currentUser), // only owned collection or shred one are accessible
    bookshelf: (_: any, { id }: { id: string }, { currentUser }: { currentUser: string }) => GetBookshelf(id, currentUser),
    bookInfo: (_: any, { id }: { id: string }, { currentUser }: { currentUser: string }) => GetBookInfo(id, currentUser),
    bookPages: (_: any, { id, pageLimit, offset }: { id: string, pageLimit?: number, offset?: number }, { currentUser }: { currentUser: string }) => GetBookPages(id, currentUser, pageLimit, offset)
  },

  User: {
    collectionOwned: ({ collectionOwned }: { collectionOwned: string[] }) =>
      GetCollections(collectionOwned),
    collectionShared: ({ collectionShared }: { collectionShared: string[] }) =>
      GetCollections(collectionShared)
  },

  Collection: {
    bookshelves: ({ bookshelves }: { bookshelves: string[] }) => GetBookshelves(bookshelves),
  },

  Bookshelf: {
    books: ({ books }: { books: string[] }, args: any, { currentUser }: { currentUser: string }) => GetBooks(books, currentUser),
    parentCollection: ({ parentCollection }: { parentCollection: string }, args: any, { currentUser }: { currentUser: string }) =>
      GetCollection(parentCollection, currentUser)
  },

  Mutation: {
    /**
     * Collection C U D
     */
    addCollection: (_: never,
      { name, description, sharedWith, globalWriteAccess }: { name: string, description: string, sharedWith?: string[], globalWriteAccess?: boolean },
      { currentUser }: { currentUser: string }) => {
      return AddNewCollection({ userId: currentUser, name, description, sharedWith, globalWriteAccess })
    },
    editCollection: (_: never,
      { name, description, sharedWith, globalWriteAccess, collectionId }: { collectionId: string, name?: string, description?: string, sharedWith?: string[], globalWriteAccess?: boolean },
      { currentUser }: { currentUser: string }) => {
      return EditThisCollection(currentUser, collectionId, name, description, sharedWith, globalWriteAccess)
    },
    deleteCollection: () => {
      //TODO:
    },
    /**
     * Bookshelf U
     */

    editBookshelf: (_: never,
      { bookshelfId, name }: { bookshelfId: string, name: string },
      { currentUser }: { currentUser: string }) => {
      return EditBookshelf(currentUser, bookshelfId, name)
    },

    /**
     * Book C U_Pos U_Pos_BSh U_Info U_adding D
     */
    addBook: (_: never,
      { bookshelfId, title, icon, readOnly, hiddenFrom }: { bookshelfId: string, title: string, icon: number, readOnly?: boolean, hiddenFrom?: string[] },
      { currentUser }: { currentUser: string }) => {
      return AddNewBook(currentUser, bookshelfId, title, icon, readOnly, hiddenFrom)
    },

    editBookPlace: (_: never,
      { bookId, newPlace }: { bookId: string, newPlace: number },
      { currentUser }: { currentUser: string }) => {
      return EditBookPlace(currentUser, bookId, newPlace)
    },

    editBookBookshelf: (_: never,
      { bookId, bookshelfId }: { bookId: string, bookshelfId: string },
      { currentUser }: { currentUser: string }) => {
      return EditBookBookshelf(currentUser, bookId, bookshelfId)
    },

    editBookInfo: (_: never,
      { bookId, title, icon, readOnly, hiddenFrom }: { bookId: string, title: string, icon: number, readOnly?: boolean, hiddenFrom?: string[] },
      { currentUser }: { currentUser: string }) => {
      return EditBookInfo(currentUser, bookId, title, icon, readOnly, hiddenFrom)
    },

    writeToTheBook: (_: never,
      { bookId, pages }: { bookId: string, pages: string[][] },
      { currentUser }: { currentUser: string }) => {
      return WriteToTheBook(currentUser, bookId, pages)
    },

    deleteBook: (_: never,
      { bookId }: { bookId: string },
      { currentUser }: { currentUser: string }) => {
      return false // TODO
    }
  }
}



export const executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers })

