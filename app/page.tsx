import { HeroSection } from "@/components/hero-section"
import { RecommendedCourses } from "@/components/recommended-courses"
import { getRecommendedCourses } from "@/lib/courses"

export default async function Home() {
  const recommendedCourses = await getRecommendedCourses()

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <RecommendedCourses courses={recommendedCourses} />
    </div>
  )
}
