import { GetUser, GetCollection, GetCollections, GetBookshelf, GetBookshelfs, GetBook,GetBooks } from "../../Controllers/getFromDbController"
import { makeExecutableSchema } from '@graphql-tools/schema'

const schema = `#graphql
  type User{
    id:String!
    username:String!
    collectionOwned:[Collection]!
    collectionShared:[Collection]!
  }

  type Collection{
    id:String!
    name:String!
    description:String!
    numberOfBooks:Int!
    bookshelfs:[Bookshelf!]!
    owner:String!
    sharedWith:[[String,String]]! #just userId and username go's here to check if the user have access to this collection
  }

  type Bookshelf{
    id:String!
    numberOfBooks:Int!
    filledPlaces:[Boolean!]!
    books:[Book]!
    collection:Collection!
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

  # type Mutation {
  #   addCollection()
  # }
`



const resolvers = {
  Query: {
    user: (_: any, __: any, { currentUser }: { currentUser: String }) => GetUser(currentUser),
    collection: (_: any, { id }: { id: String }, { currentUser }: { currentUser: String }) => GetCollection(id, currentUser), // only owned collection or shred one are accessible
    bookshelf: (_: any, { id }: { id: String }, { currentUser }: { currentUser: String }) => GetBookshelf(id, currentUser),
    book: (_: any, { id }: { id: String }, { currentUser }: { currentUser: String }) => { GetBook(id, currentUser) }
  },
  User: {
    collectionOwned: ({ collectionOwned }: { collectionOwned: [String] }) =>
      GetCollections(collectionOwned),
    collectionShared: ({ collectionShared }: { collectionShared: [String] }) =>
      GetCollections(collectionShared)
  },
  Collection: {
    bookshelfs: ({ bookshelfs }: { bookshelfs: [String] }) => GetBookshelfs(bookshelfs),
  },
  Bookshelf: {
    books: ({ books }:{ books: [String] })=>GetBooks(books)
  }

  // Mutation: {

  // },
}


export const executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers })

