"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart } from "lucide-react"

interface PurchaseCourseButtonProps {
  courseId: string
  price: number
}

export default function PurchaseCourseButton({ courseId, price }: PurchaseCourseButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async () => {
    if (!session?.user) {
      // S'assurer que la redirection utilise "courseId" comme nom de paramètre
      router.push(`/login?returnUrl=/courses/${courseId}`)
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          price,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de l'achat")
      }

      // Achat réussi
      toast({
        title: "Achat réussi",
        description: "Félicitations ! Vous avez accès à ce cours.",
      })
      
      // S'assurer que la redirection utilise "courseId" comme nom de paramètre
      router.push(`/my-courses/${courseId}`)
      
    } catch (error) {
      console.error("Purchase error:", error)
      toast({
        title: "Erreur d'achat",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de l'achat",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button
      variant="default"
      className="w-full"
      onClick={handlePurchase}
      disabled={isProcessing}
    >
      {isProcessing ? (
        "Traitement en cours..."
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Acheter pour {price}€
        </>
      )}
    </Button>
  )
}
