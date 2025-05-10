import { notFound } from "next/navigation"
import { getCourseById } from "@/lib/courses"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import PurchaseCourseButton from "@/components/purchase-course-button"

export default async function CoursePage({ params }: { params: { id: string } }) {
  // Properly await params
  const { id } = params

  const course = await getCourseById(id)

  if (!course) {
    notFound()
  }

  // Parse skills from string to array
  const skills =
    typeof course.skills === "string"
      ? course.skills
          .replace(/[{}"\\]/g, "")
          .split(",")
          .map((s) => s.trim())
      : Array.isArray(course.skills)
        ? course.skills
        : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Badge variant="outline" className="mb-2">
            {course.partner}
          </Badge>
          <h1 className="text-3xl font-bold mb-2">{course.course}</h1>

          <div className="flex items-center mb-4">
            <div className="flex items-center mr-3">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
              <span className="font-medium">{course.rating}</span>
            </div>
            <span className="text-muted-foreground">({course.reviewcount} avis)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col border rounded-lg p-3">
              <span className="text-sm text-muted-foreground">Niveau</span>
              <span className="font-medium">{course.level}</span>
            </div>
            <div className="flex flex-col border rounded-lg p-3">
              <span className="text-sm text-muted-foreground">Durée</span>
              <span className="font-medium">{course.duration}</span>
            </div>
            <div className="flex flex-col border rounded-lg p-3">
              <span className="text-sm text-muted-foreground">Certification</span>
              <span className="font-medium">{course.certificatetype}</span>
            </div>
          </div>

          <PurchaseCourseButton courseId={course._id ? course._id.toString() : course.id.toString()} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Compétences que vous développerez</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">À propos de ce cours</h2>
          <p className="text-muted-foreground">
            Ce cours vous permettra de développer des compétences essentielles en {skills.slice(0, 3).join(", ")} et
            bien plus. Proposé par {course.partner}, ce programme {course.level.toLowerCase()} vous guidera à travers un
            parcours d'apprentissage structuré sur {course.duration.toLowerCase()}.
          </p>
        </div>
      </div>
    </div>
  )
}
