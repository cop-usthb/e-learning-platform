import { CourseFilters } from "@/components/course-filters"
import { CourseGrid } from "@/components/course-grid"
import { CourseSearch } from "@/components/course-search"
import { getAllCourses, getThemes, getPartners } from "@/lib/courses"
import { Suspense } from "react"

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { q?: string; theme?: string; partner?: string }
}) {
  const resolvedParams = await Promise.resolve(searchParams)
  const { q, theme, partner } = resolvedParams

  const courses = await getAllCourses({ q, theme, partner })
  const themes = await getThemes()
  const partners = await getPartners()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tous les cours</h1>

      <div className="mb-6">
        <CourseSearch />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CourseFilters themes={themes} partners={partners} />
        </div>

        <div className="lg:col-span-3">
          <Suspense fallback={<div>Chargement des cours...</div>}>
            <CourseGrid courses={courses} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
