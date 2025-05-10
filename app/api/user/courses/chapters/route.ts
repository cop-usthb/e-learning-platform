import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { courseId, completedChapters } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "ID du cours requis" }, { status: 400 })
    }

    if (!Array.isArray(completedChapters)) {
      return NextResponse.json({ error: "Liste des chapitres complétés requise" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Mettre à jour les chapitres complétés
    const result = await db.collection("Users").updateOne(
      {
        _id: new ObjectId(session.user.id),
        "purchasedCourses.courseId": courseId,
      },
      {
        $set: {
          "purchasedCourses.$.completedChapters": completedChapters,
          "purchasedCourses.$.progress": Math.round((completedChapters.length / 10) * 100),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cours non trouvé ou non acheté" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating chapters:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour des chapitres" }, { status: 500 })
  }
}
