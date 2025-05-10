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

    const { courseId, rating } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "ID du cours requis" }, { status: 400 })
    }

    // Vérifier si la note est null ou si c'est un nombre valide entre 1 et 5
    if (rating !== null && (typeof rating !== "number" || rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Note invalide (doit être entre 1 et 5 ou null)" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Mettre à jour la note du cours
    const result = await db.collection("Users").updateOne(
      {
        _id: new ObjectId(session.user.id),
        "purchasedCourses.courseId": courseId,
      },
      {
        $set: {
          "purchasedCourses.$.rating": rating,
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cours non trouvé ou non acheté" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error rating course:", error)
    return NextResponse.json({ error: "Erreur lors de la notation du cours" }, { status: 500 })
  }
}