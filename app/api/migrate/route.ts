import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Find courses without themes
    const coursesWithoutTheme = await db
      .collection("Course")
      .find({ $or: [{ theme: { $exists: false } }, { theme: null }, { theme: "" }] })
      .toArray()
    
    console.log(`Found ${coursesWithoutTheme.length} courses without themes`)
    
    // Update count
    let updatedCount = 0
    
    // Update courses without themes
    for (const course of coursesWithoutTheme) {
      let theme = "General"
      
      // If course has skills, use the first skill as theme
      if (course.skills && Array.isArray(course.skills) && course.skills.length > 0) {
        theme = course.skills[0]
      }
      
      await db.collection("Course").updateOne(
        { _id: course._id },
        { $set: { theme } }
      )
      
      updatedCount++
    }
    
    // Re-fetch distinct themes after update
    const updatedThemes = await db.collection("Course").distinct("theme")
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} courses with themes`,
      initialCoursesWithoutTheme: coursesWithoutTheme.length,
      updatedThemesCount: updatedThemes.length,
      themes: updatedThemes
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { success: false, message: "Migration failed", error: String(error) },
      { status: 500 }
    )
  }
}