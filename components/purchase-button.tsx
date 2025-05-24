"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { purchaseCourse } from "@/actions/courses"
import { useRouter } from "next/navigation"

interface PurchaseButtonProps {
  courseId: string
}

export function PurchaseButton({ courseId }: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handlePurchase = async () => {
    setIsLoading(true)

    try {
      const result = await purchaseCourse(courseId)

      if (result.success) {
        toast({
          title: "Inscription réussie",
          description: "Vous avez maintenant accès à ce cours",
        })
        router.refresh()
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur est survenue lors de l'inscription",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8 flex justify-center">
      <Button size="lg" onClick={handlePurchase} disabled={isLoading} className="w-full md:w-auto md:px-12">
        {isLoading ? "Traitement en cours..." : "S'inscrire gratuitement"}
      </Button>
    </div>
  )
}
