"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface CourseDetailsProps {
  course: any
  userStatus?: {
    purchased: boolean
    progress: number
    completedChapters: string[]
    rating: number | null
  }
}

export function CourseDetails({ course, userStatus }: CourseDetailsProps) {
  const isPurchased = userStatus?.purchased || false
  const progress = userStatus?.progress || 0
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{course.course}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-muted-foreground">Par {course.partner}</span>
            {course.rating && (
              <Badge variant="outline">
                {course.rating} ⭐ ({course.reviewcount || "0"} avis)
              </Badge>
            )}
            {course.level && (
              <Badge variant="secondary">
                {course.level}
              </Badge>
            )}
          </div>
        </div>

        {isPurchased && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Votre progression</h3>
            <Progress value={progress} className="h-2 mb-1" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress}% complété</span>
              {userStatus?.completedChapters && (
                <span>{userStatus.completedChapters.length} chapitres terminés</span>
              )}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-muted-foreground whitespace-pre-line">{course.description}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Ce que vous apprendrez</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {course.learningOutcomes ? (
              course.learningOutcomes.map((outcome: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>{outcome}</span>
                </li>
              ))
            ) : (
              course.skills && course.skills.slice(0, 6).map((skill: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>{skill}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="bg-card border rounded-lg p-6 sticky top-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Détails du cours</h3>
              <ul className="mt-2 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Durée</span>
                  <span>{course.duration}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Niveau</span>
                  <span>{course.level}</span>
                </li>
                {course.certificatetype && (
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Certification</span>
                    <span>{course.certificatetype}</span>
                  </li>
                )}
                {isPurchased && userStatus?.purchasedAt && (
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Inscrit depuis</span>
                    <span>{formatDistanceToNow(new Date(userStatus.purchasedAt), { locale: fr, addSuffix: true })}</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium">Compétences</h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {course.skills?.slice(0, 5).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="mr-1 mb-1">
                    {skill}
                  </Badge>
                ))}
                {course.skills?.length > 5 && (
                  <Badge variant="outline" className="mr-1 mb-1">
                    +{course.skills.length - 5}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
