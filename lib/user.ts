import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function getUserPurchasedCourses(userId: string) {
  try {
    const { db } = await connectToDatabase()

    const user = await db.collection("Users").findOne({ _id: new ObjectId(userId) })

    if (!user || !user.purchasedCourses || user.purchasedCourses.length === 0) {
      console.log("User has no purchased courses")
      return []
    }

    // Log pour le débogage
    console.log("User purchased courses:", JSON.stringify(user.purchasedCourses, null, 2))

    // Filtrer strictement les cours qui ont une date d'achat valide
    const validPurchasedCourses = user.purchasedCourses.filter((pc: any) => {
      // Vérifier que la date d'achat est valide
      const hasValidPurchaseDate =
        pc.purchaseDate instanceof Date || (typeof pc.purchaseDate === "string" && pc.purchaseDate.trim() !== "")

      // Vérifier si c'est le cours problématique
      const courseId = pc.courseId ? pc.courseId.toString() : ""

      // Log pour le débogage
      console.log(`Course ID: ${courseId}, Has valid purchase date: ${hasValidPurchaseDate}`)

      return hasValidPurchaseDate
    })

    if (validPurchasedCourses.length === 0) {
      console.log("User has no valid purchased courses with purchase date")
      return []
    }

    // Fetch course details for each purchased course
    const courses = await Promise.all(
      validPurchasedCourses.map(async (purchasedCourse: any) => {
        const courseId = purchasedCourse.courseId

        // Try to fetch by ObjectId if it's a valid ObjectId
        let course = null
        if (ObjectId.isValid(courseId)) {
          course = await db.collection("Courses").findOne({ _id: new ObjectId(courseId) })
        }

        // If not found by ObjectId, try fetching by the original courseId (could be a string or number)
        if (!course && courseId) {
          // Try as a number
          const numericId = Number.parseInt(courseId, 10)
          if (!isNaN(numericId)) {
            course = await db.collection("Courses").findOne({ id: numericId })
          }

          // Try as a string if still not found
          if (!course) {
            course = await db.collection("Courses").findOne({ id: courseId })
          }
        }

        if (!course) {
          console.log(`Course not found for courseId: ${courseId}`)
          return null // Skip if course not found
        }

        // Vérifier si c'est le cours problématique
        if (course.course && course.course.includes("Reinforcement Learning")) {
          console.log(`Found Reinforcement Learning course: ${course.course}`)

          // Vérifier strictement la date d'achat
          if (
            !purchasedCourse.purchaseDate ||
            (typeof purchasedCourse.purchaseDate === "string" && purchasedCourse.purchaseDate.trim() === "")
          ) {
            console.log(`Skipping Reinforcement Learning course because it has no valid purchase date`)
            return null
          }
        }

        // Calculate progress percentage based on completed chapters
        const completedChapters = purchasedCourse.completedChapters || []
        const progressPercentage = completedChapters.length > 0 ? Math.round((completedChapters.length / 10) * 100) : 0

        // Utiliser la note de l'utilisateur si disponible, sinon utiliser la note du cours
        const userRating = purchasedCourse.rating || 0
        const courseRating = course.rating || "N/A"

        return {
          ...course,
          progress: progressPercentage,
          completedChapters: completedChapters,
          userRating: userRating,
          purchaseDate: purchasedCourse.purchaseDate || null,
        }
      }),
    )

    // Filter out any null courses (courses that weren't found)
    const validCourses = courses.filter(Boolean)

    // Filtrer explicitement pour exclure le cours problématique
    const filteredCourses = validCourses.filter((course) => {
      if (course.course && course.course.includes("Reinforcement Learning")) {
        // Vérifier une dernière fois que ce cours a une date d'achat valide
        return (
          course.purchaseDate instanceof Date ||
          (typeof course.purchaseDate === "string" && course.purchaseDate.trim() !== "")
        )
      }
      return true
    })

    console.log(`Final courses count: ${filteredCourses.length}`)
    return filteredCourses
  } catch (error) {
    console.error("Error fetching user purchased courses:", error)
    return []
  }
}

// Fonction pour récupérer la progression d'un cours spécifique
export async function getUserCourseProgress(userId: string, courseId: string) {
  try {
    const { db } = await connectToDatabase()

    const user = await db.collection("Users").findOne({ _id: new ObjectId(userId) })

    if (!user || !user.purchasedCourses) {
      return null
    }

    // Trouver le cours acheté correspondant
    const purchasedCourse = user.purchasedCourses.find((pc: any) => {
      // Vérifier que le cours a une date d'achat valide
      const hasValidPurchaseDate =
        pc.purchaseDate instanceof Date || (typeof pc.purchaseDate === "string" && pc.purchaseDate.trim() !== "")

      if (!hasValidPurchaseDate) return false

      // Comparer avec l'ID du cours (qui peut être un ObjectId ou une chaîne)
      if (pc.courseId === courseId) {
        return true
      }

      // Si l'ID du cours est un ObjectId, le convertir en chaîne pour la comparaison
      if (ObjectId.isValid(pc.courseId) && pc.courseId.toString() === courseId) {
        return true
      }

      return false
    })

    if (!purchasedCourse) {
      return null
    }

    // Calculate progress percentage
    const completedChapters = purchasedCourse.completedChapters || []
    const progressPercentage = completedChapters.length > 0 ? Math.round((completedChapters.length / 10) * 100) : 0

    return {
      progress: progressPercentage,
      completedChapters: completedChapters,
      rating: purchasedCourse.rating || 0,
      purchaseDate: purchasedCourse.purchaseDate || null,
    }
  } catch (error) {
    console.error("Error fetching user course progress:", error)
    return null
  }
}
