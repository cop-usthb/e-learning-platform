import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { StarIcon } from "lucide-react"

interface CourseCardProps {
  course: {
    _id: string
    course: string
    partner: string
    rating: number
    reviewcount: string
    level: string
    theme?: string // Rendu optionnel pour éviter les erreurs
    skills?: string[]
  }
}

export function CourseCard({ course }: CourseCardProps) {
  // Vérifier que le thème existe et n'est pas une chaîne vide
  // Utiliser console.log pour déboguer
  /*console.log("Données du cours:", { 
    id: course._id, 
    title: course.course, 
    themeValue: course.theme, 
    themeType: typeof course.theme 
  });*/
  
  // Déterminer le thème à afficher ou utiliser "Non classé" comme fallback
  const displayTheme = course.theme && course.theme.trim() !== '' 
    ? course.theme 
    : "Non classé";
  
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow flex flex-col relative">
      {/* Toujours afficher un badge de thème */}
      <Badge 
        className={`absolute top-2 right-2 z-10 ${
          displayTheme !== "Non classé" 
            ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
            : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        }`}
      >
        {displayTheme}
      </Badge>
      
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg line-clamp-2 pr-20">{course.course}</h3>
        <p className="text-sm text-muted-foreground">Par {course.partner}</p>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        {course.skills && course.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {course.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {course.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.skills.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex items-center">
          <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
          <span className="text-sm font-medium">{course.rating}</span>
          <span className="text-xs text-muted-foreground ml-1">
            ({course.reviewcount})
          </span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {course.level}
        </Badge>
      </CardFooter>
    </Card>
  )
}