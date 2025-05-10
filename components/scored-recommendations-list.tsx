"use client"

import { useState, useEffect } from "react"
import ScoredRecommendationCard from "@/components/scored-recommendation-card"
import ProtectedContent from "@/components/protected-content"

interface Course {
  _id: string;
  course: string;
  recommendationScore: number;
  // Autres propriétés du cours...
}

export default function ScoredRecommendationsList() {
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch("/api/recommendations")
        const data = await response.json()
        
        // Vérifier si la réponse contient une erreur
        if (data.error) {
          setError(data.error)
          setRecommendedCourses([])
          return
        }
        
        // Vérifier que data est bien un tableau
        if (Array.isArray(data)) {
          setRecommendedCourses(data)
        } else {
          console.error("API response is not an array:", data)
          setRecommendedCourses([])
          setError("Format de données incorrect")
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error)
        setError("Erreur lors du chargement des recommandations")
        setRecommendedCourses([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  return (
    <ProtectedContent>
      {isLoading ? (
        <div className="animate-pulse text-center py-8">Chargement des recommandations...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      ) : recommendedCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedCourses.map((course) => (
            <ScoredRecommendationCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Aucun cours recommandé trouvé. Explorez notre catalogue complet pour découvrir des cours intéressants.
        </div>
      )}
    </ProtectedContent>
  )
}