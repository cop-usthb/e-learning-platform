import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const { courseId, price } = await request.json()
    
    if (!courseId) {
      return NextResponse.json(
        { error: "ID du cours manquant" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est connecté
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    // Ajouter le cours à la liste des cours achetés par l'utilisateur
    // Utilisation de $addToSet pour éviter les doublons, mais sans vérification préalable
    await db.collection("Users").updateOne(
      { _id: new ObjectId(userId) },
      { 
        $addToSet: { purchasedCourses: new ObjectId(courseId) },
        $set: { updatedAt: new Date() }
      }
    )

    // Enregistrer la transaction d'achat
    await db.collection("Purchases").insertOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      price: price || 0,
      purchaseDate: new Date()
    })

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'achat du cours" },
      { status: 500 }
    )
  }
}