"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import Link from "next/link"

interface ScoredCourseCardProps {
  course: any
}

export default function ScoredRecommendationCard({ course }: ScoredCourseCardProps) {
  // Vérifier si le cours existe
  if (!course) {
    return null
  }

  // Extraire l'ID du cours de manière sécurisée
  let courseId = "unknown"
  try {
    if (course._id) {
      courseId = typeof course._id === "string" ? course._id : String(course._id)
    } else if (course.id) {
      courseId = typeof course.id === "string" ? course.id : String(course.id)
    }
  } catch (error) {
    console.error("Error extracting course ID:", error)
    courseId = "unknown"
  }

  // Gérer différents formats de skills
  let skills: string[] = []
  if (typeof course.skills === "string") {
    skills = course.skills
      .replace(/[{}"\\]/g, "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 3)
  } else if (Array.isArray(course.skills)) {
    skills = course.skills.slice(0, 3)
  }

  // URL du cours
  const courseUrl = `/courses/${courseId}`

  return (
    <Card className="h-full flex flex-col relative">
      {/* Badge de score dans le coin supérieur droit */}
      <div 
        className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold z-10"
      >
        {course.recommendationScore}%
      </div>
      
      <CardContent className="pt-6 flex-grow">
        <Badge variant="outline" className="mb-2">
          {course.partner || "Partenaire non spécifié"}
        </Badge>
        <h3 className="text-lg font-semibold mb-2 pr-16">
          <Link href={courseId !== "unknown" ? courseUrl : "#"} className="hover:underline">
            {course.course || "Cours sans titre"}
          </Link>
        </h3>

        <div className="flex items-center mb-4">
          <div className="flex items-center mr-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-medium">{course.rating || "N/A"}</span>
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
          <span>{course.duration || "Non spécifié"}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={courseId !== "unknown" ? courseUrl : "#"} className="w-full">
          <Button variant="outline" className="w-full">
            Voir le cours
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}