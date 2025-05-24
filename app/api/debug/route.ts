import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const courseId = searchParams.get("courseId")

    if (!userId) {
      return NextResponse.json({ error: "userId parameter is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Récupérer les informations de l'utilisateur
    const user = await db.collection("users").findOne({ _id: userId })

    // Récupérer les cours achetés par l'utilisateur
    const query = courseId ? { userId, courseId } : { userId }
    const userCourses = await db.collection("userCourses").find(query).toArray()

    return NextResponse.json({
      user: user ? { ...user, _id: user._id.toString() } : null,
      userCourses: userCourses.map((course) => ({
        ...course,
        _id: course._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Error in debug API:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
