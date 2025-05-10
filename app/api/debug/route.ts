import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Vérifier la connexion à la base de données
    const dbInfo = {
      databaseName: db.databaseName,
      collections: await db.listCollections().toArray(),
    }

    // Récupérer un échantillon de cours
    const courseSample = await db.collection("Courses").find().limit(5).toArray()

    // Compter le nombre total de cours
    const totalCourses = await db.collection("Courses").countDocuments()

    // Récupérer un échantillon d'utilisateurs (sans les mots de passe)
    const usersSample = await db
      .collection("Users")
      .find({}, { projection: { password: 0 } })
      .limit(2)
      .toArray()

    // Compter le nombre total d'utilisateurs
    const totalUsers = await db.collection("Users").countDocuments()

    return NextResponse.json({
      success: true,
      dbInfo,
      totalCourses,
      courseSample,
      totalUsers,
      usersSample,
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}
