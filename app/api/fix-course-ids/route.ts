import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Récupérer tous les cours
    const courses = await db.collection("Course").find({}).toArray()

    // Récupérer tous les userCourses
    const userCourses = await db.collection("userCourses").find({}).toArray()

    let updatedCount = 0

    // Pour chaque userCourse, vérifier si courseId est un ObjectId et le convertir en string si nécessaire
    for (const userCourse of userCourses) {
      // Vérifier si courseId est un ObjectId
      let needsUpdate = false
      let courseIdString = userCourse.courseId

      // Si courseId est un ObjectId, le convertir en string
      if (
        userCourse.courseId &&
        typeof userCourse.courseId === "object" &&
        userCourse.courseId._bsontype === "ObjectID"
      ) {
        courseIdString = userCourse.courseId.toString()
        needsUpdate = true
      }

      // Vérifier si le cours existe
      const course = courses.find((c) => c._id.toString() === courseIdString)

      if (needsUpdate && course) {
        // Mettre à jour le document avec l'ID en string
        await db.collection("userCourses").updateOne(
          { _id: userCourse._id },
          {
            $set: {
              courseId: courseIdString,
              // Mettre à jour d'autres informations si nécessaire
              courseName: course.course || "Cours sans titre",
              partner: course.partner || "Partenaire inconnu",
            },
          },
        )
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} cours utilisateur mis à jour`,
      totalUserCourses: userCourses.length,
      totalCourses: courses.length,
    })
  } catch (error) {
    console.error("Error fixing course IDs:", error)
    return NextResponse.json({ success: false, message: "Une erreur est survenue" }, { status: 500 })
  }
}
