import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    // Supprimer tous les cours achetés par l'utilisateur
    const result = await db.collection("userCourses").deleteMany({ userId })

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} cours supprimés`,
    })
  } catch (error) {
    console.error("Error resetting user courses:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
