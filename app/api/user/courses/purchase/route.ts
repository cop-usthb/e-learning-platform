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

    // Vérifier si le cours existe
    let course = null

    // Essayer de trouver le cours par ObjectId si c'est un ID MongoDB valide
    if (ObjectId.isValid(courseId)) {
      course = await db.collection("Courses").findOne({ _id: new ObjectId(courseId) })
    }

    // Si on n'a pas trouvé le cours par ObjectId, essayer par ID numérique
    if (!course) {
      // Try to parse as a number first
      const courseIdNum = Number.parseInt(courseId, 10)
      if (!isNaN(courseIdNum)) {
        course = await db.collection("Courses").findOne({ id: courseIdNum })
      }

      // If still not found, try as a string ID
      if (!course) {
        course = await db.collection("Courses").findOne({ id: courseId })
      }
    }

    if (!course) {
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 })
    }

    // Déterminer l'ID à utiliser pour le stockage
    // Store the actual MongoDB _id as a string for consistency
    const courseIdToStore = course._id.toString()

    // Log for debugging
    console.log(`Adding course to user's purchased courses: ${courseIdToStore}`)

    // Vérifier si l'utilisateur a déjà acheté ce cours
    const user = await db.collection("Users").findOne({
      _id: new ObjectId(session.user.id),
      "purchasedCourses.courseId": courseIdToStore,
    })

    if (user) {
      return NextResponse.json({ success: true, message: "Cours déjà acheté" })
    }

    // Créer une date d'achat explicite
    const purchaseDate = new Date()

    // Ajouter le cours aux achats de l'utilisateur
    const result = await db.collection("Users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $addToSet: {
          purchasedCourses: {
            courseId: courseIdToStore,
            purchaseDate: purchaseDate,
            progress: 0,
            completedChapters: [],
            rating: null,
          },
        },
      },
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Échec de l'achat du cours" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error purchasing course:", error)
    return NextResponse.json({ error: "Erreur lors de l'achat du cours" }, { status: 500 })
  }
}
