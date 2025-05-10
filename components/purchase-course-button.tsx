"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface PurchaseCourseButtonProps {
  courseId: string
}

export default function PurchaseCourseButton({ courseId }: PurchaseCourseButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const handlePurchase = async () => {
    if (!session) {
      router.push(`/login?redirect=/courses/${courseId}`)
      return
    }

    setShowDialog(true)
  }

  const confirmPurchase = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/user/courses/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de l'achat du cours")
      }

      toast({
        title: "Achat réussi",
        description: "Vous avez maintenant accès à ce cours.",
      })

      router.refresh()
      router.push("/profile")
    } catch (error) {
      console.error("Purchase error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowDialog(false)
    }
  }

  return (
    <>
      <Button onClick={handlePurchase} className="w-full md:w-auto" size="lg">
        Acheter ce cours
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'achat</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir acheter ce cours ? Dans une vraie application, un processus de paiement serait
              intégré ici.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={confirmPurchase} disabled={isLoading}>
              {isLoading ? "Traitement en cours..." : "Confirmer l'achat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
