import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { userId, interests } = await request.json()

    if (!userId || !interests || !Array.isArray(interests)) {
      return NextResponse.json(
        { error: "userId et interests sont requis" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Mettre à jour les centres d'intérêt de l'utilisateur
    const result = await db.collection("Users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { interests: interests } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user interests:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des centres d'intérêt" },
      { status: 500 }
    )
  }
}