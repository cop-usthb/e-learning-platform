import { Suspense } from "react"
import CourseSearch from "@/components/course-search"
import CourseFilters from "@/components/course-filters"
import CourseList from "@/components/course-list"
import { Skeleton } from "@/components/ui/skeleton"

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Convertir searchParams en objet standard pour éviter les erreurs d'utilisation synchrone
  const params = {
    search: searchParams.search ? String(searchParams.search) : "",
    skill: searchParams.skill ? String(searchParams.skill) : "",
    partner: searchParams.partner ? String(searchParams.partner) : "",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Tous les cours</h1>

      <div className="mb-8">
        <CourseSearch initialSearch={params.search} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CourseFilters />
        </div>

        <div className="lg:col-span-3">
          <Suspense fallback={<CoursesLoadingSkeleton />}>
            <CourseList search={params.search} skill={params.skill} partner={params.partner} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function CoursesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        ))}
    </div>
  )
}
