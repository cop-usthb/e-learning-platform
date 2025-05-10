"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Star } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface CourseActionsProps {
  courseId: string
  userRating?: number
}

export default function CourseActions({ courseId, userRating = 0 }: CourseActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [rating, setRating] = useState(userRating)
  const [isRating, setIsRating] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const response = await fetch("/api/user/courses/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la suppression du cours")
      }

      toast({
        title: "Cours supprimé",
        description: "Le cours a été retiré de votre bibliothèque.",
      })

      router.push("/profile")
      router.refresh()
    } catch (error) {
      console.error("Delete course error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleRating = async () => {
    try {
      setIsRating(true)

      const response = await fetch("/api/user/courses/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId, rating }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la notation du cours")
      }

      toast({
        title: "Cours noté",
        description: `Vous avez attribué ${rating} étoiles à ce cours.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Rate course error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsRating(false)
      setShowRatingDialog(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-4 mt-6">
      <Button variant="outline" onClick={() => setShowRatingDialog(true)}>
        <Star className="h-4 w-4 mr-2" />
        {userRating > 0 ? `Modifier ma note (${userRating}/5)` : "Noter ce cours"}
      </Button>

      <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
        <Trash2 className="h-4 w-4 mr-2" />
        Supprimer de ma bibliothèque
      </Button>

      {/* Dialog de notation */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Noter ce cours</DialogTitle>
            <DialogDescription>Attribuez une note de 1 à 5 étoiles à ce cours.</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" onClick={() => setRating(value)} className="p-1">
                <Star
                  className={`h-8 w-8 ${value <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleRating} disabled={isRating}>
              {isRating ? "Enregistrement..." : "Enregistrer ma note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce cours</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce cours de votre bibliothèque ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
