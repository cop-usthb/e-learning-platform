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

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "ID du cours requis" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Supprimer le cours de la liste des cours achetés
    const result = await db.collection("Users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $pull: {
          purchasedCourses: { courseId: courseId },
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Cours non trouvé ou non acheté" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression du cours" }, { status: 500 })
  }
}
