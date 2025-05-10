import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { getRandomRecommendations } from "@/lib/recommendations"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    const { db } = await connectToDatabase()

    let interests: string[] = []

    // Si l'utilisateur est connecté, récupérer ses intérêts
    if (session?.user?.id) {
      const user = await db.collection("Users").findOne({ _id: new ObjectId(session.user.id) })

      if (user && user.interests) {
        interests = user.interests
      }
    }

    // Obtenir des recommandations basées sur les intérêts
    const recommendations = await getRandomRecommendations(db, interests)

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Recommendation error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des recommandations" }, { status: 500 })
  }
}
