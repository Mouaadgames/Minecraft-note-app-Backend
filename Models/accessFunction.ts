import { Collection } from "./dbSchema/Collection";
import { Bookshelf } from "./dbSchema/Bookshelf";
import { Book } from "./dbSchema/Book";
import {Types} from "mongoose"

type collectionType = {
  bookshelves: string[] | undefined;
  sharedWith: string[][] | undefined;
  globalWriteAccess?: boolean | undefined;
  owner?: string | undefined;
  description?: string | undefined;
  name?: string | undefined;
  numberOfBooks?: number | undefined;
}
export function doseItHaveAccessToThisCollection(userId: String, data: collectionType | null) {
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
export async function doseItHaveAccessToThisBookshelf(userId: String, data: bookshelfType | null) {
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
export async function doseItHaveAccessToThisBook(userId: String, data: bookType | null) {
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

