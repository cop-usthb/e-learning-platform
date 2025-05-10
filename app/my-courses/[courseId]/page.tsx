import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getCourseById } from "@/lib/courses"
import { getUserCourseProgress } from "@/lib/user"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import CourseChapters from "@/components/course-chapters"
import CourseActions from "@/components/course-actions"

export default async function MyCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Properly await params
  const { id } = await params

  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const course = await getCourseById(id)

  if (!course) {
    notFound()
  }

  // Récupérer les informations de progression de l'utilisateur pour ce cours
  const progress = await getUserCourseProgress(session.user.id, id)

  // Si l'utilisateur n'a pas acheté ce cours, rediriger vers la page des cours
  if (!progress) {
    redirect("/profile")
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
              <span className="text-sm text-muted-foreground">Progression</span>
              <span className="font-medium">{progress.progress}%</span>
            </div>
          </div>

          <CourseActions courseId={id} userRating={progress.rating} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Chapitres du cours</h2>
          <CourseChapters courseId={id} completedChapters={progress.completedChapters || []} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Compétences développées</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
