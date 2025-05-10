import { getCourses } from "@/lib/courses"
import CourseCard from "@/components/course-card"

interface CourseListProps {
  search?: string
  skill?: string
  partner?: string
}

export default async function CourseList({ search = "", skill = "", partner = "" }: CourseListProps) {
  const courses = await getCourses(search, skill, partner)

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun cours trouvé. Essayez de modifier vos filtres.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  )
}
