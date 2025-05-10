import { connectToDatabase } from "@/lib/mongodb"

export async function getRandomRecommendations(interests: string[] = [], limit = 6) {
  try {
    const { db } = await connectToDatabase()

    let query = {}

    // Si l'utilisateur a des intérêts, filtrer les cours qui correspondent
    if (interests && interests.length > 0) {
      const interestRegex = interests.map((interest) => new RegExp(interest, "i"))
      query = {
        $or: interestRegex.map((regex) => ({ skills: { $regex: regex } })),
      }
    }

    // Récupérer des cours aléatoires
    const courses = await db
      .collection("Courses")
      .aggregate([{ $match: query }, { $sample: { size: limit } }])
      .toArray()

    return courses
  } catch (error) {
    console.error("Error getting random recommendations:", error)
    return []
  }
}
