import { Metadata } from "next"
import ScoredRecommendationsList from "@/components/scored-recommendations-list"

export const metadata: Metadata = {
  title: "Cours recommandés",
  description: "Découvrez des cours personnalisés en fonction de vos centres d'intérêt",
}

export default function RecommendationsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Cours recommandés pour vous</h1>
      <p className="text-muted-foreground mb-8">
        Ces cours sont sélectionnés selon vos centres d'intérêt et votre historique d'apprentissage.
      </p>
      
      <ScoredRecommendationsList />
    </div>
  )
}