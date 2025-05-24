import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Course } from "@/lib/types"

// Fonction pour récupérer les cours recommandés
export async function getRecommendedCourses(userId?: string) {
  try {
    const { db } = await connectToDatabase()

    // Récupérer des cours aléatoirement avec $sample
    const courses = await db
      .collection("Course")
      .aggregate([
        { $sample: { size: 8 } }, // Sélectionne 8 cours aléatoirement
      ])
      .toArray()

    // Ajouter manuellement un taux de satisfaction aléatoire si non présent
    const coursesWithRating = courses.map((course) => {
      // Générer un nombre aléatoire entre 70 et 100 si pas de rating
      const satisfactionRate = course.rating
        ? Math.round(course.rating * 20) // Convertir rating (0-5) en pourcentage (0-100)
        : Math.floor(Math.random() * 30) + 70

      // Générer des chapitres si non existants
      const chapters = course.chapters || generateChapters(course.course || "Cours")

      return {
        ...course,
        satisfactionRate,
        chapters,
      }
    })

    return coursesWithRating.map(formatCourse)
  } catch (error) {
    console.error("Error getting recommended courses:", error)
    return []
  }
}

// Fonction pour récupérer tous les cours avec filtres
export async function getAllCourses({
  q,
  theme,
  partner,
}: {
  q?: string
  theme?: string
  partner?: string
}) {
  try {
    const { db } = await connectToDatabase()

    const query: any = {}

    if (q) {
      query.course = { $regex: q, $options: "i" } // Recherche sur le champ course au lieu de title
    }

    if (theme) {
      query.theme = theme // Utiliser theme au lieu de skills
    }

    if (partner) {
      query.partner = partner
    }

    const courses = await db.collection("Course").find(query).toArray()

    // Ajouter des chapitres aux cours qui n'en ont pas
    const coursesWithChapters = courses.map((course) => {
      if (!course.chapters || course.chapters.length === 0) {
        return {
          ...course,
          chapters: generateChapters(course.course || "Cours"),
        }
      }
      return course
    })

    return coursesWithChapters.map(formatCourse)
  } catch (error) {
    console.error("Error getting all courses:", error)
    return []
  }
}

// Fonction pour récupérer un cours par son ID
export async function getCourseById(id: string) {
  try {
    const { db } = await connectToDatabase()

    let objectId
    try {
      objectId = new ObjectId(id)
    } catch (error) {
      return null
    }

    const course = await db.collection("Course").findOne({ _id: objectId })

    if (!course) {
      return null
    }

    // Ajouter des chapitres si le cours n'en a pas
    if (!course.chapters || course.chapters.length === 0) {
      course.chapters = generateChapters(course.course || "Cours")
    }

    return formatCourse(course)
  } catch (error) {
    console.error("Error getting course by ID:", error)
    return null
  }
}

// Fonction pour récupérer toutes les compétences disponibles
export async function getSkills() {
  try {
    const { db } = await connectToDatabase()

    const skills = await db.collection("Course").distinct("skills")

    return skills
  } catch (error) {
    console.error("Error getting skills:", error)
    return []
  }
}

// Fonction pour récupérer tous les partenaires disponibles
export async function getPartners() {
  try {
    const { db } = await connectToDatabase()

    const partners = await db.collection("Course").distinct("partner")

    return partners
  } catch (error) {
    console.error("Error getting partners:", error)
    return []
  }
}

// Fonction pour récupérer tous les thèmes disponibles
export async function getThemes() {
  try {
    const { db } = await connectToDatabase()

    const themes = await db.collection("Course").distinct("theme")

    return themes || []
  } catch (error) {
    console.error("Error getting themes:", error)
    return []
  }
}

// Fonction pour générer des chapitres fictifs si nécessaire
export function generateChapters(courseTitle: string) {
  const chaptersCount = Math.floor(Math.random() * 5) + 8 // Entre 8 et 12 chapitres
  const chapters = []

  for (let i = 1; i <= chaptersCount; i++) {
    // Suppression du console.log qui affichait les données des chapitres
    chapters.push({
      id: `chapter-${i}-${Math.random().toString(36).substring(2, 9)}`,
      title: `Chapitre ${i}`,
      description: `Contenu du chapitre ${i}`,
    })
  }

  return chapters
}

// Fonction pour formater un cours
function formatCourse(course: any): Course {
  return {
    ...course,
    _id: course._id.toString(),
    // Assurez-vous que theme est inclus explicitement
    theme: course.theme || "Non classé",
  }
}
