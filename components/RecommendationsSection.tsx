'use client';

import { useSession } from 'next-auth/react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export default function RecommendationsSection() {
  const { status } = useSession();
  const { recommendations, loading, error, executionInfo, refetch } = useRecommendations({
    method: 'collaborative',
    num: 8
  });

  // Ne pas afficher si l'utilisateur n'est pas connecté
  if (status === 'unauthenticated') {
    return null;
  }

  // Ne pas afficher pendant le chargement de la session
  if (status === 'loading') {
    return null;
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Recommandé pour vous</h2>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Génération des recommandations personnalisées...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Recommandé pour vous</h2>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Recommandé pour vous</h2>
            {executionInfo && (
              <p className="text-sm text-gray-600 mt-1">
                {executionInfo.finalRecommendationsCount} cours sélectionnés par notre algorithme
              </p>
            )}
          </div>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
        
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((course, index) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                    {course.recommendationRank && (
                      <Badge variant="secondary" className="ml-2">
                        #{course.recommendationRank}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {course.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      {course.price && (
                        <span className="font-bold text-lg">
                          {course.price}€
                        </span>
                      )}
                      {course.rating && (
                        <span className="text-sm text-gray-500">
                          ⭐ {course.rating}/5
                        </span>
                      )}
                    </div>
                    
                    {course.similarity && (
                      <Badge variant="outline" className="text-xs">
                        {(course.similarity * 100).toFixed(1)}% match
                      </Badge>
                    )}
                  </div>
                  
                  <Button className="w-full mt-4" size="sm">
                    Voir le cours
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Aucune recommandation disponible pour le moment.</p>
            <Button onClick={refetch} className="mt-4">
              Générer des recommandations
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}