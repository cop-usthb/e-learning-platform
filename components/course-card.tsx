import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface CourseCardProps {
  course: any
  showProgress?: boolean
  isPurchased?: boolean
}

export default function CourseCard({ course, showProgress = false, isPurchased = false }: CourseCardProps) {
  // Vérifier si le cours existe
  if (!course) {
    return null
  }

  // Extraire l'ID du cours de manière sécurisée et s'assurer qu'il s'agit d'une chaîne
  let courseId = "unknown"

  try {
    if (course._id) {
      courseId = typeof course._id === "string" ? course._id : String(course._id)
    } else if (course.id) {
      courseId = typeof course.id === "string" ? course.id : String(course.id)
    }
  } catch (error) {
    console.error("Error extracting course ID:", error)
    // Fallback to a safe default
    courseId = "unknown"
  }

  // Gérer différents formats de skills
  let skills: string[] = []
  if (typeof course.skills === "string") {
    // Essayer de nettoyer et parser les skills
    skills = course.skills
      .replace(/[{}"\\]/g, "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 3)
  } else if (Array.isArray(course.skills)) {
    skills = course.skills.slice(0, 3)
  }

  // Déterminer l'URL du cours en fonction de s'il est acheté ou non
  const courseUrl = isPurchased ? `/my-courses/${courseId}` : `/courses/${courseId}`

  // Déterminer la note à afficher
  // Si l'utilisateur a noté le cours, afficher sa note
  // Sinon, afficher la note du cours de la base de données
  const displayRating =
    isPurchased && course.userRating && course.userRating > 0 ? course.userRating : course.rating || "N/A"

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <Badge variant="outline" className="mb-2">
          {course.partner || "Partenaire non spécifié"}
        </Badge>
        <h3 className="text-lg font-semibold mb-2">
          <Link href={courseId !== "unknown" ? courseUrl : "#"} className="hover:underline">
            {course.course || "Cours sans titre"}
          </Link>
        </h3>

        <div className="flex items-center mb-4">
          <div className="flex items-center mr-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-medium">{displayRating}</span>
          </div>
          <span className="text-sm text-muted-foreground">({course.reviewcount || "0"} avis)</span>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{course.level || "Tous niveaux"}</span>
          <span>{course.duration || "Non sp��cifié"}</span>
        </div>

        {isPurchased && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progression</span>
              <span>{course.progress || 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress || 0}%` }} />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={courseId !== "unknown" ? courseUrl : "#"} className="w-full">
          <Button variant="outline" className="w-full">
            {isPurchased ? "Accéder aux chapitres" : "Voir le cours"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
