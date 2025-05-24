"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import { simpleHash } from "@/lib/utils"
import { executeProfileUpdate } from "@/lib/executeScript"

// Fonction pour mettre à jour les centres d'intérêt d'un utilisateur
export async function updateUserInterests(interests: string[]) {
  // ...existing code...
}

interface RegisterUserParams {
  name: string
  email: string
  password: string
  interests: string[]
}

export async function registerUser(params: RegisterUserParams) {
  const { name, email, password, interests } = params

  if (!name || !email || !password || interests.length === 0) {
    return { success: false, message: "Tous les champs sont requis" }
  }

  try {
    const { db } = await connectToDatabase()

    // Vérifier si l'email existe déjà
    const existingUser = await db.collection("users").findOne({ email })

    if (existingUser) {
      return { success: false, message: "Cet email est déjà utilisé" }
    }

    // Hasher le mot de passe
    const hashedPassword = simpleHash(password)

    // Créer l'utilisateur
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      interests,
      createdAt: new Date().toISOString(),
    })

    if (!result.insertedId) {
      return { success: false, message: "Erreur lors de la création du compte" }
    }

    // Exécuter le script Python pour mettre à jour les profils utilisateurs
    try {
      console.log("Nouvel utilisateur inscrit, mise à jour des profils...")
      await executeProfileUpdate("signup")
    } catch (error) {
      console.error("Erreur lors de la mise à jour des profils après inscription:", error)
      // Ne pas bloquer l'inscription si le script échoue
    }

    return { success: true }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, message: "Une erreur est survenue lors de l'inscription" }
  }
}
