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

    const { courseId, progress } = await request.json()

    if (!courseId || progress === undefined) {
      return NextResponse.json({ error: "ID du cours et progression requis" }, { status: 400 })
    }

    // Valider la valeur de progression
    const progressValue = Number(progress)
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      return NextResponse.json({ error: "La progression doit être un nombre entre 0 et 100" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Déterminer le type d'ID (ObjectId ou ID numérique)
    const query: any = {
      _id: new ObjectId(session.user.id),
    }

    // Ajouter la condition pour le courseId
    if (ObjectId.isValid(courseId)) {
      // Si c'est un ObjectId valide, chercher par ObjectId ou par chaîne
      query["purchasedCourses.courseId"] = { $in: [courseId, courseId.toString()] }
    } else {
      // Sinon, chercher par la valeur telle quelle
      query["purchasedCourses.courseId"] = courseId
    }

    // Mettre à jour la progression du cours
    const result = await db.collection("Users").updateOne(query, {
      $set: {
        "purchasedCourses.$.progress": progressValue,
      },
    })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Cours non trouvé ou non acheté" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating course progress:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la progression" }, { status: 500 })
  }
}
