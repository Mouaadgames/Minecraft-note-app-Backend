import { Collection } from "./dbSchema/Collection";
import { Bookshelf } from "./dbSchema/Bookshelf";
import { Book } from "./dbSchema/Book";
import { Types } from "mongoose"

type collectionType = {
  bookshelves: string[] | undefined;
  sharedWith: string[][] | undefined;
  globalWriteAccess?: boolean | undefined;
  owner?: string | undefined;
  description?: string | undefined;
  name?: string | undefined;
  numberOfBooks?: number | undefined;
}
export function doseItHaveAccessToThisCollection(userId: String, data: collectionType | null, writeAccess: boolean = false) {
  if (userId === data?.owner) return true
  if (!data?.sharedWith?.length) return false
  if (writeAccess && !data.globalWriteAccess) return false
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
export async function doseItHaveAccessToThisBookshelf(userId: String, data: bookshelfType | null, writeAccess: boolean = false) {
  const BookshelfCollectionId = data?.parentCollection
  const collectionData = await Collection.findById(BookshelfCollectionId, { owner: true, sharedWith: true })
  return doseItHaveAccessToThisCollection(userId, collectionData, writeAccess)
}

type bookType = {
  title: string | undefined;
  numberOfPages: number | undefined;
  icon: number | undefined;
  pages: Types.DocumentArray<{
    lines: string[];
    pageNumber?: number | undefined;
  }> | undefined;
  bookshelf?: string | undefined;
  access?: {
    readOnly?: boolean | undefined,
    hiddenFrom: string[] | undefined
  } | undefined;
} | null
export async function doseItHaveAccessToThisBook(userId: String, data: bookType | null, writeAccess: boolean = false, skipRecurrent: boolean = false) {
  const BookBookshelfId = data?.bookshelf
  const bookshelfData = await Bookshelf.findById(BookBookshelfId, { parentCollection: true })
  if (writeAccess) {
    const owner = (await Collection.findById(bookshelfData?.parentCollection, { owner: true }))?.owner
    if (owner === userId) return true
    if (data?.access?.readOnly) return false
    if (data?.access?.hiddenFrom?.includes(String(userId))) return false
  }
  if (skipRecurrent) return false
  return await doseItHaveAccessToThisBookshelf(userId, bookshelfData, writeAccess)
  
}

