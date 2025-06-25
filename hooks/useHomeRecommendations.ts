'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import type { RecommendedCourse } from '@/lib/recommendation'

export function useHomeRecommendations(num = 8) {
  const { data: session, status } = useSession()
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    // Ne pas faire d'appel API si l'utilisateur n'est pas connecté
    if (status === 'unauthenticated') {
      setRecommendations([])
      setLoading(false)
      setError(null)
      return
    }

    // Attendre que le statut soit déterminé
    if (status === 'loading') {
      return
    }

    // Vérifier qu'on a bien une session
    if (!session?.user) {
      setRecommendations([])
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching recommendations for authenticated user:', session.user.id)
      
      const response = await fetch(`/api/recommendations?num=${num}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des recommandations')
      }
      
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [num, status, session])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations
  }
}