import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getScoredRecommendations } from "@/lib/recommendations"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const { db } = await connectToDatabase()

    let interests: string[] = []
    let userId = null

    // Si l'utilisateur est connecté, récupérer ses intérêts
    if (session?.user?.id) {
      userId = session.user.id
      const user = await db.collection("Users").findOne({ _id: new ObjectId(session.user.id) })

      if (user && user.interests) {
        interests = user.interests
      }
    }

    // Obtenir des recommandations avec scores basées sur les intérêts
    const recommendations = await getScoredRecommendations(db, interests, userId)

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Scored recommendation error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des recommandations" }, { status: 500 })
  }
}