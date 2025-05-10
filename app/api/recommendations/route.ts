import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    // Vérifier si l'utilisateur est connecté
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const { db } = await connectToDatabase()
    
    // Récupérer les centres d'intérêt de l'utilisateur
    const user = await db.collection("Users").findOne({ 
      _id: new ObjectId(userId) 
    })
    
    if (!user || !user.interests || user.interests.length === 0) {
      // Si l'utilisateur n'a pas de centres d'intérêt, retourner des cours génériques
      const courses = await db.collection("Courses")
        .find({})
        .sort({ rating: -1 })
        .limit(6)
        .toArray()
        
      return NextResponse.json(courses.map(course => ({
        ...course,
        recommendationScore: 70 // Score par défaut
      })))
    }
    
    // Sinon, récupérer des cours basés sur les centres d'intérêt
    // Logique de recommandation personnalisée ici
    // ...

    // Exemple simplifié
    const courses = await db.collection("Courses")
      .find({ 
        $or: user.interests.map(interest => ({
          $or: [
            { skills: { $regex: interest, $options: 'i' } },
            { title: { $regex: interest, $options: 'i' } },
            { description: { $regex: interest, $options: 'i' } }
          ]
        }))
      })
      .limit(6)
      .toArray()
      
    // Ajouter un score de recommandation
    const recommendedCourses = courses.map(course => ({
      ...course,
      recommendationScore: Math.floor(Math.random() * 30) + 70 // Score entre 70 et 99
    }))
    
    return NextResponse.json(recommendedCourses)
    
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des recommandations" },
      { status: 500 }
    )
  }
}
