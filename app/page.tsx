"use client"

import { Suspense } from "react"
import Hero from "@/components/hero"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { status } = useSession()
  const isAuthenticated = status === "authenticated"
  const router = useRouter()

  // Fonction pour gérer le clic sur le bouton
  const handleRecommendationsClick = () => {
    if (isAuthenticated) {
      router.push("/recommendations")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />
      
      {/* Section intermédiaire avec le bouton des recommandations */}
      <section className="my-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Découvrez des cours adaptés à vos intérêts</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {isAuthenticated 
            ? "Nous avons sélectionné des cours spécialement pour vous, basés sur vos centres d'intérêt."
            : "Connectez-vous pour voir des recommandations personnalisées basées sur vos centres d'intérêt."}
        </p>
        
        <Button 
          onClick={handleRecommendationsClick}
          size="lg"
          className="group"
        >
          <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
          {isAuthenticated ? "Voir mes recommandations" : "Se connecter pour des recommandations"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
      
      {/* Autres sections que vous souhaitez garder */}
      {/* Par exemple, vous pourriez ajouter ici une section sur les cours populaires */}
    </div>
  )
}
