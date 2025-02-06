"use server"

import clientPromise from "@/server/mongodb"

export async function updateInputCode(newCodes) {
  const client = await clientPromise
  const db = client.db("hemvip")

  console.log("newCodes", newCodes)

  const deleteResult = await db.collection("inputcode").deleteMany({})

  if (deleteResult.deletedCount > 0) {
    console.log("Delete old inputs code success", deleteResult.deletedCount)
  } else {
    console.log("Delete old inputs code failed", deleteResult.deletedCount)
  }

  const insertResult = await db
    .collection("inputcode")
    .insertOne({ codes: newCodes })

  if (insertResult.insertedId) {
    console.log("Insert new inputs code success", insertResult.insertedId)
  } else {
    console.log("Insert new inputs code failed", insertResult.insertedId)
  }

  return { success: true, error: null, msg: "Insert new inputs code success" }
}
