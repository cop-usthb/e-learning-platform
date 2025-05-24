"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { rateCourse } from "@/actions/courses"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface CourseRatingProps {
  courseId: string
  initialRating: number | null
}

export function CourseRating({ courseId, initialRating }: CourseRatingProps) {
  const [rating, setRating] = useState<number | null>(initialRating)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRatingSubmit = async () => {
    if (rating === null) return

    setIsLoading(true)

    try {
      const result = await rateCourse(courseId, rating)

      if (result.success) {
        toast({
          title: "Note enregistrée",
          description: "Merci pour votre évaluation !",
        })
        router.refresh() // Rafraîchir la page pour mettre à jour les données
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur est survenue",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre note",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 border rounded-lg p-6">
      <h2 className="text-xl font-semibold">Évaluez ce cours</h2>
      <p className="text-muted-foreground">Votre avis nous aide à améliorer nos cours</p>

      <div className="flex justify-center py-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            className="p-1"
          >
            <Star
              size={32}
              className={`${
                (hoverRating !== null ? star <= hoverRating : star <= (rating || 0))
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              } transition-colors`}
            />
          </button>
        ))}
      </div>

      <Button onClick={handleRatingSubmit} disabled={isLoading || rating === null} className="w-full">
        {isLoading ? "Enregistrement..." : rating === initialRating ? "Confirmer la note" : "Enregistrer la note"}
      </Button>
    </div>
  )
}
