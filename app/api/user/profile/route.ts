import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      )
    }

    const { name } = await request.json()

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nom invalide" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { name: name.trim() } }
    )

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
}