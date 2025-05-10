import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function getCourses(search = "", skill = "", partner = "") {
  try {
    const { db } = await connectToDatabase()

    // Construire la requête MongoDB
    const query: any = {}

    if (search) {
      query.course = { $regex: search, $options: "i" }
    }

    if (skill) {
      query.skills = { $regex: skill, $options: "i" }
    }

    if (partner) {
      query.partner = { $regex: partner, $options: "i" }
    }

    // Récupérer les cours depuis MongoDB
    const courses = await db.collection("Courses").find(query).toArray()

    return courses
  } catch (error) {
    console.error("Error fetching courses:", error)
    return []
  }
}

export async function getCourseById(id: string) {
  try {
    const { db } = await connectToDatabase()

    // Essayer de trouver le cours par ObjectId si c'est un ID MongoDB valide
    let course = null

    try {
      if (ObjectId.isValid(id)) {
        course = await db.collection("Courses").findOne({ _id: new ObjectId(id) })
      }
    } catch (error) {
      console.error("Error finding course by ObjectId:", error)
    }

    // Si on n'a pas trouvé le cours par ObjectId, essayer par l'ID numérique
    if (!course) {
      course = await db.collection("Courses").findOne({ id: Number.parseInt(id) })
    }

    return course
  } catch (error) {
    console.error("Error fetching course by id:", error)
    return null
  }
}

export async function getRecommendedCourses() {
  try {
    const { db } = await connectToDatabase()

    // Récupérer quelques cours aléatoires pour les recommandations
    const courses = await db
      .collection("Courses")
      .aggregate([{ $sample: { size: 3 } }])
      .toArray()

    return courses
  } catch (error) {
    console.error("Error fetching recommended courses:", error)
    return []
  }
}
