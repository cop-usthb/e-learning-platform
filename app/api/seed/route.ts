import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

// Exemple de données pour les cours
const sampleCourses = [
  {
    id: 1,
    partner: "SkillUp EdTech",
    course: "Introduction à JavaScript",
    skills: "JavaScript, Web Development, Programming",
    rating: "4.7",
    reviewcount: "1.2k",
    level: "Débutant",
    certificatetype: "Certificat",
    duration: "2 - 4 Semaines",
    crediteligibility: "false",
  },
  {
    id: 2,
    partner: "Microsoft",
    course: "Azure Cloud Fundamentals",
    skills: "Cloud Computing, Azure, IT Infrastructure",
    rating: "4.9",
    reviewcount: "3.5k",
    level: "Intermédiaire",
    certificatetype: "Certification Professionnelle",
    duration: "1 - 2 Mois",
    crediteligibility: "true",
  },
  {
    id: 3,
    partner: "Google",
    course: "Data Science avec Python",
    skills: "Python, Data Science, Machine Learning",
    rating: "4.8",
    reviewcount: "2.8k",
    level: "Intermédiaire",
    certificatetype: "Certificat",
    duration: "2 - 3 Mois",
    crediteligibility: "false",
  },
  {
    id: 4,
    partner: "Amazon Web Services",
    course: "AWS Solutions Architect",
    skills: "Cloud Computing, AWS, Cloud Architecture",
    rating: "4.7",
    reviewcount: "4.2k",
    level: "Avancé",
    certificatetype: "Certification Professionnelle",
    duration: "3 - 6 Mois",
    crediteligibility: "true",
  },
  {
    id: 5,
    partner: "IBM",
    course: "Artificial Intelligence Fundamentals",
    skills: "Artificial Intelligence, Machine Learning, Deep Learning",
    rating: "4.6",
    reviewcount: "1.9k",
    level: "Débutant",
    certificatetype: "Certificat",
    duration: "2 - 4 Mois",
    crediteligibility: "false",
  },
  {
    id: 6,
    partner: "Meta",
    course: "React Developer",
    skills: "React, JavaScript, Web Development",
    rating: "4.7",
    reviewcount: "3.1k",
    level: "Intermédiaire",
    certificatetype: "Certificat",
    duration: "2 - 4 Mois",
    crediteligibility: "false",
  },
]

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Vérifier si la collection existe déjà
    const collections = await db.listCollections({ name: "Courses" }).toArray()

    if (collections.length > 0) {
      // La collection existe, vérifier si elle contient des données
      const count = await db.collection("Courses").countDocuments()

      if (count > 0) {
        return NextResponse.json({
          success: true,
          message: `La collection Courses existe déjà et contient ${count} documents.`,
          existingData: true,
        })
      }
    }

    // Insérer les données d'exemple
    const result = await db.collection("Courses").insertMany(sampleCourses)

    return NextResponse.json({
      success: true,
      message: `${result.insertedCount} cours ont été ajoutés à la base de données.`,
      insertedIds: result.insertedIds,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
      },
      { status: 500 },
    )
  }
}
