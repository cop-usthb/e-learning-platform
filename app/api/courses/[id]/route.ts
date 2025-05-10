import { NextResponse } from "next/server"
import { getCourseById } from "@/lib/courses"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const course = await getCourseById(params.id)

    if (!course) {
      return NextResponse.json({ error: "Cours non trouvé" }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du cours" }, { status: 500 })
  }
}
