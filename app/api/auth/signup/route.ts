import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/password-utils"

export async function POST(request: Request) {
  try {
    const { name, email, password, interests } = await request.json()

    // Validation des données
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Vérifier si l'email existe déjà
    const existingUser = await db.collection("Users").findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
    }

    // Hacher le mot de passe avec notre utilitaire
    const hashedPassword = hashPassword(password)

    // Créer l'utilisateur
    const result = await db.collection("Users").insertOne({
      name,
      email,
      password: hashedPassword,
      interests, // Stocker les centres d'intérêts
      purchasedCourses: [],
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      userId: result.insertedId,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Une erreur est survenue lors de la création du compte" }, { status: 500 })
  }
}
