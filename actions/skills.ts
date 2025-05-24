"use server"

import { connectToDatabase } from "@/lib/mongodb"

export async function getSkills() {
  try {
    const { db } = await connectToDatabase()

    // Récupérer toutes les compétences uniques de la collection Course
    const skills = await db.collection("Course").distinct("skills")

    return skills || []
  } catch (error) {
    console.error("Error getting skills:", error)
    return []
  }
}
