import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Get a sample course with theme
    const sampleCourses = await db.collection("Course").find().limit(5).toArray()
    
    // Get distinct themes
    const themes = await db.collection("Course").distinct("theme")
    
    return NextResponse.json({ 
      success: true, 
      sampleCourses: sampleCourses.map(course => ({
        id: course.id,
        course: course.course,
        theme: course.theme,
      })),
      themes,
      themesCount: themes.length,
      nonEmptyThemes: themes.filter(theme => theme && theme.trim() !== "").length
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      { success: false, message: "Debug endpoint error", error: String(error) },
      { status: 500 }
    )
  }
}