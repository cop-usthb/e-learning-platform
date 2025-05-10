import { getRecommendedCourses } from "@/lib/courses"
import CourseCard from "@/components/course-card"

export default async function RecommendedCourses() {
  const courses = await getRecommendedCourses()

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun cours recommandé pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  )
}
