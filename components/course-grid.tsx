import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/course-card"

interface CourseGridProps {
  courses: any[]
}

export function CourseGrid({ courses }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Aucun cours trouvé</h3>
        <p className="text-muted-foreground mt-2">Essayez de modifier vos critères de recherche</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Link key={course._id} href={`/courses/${course._id}`}>
          <CourseCard course={course} />
        </Link>
      ))}
    </div>
  )
}
