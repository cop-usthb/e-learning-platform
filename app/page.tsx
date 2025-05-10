import { Suspense } from "react"
import Hero from "@/components/hero"
import RecommendedCourses from "@/components/recommended-courses"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />
      <section className="my-16">
        <h2 className="text-3xl font-bold mb-8">Cours recommandés pour vous</h2>
        <Suspense fallback={<CoursesLoadingSkeleton />}>
          <RecommendedCourses />
        </Suspense>
      </section>
    </div>
  )
}

function CoursesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-40 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
    </div>
  )
}
