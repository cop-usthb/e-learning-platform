import { NextResponse } from "next/server"
import { getThemes } from "@/lib/courses"

export async function GET() {
  try {
    const themes = await getThemes()
    
    return NextResponse.json({ 
      success: true, 
      themes 
    })
  } catch (error) {
    console.error("Error fetching themes:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch themes" },
      { status: 500 }
    )
  }
}