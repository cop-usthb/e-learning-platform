// Système de recommandation simple basé sur les intérêts de l'utilisateur
// Dans une application réelle, cela pourrait être un service Python plus sophistiqué

import { connectToDatabase } from "@/lib/mongodb"
import type { Course } from "@/lib/types"

export async function getRecommendationsForUser(userId: string, interests: string[]): Promise<Course[]> {
  try {
    const { db } = await connectToDatabase()

    // Récupérer les cours qui correspondent aux thèmes (intérêts) de l'utilisateur
    const courses = await db
      .collection("Course")
      .find({ theme: { $in: interests } }) // Changer 'skills' en 'theme'
      .limit(10)
      .toArray()

    // Simuler un score de satisfaction aléatoire
    const coursesWithRatings = courses.map((course) => ({
      ...course,
      _id: course._id.toString(),
      satisfactionRate: Math.floor(Math.random() * 30) + 70, // Entre 70 et 100
    }))

    // Trier par score de satisfaction (simulé)
    return coursesWithRatings.sort((a, b) => (b.satisfactionRate || 0) - (a.satisfactionRate || 0))
  } catch (error) {
    console.error("Error getting recommendations:", error)
    return []
  }
}
