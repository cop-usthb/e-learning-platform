'use client'

import { useSession } from 'next-auth/react'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecommendedCoursesProps {
  courses: any[]
}

export function RecommendedCourses({ courses }: RecommendedCoursesProps) {
  const { status } = useSession()

  // Ne pas afficher si l'utilisateur n'est pas connecté
  if (status === 'unauthenticated') {
    return null
  }

  // Ne pas afficher pendant le chargement de la session
  if (status === 'loading') {
    return null
  }

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
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.course}</CardTitle>
                  {course.partner && (
                    <p className="text-sm text-muted-foreground">Par {course.partner}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      {course.satisfactionRate && (
                        <Badge variant="secondary" className="text-xs">
                          {course.satisfactionRate}% satisfaction
                        </Badge>
                      )}
                      {course.theme && (
                        <Badge variant="outline" className="text-xs">
                          {course.theme}
                        </Badge>
                      )}
                    </div>
                    <span className="text-lg font-bold">Gratuit</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
