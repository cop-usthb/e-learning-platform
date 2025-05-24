import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { executeProfileUpdate } from "@/lib/executeScript"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      )
    }

    const { interests } = await request.json()

    if (!Array.isArray(interests)) {
      return NextResponse.json(
        { success: false, message: "Format invalide pour les centres d'intérêt" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Mettre à jour les centres d'intérêt de l'utilisateur
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { interests } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Exécuter le script de mise à jour des profils
    executeProfileUpdate("interests").catch((error) => {
      // Silence les erreurs pour ne pas bloquer la mise à jour
    })

    return NextResponse.json({
      success: true,
      message: "Centres d'intérêt mis à jour avec succès",
    })
  } catch (error) {
    console.error("Error updating user interests:", error)
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}