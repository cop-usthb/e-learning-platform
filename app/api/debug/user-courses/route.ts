import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user with purchased courses
    const user = await db.collection("Users").findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }, // Exclude password
    )

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Get course details for each purchased course
    const purchasedCourseIds = (user.purchasedCourses || [])
      .map((pc: any) => {
        try {
          return ObjectId.isValid(pc.courseId) ? new ObjectId(pc.courseId) : pc.courseId
        } catch (error) {
          console.error("Error converting courseId:", error)
          return null
        }
      })
      .filter(Boolean)

    const purchasedCourses =
      purchasedCourseIds.length > 0
        ? await db
            .collection("Courses")
            .find({ _id: { $in: purchasedCourseIds } })
            .toArray()
        : []

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id.toString(),
      },
      purchasedCourseIds,
      purchasedCourses: purchasedCourses.map((course: any) => ({
        ...course,
        _id: course._id.toString(),
      })),
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur inconnue est survenue",
      },
      { status: 500 },
    )
  }
}
