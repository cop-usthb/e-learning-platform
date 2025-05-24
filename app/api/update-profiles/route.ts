import { NextResponse } from "next/server"
import { executeProfileUpdate } from "@/lib/executeScript"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mise à jour pour passer le déclencheur

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      )
    }

    // Extraire le type de déclencheur de la requête
    const { trigger = 'manual' } = await request.json()

    // Exécuter le script Python de mise à jour des profils avec le déclencheur
    const result = await executeProfileUpdate(trigger)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      trigger
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des profils:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour des profils" },
      { status: 500 }
    )
  }
}