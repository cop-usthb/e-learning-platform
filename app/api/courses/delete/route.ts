import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { executeProfileUpdate } from "@/lib/executeScript"

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      )
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "ID de cours manquant" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    const userCourses = user.courses || []
    const courseIndex = userCourses.findIndex((c: any) => c.courseId === courseId)

    if (courseIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Cours non trouvé dans votre bibliothèque" },
        { status: 404 }
      )
    }

    // Supprimer le cours de la liste des cours de l'utilisateur
    userCourses.splice(courseIndex, 1)

    // Mettre à jour le document utilisateur
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { courses: userCourses } }
    )

    // Exécuter le script de mise à jour des profils après la suppression
    executeProfileUpdate("course_removal").catch(error => {
      console.error("Failed to update profiles after course removal:", error)
    })

    return NextResponse.json({
      success: true,
      message: "Cours supprimé de votre bibliothèque"
    })
  } catch (error) {
    console.error("Error deleting course:", error)
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue lors de la suppression du cours" },
      { status: 500 }
    )
  }
}