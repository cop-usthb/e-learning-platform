'use client'

import { useState, useEffect } from 'react'

interface Course {
  id: number
  _id?: string
  title?: string
  course?: string
  description?: string
  partner?: string
  theme?: string
  rating?: number
  similarity?: number
  recommendationRank?: number
  [key: string]: any
}

interface RecommendationsResponse {
  success: boolean
  recommendations: Course[]
  count: number
  method: string
  user_interests: string[]
}

export function useHomeRecommendations(numCourses: number = 12) {
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userInterests, setUserInterests] = useState<string[]>([])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`Récupération de ${numCourses} recommandations pour la page d'accueil`)

      const response = await fetch(`/api/recommendations?num=${numCourses}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement des recommandations')
      }

      const data: RecommendationsResponse = await response.json()
      
      // Traiter les recommandations pour s'assurer de la cohérence des données
      const processedRecommendations = (data.recommendations || []).map((course, index) => ({
        ...course,
        id: course.id || index,
        _id: course._id || course.id?.toString(),
        recommendationRank: index + 1,
        similarity: course.similarity || 0
      }))
      
      setRecommendations(processedRecommendations)
      setUserInterests(data.user_interests || [])
      
      console.log(`Recommandations chargées: ${data.count} cours`)
      console.log(`Méthode utilisée: ${data.method}`)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(errorMessage)
      console.error('Erreur lors du chargement des recommandations:', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [numCourses])

  return {
    recommendations,
    loading,
    error,
    userInterests,
    refetch: fetchRecommendations
  }
}