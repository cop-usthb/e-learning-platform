import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const courseId = params.courseId
    
    // Vérifier si l'utilisateur est connecté
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { purchased: false, progress: 0 },
        { status: 200 }
      )
    }

    const userId = session.user.id

    const { db } = await connectToDatabase()
    
    // Rechercher si l'utilisateur a acheté ce cours
    const user = await db.collection("Users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { purchasedCourses: 1 } }
    )
    
    // Vérifier si le cours est dans la liste des cours achetés
    const hasPurchased = user?.purchasedCourses?.some(
      (id: string) => id === courseId || id.toString() === courseId
    ) || false

    // Si l'utilisateur a acheté le cours, récupérer sa progression
    let progress = 0
    
    if (hasPurchased) {
      const courseProgress = await db.collection("CourseProgress").findOne({
        userId: new ObjectId(userId),
        courseId: new ObjectId(courseId)
      })
      
      if (courseProgress) {
        // Calculer le pourcentage de progression
        const totalChapters = courseProgress.chapters?.length || 0
        const completedChapters = courseProgress.chapters?.filter(
          (chapter: { completed: boolean }) => chapter.completed
        ).length || 0
        
        progress = totalChapters > 0 
          ? Math.round((completedChapters / totalChapters) * 100) 
          : 0
      }
    }

    return NextResponse.json({ purchased: hasPurchased, progress })
    
  } catch (error) {
    console.error("Error checking course status:", error)
    return NextResponse.json(
      { error: "Erreur lors de la vérification du statut du cours" },
      { status: 500 }
    )
  }
}