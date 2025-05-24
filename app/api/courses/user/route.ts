import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Non autorisé" },
        { status: 401 }
      )
    }

    // Obtenir l'ID d'utilisateur à partir des query parameters
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ID utilisateur manquant" },
        { status: 400 }
      )
    }

    let objectId
    try {
      objectId = new ObjectId(userId)
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "ID utilisateur invalide" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    const user = await db.collection("users").findOne({ _id: objectId })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérification que l'utilisateur actuel a le droit d'accéder aux données
    if (user.email !== session.user.email) {
      return NextResponse.json(
        { success: false, message: "Non autorisé à accéder à ces données" },
        { status: 403 }
      )
    }

    const userCourses = user.courses || []

    // Formater les cours de l'utilisateur
    const formattedCourses = userCourses.map((course: any) => ({
      _id: course._id?.toString() || new ObjectId().toString(),
      courseId: course.courseId,
      courseName: course.courseName || "Cours indisponible",
      partner: course.partner || null,
      progress: course.progress || 0,
      purchased: course.purchased || false,
      purchasedAt: course.purchasedAt || new Date().toISOString(),
      rating: course.rating !== undefined ? course.rating : null,
      completedChapters: course.completedChapters || [],
    }))

    return NextResponse.json({
      success: true,
      courses: formattedCourses,
    })
  } catch (error) {
    console.error("Error getting user courses:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération des cours" },
      { status: 500 }
    )
  }
}