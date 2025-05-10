"use client"

import CourseCard from "@/components/course-card"

interface UserCoursesListProps {
  courses: any[]
}

export default function UserCoursesList({ courses }: UserCoursesListProps) {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Vous n'avez pas encore acheté de cours.</p>
      </div>
    )
  }

  // Vérifier que tous les cours ont bien été achetés (ont une date d'achat)
  const purchasedCourses = courses.filter((course) => {
    // Vérification stricte de la date d'achat
    const hasValidPurchaseDate =
      course.purchaseDate instanceof Date ||
      (typeof course.purchaseDate === "string" && course.purchaseDate.trim() !== "")

    // Vérification spécifique pour le cours problématique
    const isReinforcementLearningCourse =
      course.course && typeof course.course === "string" && course.course.includes("Reinforcement Learning")

    // Log pour le débogage
    if (isReinforcementLearningCourse) {
      console.log("Found Reinforcement Learning course in UserCoursesList:", {
        title: course.course,
        id: course._id,
        purchaseDate: course.purchaseDate,
        hasValidPurchaseDate,
      })

      // Exclure explicitement ce cours problématique
      return false
    }

    return hasValidPurchaseDate
  })

  if (purchasedCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Vous n'avez pas encore acheté de cours.</p>
      </div>
    )
  }

  // Log pour le débogage
  console.log(
    "Filtered purchased courses:",
    purchasedCourses.map((c) => ({
      id: c._id,
      title: c.course,
      hasPurchaseDate: !!c.purchaseDate,
    })),
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {purchasedCourses.map((course) => {
        // Ensure we have a string ID
        let courseId = "unknown"

        try {
          if (course._id) {
            courseId = typeof course._id === "string" ? course._id : String(course._id)
          } else if (course.id) {
            courseId = typeof course.id === "string" ? course.id : String(course.id)
          }
        } catch (error) {
          console.error("Error extracting course ID:", error)
          return null // Skip this course if we can't get a valid ID
        }

        if (courseId === "unknown") {
          return null // Skip this course if we can't get a valid ID
        }

        // Vérification supplémentaire pour s'assurer que le cours a été acheté
        if (!course.purchaseDate) {
          console.log(`Skipping course ${course.course} because it has no purchase date`)
          return null
        }

        // Vérification spécifique pour le cours problématique - exclusion explicite
        if (course.course && typeof course.course === "string" && course.course.includes("Reinforcement Learning")) {
          console.log(`Skipping Reinforcement Learning course in render`)
          return null
        }

        return (
          <div key={courseId}>
            <CourseCard course={course} showProgress={true} isPurchased={true} />
          </div>
        )
      })}
    </div>
  )
}
