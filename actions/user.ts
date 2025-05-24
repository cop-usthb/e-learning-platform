"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

// Fonction pour mettre à jour les centres d'intérêt d'un utilisateur
export async function updateUserInterests(interests: string[]) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { success: false, message: "Vous devez être connecté" }
    }

    if (interests.length === 0) {
      return { success: false, message: "Sélectionnez au moins un centre d'intérêt" }
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    let objectId
    try {
      objectId = new ObjectId(userId)
    } catch (error) {
      return { success: false, message: "ID utilisateur invalide" }
    }

    await db.collection("users").updateOne({ _id: objectId }, { $set: { interests } })

    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("Error updating user interests:", error)
    return { success: false, message: "Une erreur est survenue" }
  }
}
