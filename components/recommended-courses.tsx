import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Course } from "@/lib/types"

interface RecommendedCoursesProps {
  courses: Course[]
}

export function RecommendedCourses({ courses }: RecommendedCoursesProps) {
  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Cours recommandés pour vous</h2>
            <p className="text-muted-foreground mt-2">Basés sur vos centres d'intérêt et votre activité</p>
          </div>
          <Link href="/courses">
            <span className="text-primary hover:underline">Voir tous les cours</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link key={course._id} href={`/courses/${course._id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.course}</CardTitle>
                    {course.satisfactionRate && (
                      <Badge variant="outline" className="ml-2">
                        {course.satisfactionRate}% 
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  <div className="mt-4 font-bold">Gratuit</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
