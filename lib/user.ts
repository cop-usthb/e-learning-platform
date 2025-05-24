import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { UserProfile, UserCourse } from "@/lib/types"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Fonction pour vérifier le statut d'un cours pour un utilisateur
export async function getUserCourseStatus(userId: string, courseId: string) {
  try {
    const { db } = await connectToDatabase()

    console.log(`Vérification du statut du cours ${courseId} pour l'utilisateur ${userId}`)

    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    
    if (!user || !user.courses) {
      return { purchased: false, progress: 0, completedChapters: [], rating: null }
    }
    
    // Trouver le cours dans la liste des cours de l'utilisateur
    const userCourse = user.courses.find((c: any) => c.courseId === courseId)

    console.log("Statut du cours:", userCourse ? "Acheté" : "Non acheté")

    if (!userCourse) {
      return { purchased: false, progress: 0, completedChapters: [], rating: null }
    }

    // Renvoyer les chapitres complétés sous forme de numéros (["1", "2", "3"])
    return {
      purchased: userCourse.purchased || false,
      progress: userCourse.progress || 0,
      completedChapters: userCourse.completedChapters || [],
      rating: userCourse.rating !== undefined ? userCourse.rating : null,
    }
  } catch (error) {
    console.error("Error getting user course status:", error)
    return { purchased: false, progress: 0, completedChapters: [], rating: null }
  }
}

// Fonction pour récupérer tous les cours d'un utilisateur
export async function getUserCourses(userId: string): Promise<UserCourse[]> {
  try {
    const { db } = await connectToDatabase()

    console.log(`Récupération des cours pour l'utilisateur: ${userId}`)

    // Récupérer l'utilisateur avec ses cours
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user || !user.courses || user.courses.length === 0) {
      console.log("Aucun cours trouvé pour cet utilisateur")
      return []
    }

    console.log(`Nombre de cours trouvés: ${user.courses.length}`)

    // Formater les données pour correspondre au type UserCourse
    return user.courses.map((course: any) => ({
      courseId: course.courseId,
      progress: course.progress || 0,
      purchased: course.purchased || false,
      purchasedAt: course.purchasedAt || new Date().toISOString(),
      rating: course.rating !== undefined ? course.rating : null,
      completedChapters: course.completedChapters || [] // Ajouter cette ligne
    }))
  } catch (error) {
    console.error("Error getting user courses:", error)
    return []
  }
}

// Fonction pour obtenir le profil utilisateur avec ses cours
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { db } = await connectToDatabase()
    
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
    
    if (!user) {
      return null
    }
    
    return {
      id: user._id.toString(),
      name: user.name || "",
      email: user.email || "",
      image: user.image || "",
      courses: (user.courses || []).map((course: any) => ({
        _id: course._id?.toString() || new ObjectId().toString(),
        userId: userId,
        courseId: course.courseId,
        courseName: course.courseName || "Cours indisponible",
        partner: course.partner || "Inconnu",
        progress: course.progress || 0,
        purchased: course.purchased || false,
        purchasedAt: course.purchasedAt || new Date().toISOString(),
        rating: course.rating !== undefined ? course.rating : null,
        completedChapters: course.completedChapters || [],
        lastAccessed: course.lastAccessed || new Date().toISOString(),
      })),
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Fonction pour mettre à jour les intérêts d'un utilisateur
export async function updateUserInterests(interests: string[]) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { success: false, message: "Vous devez être connecté" }
    }

    if (interests.length === 0) {
      return { success: false, message: "Sélectionnez au moins un thème" }
    }

    const response = await fetch("/api/user/interests", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interests }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Erreur lors de la mise à jour des thèmes",
      }
    }

    return { success: true, message: "Thèmes mis à jour avec succès" }
  } catch (error) {
    console.error("Error updating user interests:", error)
    return { success: false, message: "Une erreur est survenue" }
  }
}
