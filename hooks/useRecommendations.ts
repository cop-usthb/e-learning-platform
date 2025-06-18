'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: number;
  title: string;
  description?: string;
  price?: number;
  rating?: number;
  similarity?: number;
  recommendationRank?: number;
  [key: string]: any;
}

interface UseRecommendationsOptions {
  method?: 'collaborative' | 'popular';
  num?: number;
  autoFetch?: boolean;
}

interface RecommendationsResponse {
  success: boolean;
  recommendations: Course[];
  count: number;
  method: string;
  executionInfo?: {
    pythonRecommendationsCount: number;
    foundCoursesCount: number;
    finalRecommendationsCount: number;
  };
}

export function useRecommendations(options: UseRecommendationsOptions = {}) {
  const { method = 'collaborative', num = 10, autoFetch = true } = options;
  
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionInfo, setExecutionInfo] = useState<any>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Récupération des recommandations: ${method}, ${num} cours`);

      const response = await fetch(`/api/recommendations?method=${method}&num=${num}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des recommandations');
      }

      const data: RecommendationsResponse = await response.json();
      
      setRecommendations(data.recommendations || []);
      setExecutionInfo(data.executionInfo);
      
      console.log(`Recommandations chargées: ${data.count} cours`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Erreur lors du chargement des recommandations:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchRecommendations();
    }
  }, [method, num, autoFetch]);

  return {
    recommendations,
    loading,
    error,
    executionInfo,
    refetch: fetchRecommendations
  };
}