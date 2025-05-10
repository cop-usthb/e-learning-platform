import { NextResponse } from "next/server"
import { getCourses } from "@/lib/courses"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const skill = searchParams.get("skill") || ""
  const partner = searchParams.get("partner") || ""

  try {
    const courses = await getCourses(search, skill, partner)

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des cours" }, { status: 500 })
  }
}
