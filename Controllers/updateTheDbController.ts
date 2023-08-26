

import { User } from "../Models/dbSchema/User";
import { Collection } from "../Models/dbSchema/Collection";
import { Bookshelf } from "../Models/dbSchema/Bookshelf";
import { doseItHaveAccessToThisCollection } from "../Models/accessFunction";
import { getUsersId } from "./getFromDbController";
import { log } from "console";
//edit collection
export async function EditThisCollection({ userId, collectionId, name, description, sharedWith, globalWriteAccess }: { userId: string, collectionId: string, name?: string, description?: string, sharedWith?: string[], globalWriteAccess?: boolean }) {
  if (name === undefined && description === undefined && sharedWith === undefined && globalWriteAccess === undefined) return null
  console.log("in edit coll");

  const currentCollection = await Collection.findById(collectionId)
  if (!currentCollection) return null
  console.log("before the access check");
  if (!doseItHaveAccessToThisCollection(userId, currentCollection)) return null
  console.log("passing the access check");

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
  console.log("currentCollection : ", currentCollection);
  console.log("old shared : ", oldSharedWith);


  //filtering add and removed users in this collection shredWith property

  if (Array.from(oldSharedWith).length !== 0) {

    let newAddedUsers: string[] = []
    currentCollection.sharedWith.forEach(element => {
      if (!oldSharedWith.has(element[0])) {
        newAddedUsers.push(element[0])
        console.log("element new : ", element[0]);

      }
      oldSharedWith.delete(element[0])
    })
    console.log(currentCollection.sharedWith);

    let removedUsers = Array.from(oldSharedWith)
    console.log("removed users : ", removedUsers);
    //mutating DB
    console.log("added users : ", newAddedUsers);

    if (newAddedUsers.length) {
      console.log("in it");

      await User.updateMany({ $or: newAddedUsers.map(_id => { return { _id } }) }, { $push: { collectionShared: collectionId } })
    }
    console.log(removedUsers.length);

    if (removedUsers.length) {
      const usersRemovedFrom = await User.find({ $or: removedUsers.map(_id => { return { _id } }) }, { collectionShared: true })
      console.log(usersRemovedFrom);


      usersRemovedFrom.forEach(async (user) => {
        console.log("this user : ", user);

        const newUserCollectionShared = user.collectionShared.filter(coll => coll !== collectionId)
        user.collectionShared = newUserCollectionShared
        console.log("before saving");

        await user.save()
        console.log("user : ", user.id, " is saved");
      })
    }
  }
  else {
    if (currentCollection.sharedWith.length) {
      console.log("in else in coll");

      await User.updateMany({ $or: currentCollection.sharedWith.map(element => { return { _id: element[0] } }) }, { $push: { collectionShared: collectionId } })
    }
  }

  await currentCollection.save()
  console.log("collection is saved");

  console.log(await Collection.findById(currentCollection.id));

  return currentCollection
}
