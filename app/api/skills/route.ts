import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Récupérer tous les cours
    const courses = await db.collection("Courses").find({}).toArray()

    // Extraire toutes les compétences de tous les cours
    const allSkills = new Set<string>()
    
    courses.forEach((course) => {
      if (course.skills) {
        let skills: string[] = []
        
        // Traiter les différents formats de skills
        if (typeof course.skills === "string") {
          skills = course.skills
            .replace(/[{}"\\]/g, "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        } else if (Array.isArray(course.skills)) {
          skills = course.skills
        }
        
        // Ajouter les compétences au Set (pour éliminer les doublons)
        skills.forEach((skill) => allSkills.add(skill))
      }
    })

    // Convertir le Set en tableau et le retourner
    return NextResponse.json(Array.from(allSkills))
  } catch (error) {
    console.error("Error fetching skills:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des compétences" },
      { status: 500 }
    )
  }
}