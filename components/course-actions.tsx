"use client"

import { Button } from "@/components/ui/button"
import { purchaseCourse } from "@/actions/courses"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CourseActionsProps {
  courseId: string
  isPurchased: boolean
  onDeleteSuccess?: () => void
}

export function CourseActions({ courseId, isPurchased, onDeleteSuccess }: CourseActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handlePurchaseCourse = async () => {
    setIsLoading(true)

    try {
      const result = await purchaseCourse(courseId)

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message
        })
        router.refresh()
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error purchasing course:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription au cours",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCourse = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch("/api/courses/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Succès",
          description: "Le cours a été supprimé de votre bibliothèque"
        })
        
        if (onDeleteSuccess) {
          onDeleteSuccess()
        } else {
          router.push("/profile")
        }
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de supprimer ce cours",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du cours",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
    }
  }

  if (!isPurchased) {
    return (
      <Button 
        className="w-full mt-4" 
        onClick={handlePurchaseCourse}
        disabled={isLoading}
      >
        {isLoading ? "Inscription en cours..." : "S'inscrire au cours"}
      </Button>
    )
  }

  return (
    <>
      <Button 
        className="w-full mt-4" 
        variant="destructive"
        onClick={() => setIsConfirmOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Retirer de ma bibliothèque
      </Button>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce cours ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le cours sera définitivement supprimé de votre bibliothèque et votre progression sera perdue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCourse}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression en cours..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}