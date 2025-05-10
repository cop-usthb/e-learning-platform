import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { hash } from "bcryptjs"
import { z } from "zod"

// Schéma de validation - modifié pour correspondre au frontend
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6), // Changé de 8 à 6 pour correspondre au frontend
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = userSchema.parse(body)

    const { db } = await connectToDatabase()

    // Vérifier si l'email existe déjà
    const existingUser = await db.collection("Users").findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { message: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Hacher le mot de passe
    const hashedPassword = await hash(password, 10)

    // Créer l'utilisateur
    const result = await db.collection("Users").insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      interests: [], // Les intérêts seront ajoutés dans une étape ultérieure
      purchasedCourses: [],
    })

    // Retourner l'ID de l'utilisateur créé pour l'étape suivante
    return NextResponse.json({
      message: "Utilisateur créé avec succès",
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Registration error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données d'entrée invalides", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la création du compte" },
      { status: 500 }
    )
  }
}