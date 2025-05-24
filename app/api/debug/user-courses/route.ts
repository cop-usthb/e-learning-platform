import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    // Récupérer les cours de l'utilisateur
    const userCourses = await db.collection("userCourses").find({ userId }).toArray()

    // Récupérer les détails des cours
    const courseIds = userCourses.map((uc) => uc.courseId)
    const courses = await db
      .collection("Course")
      .find({
        $or: [
          {
            _id: {
              $in: courseIds
                .map((id) => {
                  try {
                    return new ObjectId(id)
                  } catch {
                    return null
                  }
                })
                .filter(Boolean),
            },
          },
          { _id: { $in: courseIds.filter((id) => typeof id === "string") } },
        ],
      })
      .toArray()

    // Créer un mapping des cours pour référence rapide
    const courseMap = {}
    courses.forEach((course) => {
      courseMap[course._id.toString()] = {
        title: course.course,
        partner: course.partner,
        // autres informations pertinentes
      }
    })

    // Ajouter des informations de diagnostic
    const diagnosticInfo = userCourses.map((uc) => ({
      _id: uc._id.toString(),
      userId: uc.userId,
      courseId: uc.courseId,
      courseIdType: typeof uc.courseId,
      courseIdIsObjectId: uc.courseId && typeof uc.courseId === "object" && uc.courseId._bsontype === "ObjectID",
      courseIdString: uc.courseId ? (typeof uc.courseId === "object" ? uc.courseId.toString() : uc.courseId) : null,
      courseExists: courseMap[uc.courseId] !== undefined,
      courseInfo: courseMap[uc.courseId] || null,
      progress: uc.progress,
      rating: uc.rating,
      completedChapters: uc.completedChapters,
    }))

    return NextResponse.json({
      userCourses: diagnosticInfo,
      courseMap,
    })
  } catch (error) {
    console.error("Error in user courses debug API:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

// Import manquant
import { ObjectId } from "mongodb"
