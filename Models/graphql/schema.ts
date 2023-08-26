import { GetUser, GetCollection, GetCollections, GetBookshelf, GetBookshelves, GetBook, GetBooks } from "../../Controllers/getFromDbController"
import { AddNewCollection } from "../../Controllers/setToDbController"
import { EditThisCollection } from "../../Controllers/updateTheDbController";
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
    books:[Book]!
    parentCollection:Collection!
  }

  type Book{
    id:String!
    numberOfPages:Int!
    icon:Int!
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
    book(id:String!,pageLimit:Int,offset:Int):Book
  }

  type Mutation {
    addCollection(name:String!,description:String!,sharedWith:[String],globalWriteAccess:Boolean):Collection
    editCollection(collectionId:String!,name:String,description:String,sharedWith:[String],globalWriteAccess:Boolean):Collection
  }
`


const resolvers = {
  Query: {
    user: (_: any, __: any, { currentUser }: { currentUser: string }) => GetUser(currentUser),
    collection: (_: any, { id }: { id: string }, { currentUser }: { currentUser: string }) => GetCollection(id, currentUser), // only owned collection or shred one are accessible
    bookshelf: (_: any, { id }: { id: string }, { currentUser }: { currentUser: string }) => GetBookshelf(id, currentUser),
    book: (_: any, { id }: { id: string }, { currentUser }: { currentUser: string }) => { GetBook(id, currentUser) }
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
    books: ({ books }: { books: string[] }) => GetBooks(books),
    parentCollection: ({ parentCollection }: { parentCollection: string }, args: any, { currentUser }: { currentUser: string }) =>
      GetCollection(parentCollection, currentUser)
  },

  Mutation: {
    addCollection: (_: any,
      { name, description, sharedWith, globalWriteAccess }: { name: string, description: string, sharedWith?: string[], globalWriteAccess?: boolean },
      { currentUser }: { currentUser: string }) => {
      return AddNewCollection({ userId: currentUser, name, description, sharedWith, globalWriteAccess })
    },
    editCollection: (_: any,
      { name, description, sharedWith, globalWriteAccess, collectionId }: { collectionId: string, name?: string, description?: string, sharedWith?: string[], globalWriteAccess?: boolean },
      { currentUser }: { currentUser: string }) => {
      return EditThisCollection({ userId: currentUser, collectionId, name, description, sharedWith, globalWriteAccess })
    }
  }
}



export const executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers })

