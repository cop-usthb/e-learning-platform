'use client'

import { useHomeRecommendations } from '@/hooks/useHomeRecommendations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function HomeRecommendations() {
  // Changement de 8 à 12 cours
  const { recommendations, loading, error, refetch } = useHomeRecommendations(12)

  if (loading) {
    return (
      <section className="py-12 bg-white dark:bg-[#020817]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Recommandé pour vous
          </h2>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3 text-blue-600" />
            <span className="text-gray-700 dark:text-gray-300">
              Génération de vos recommandations personnalisées...
            </span>
          </div>
          {/* Skeleton Cards - Augmenté à 12 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <Card key={index} className="h-full animate-pulse bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 bg-white dark:bg-[#020817]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Recommandé pour vous
          </h2>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-white dark:bg-[#020817]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Recommandé pour vous
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez des cours personnalisés basés sur votre profil et vos préférences d'apprentissage
          </p>
        </div>
        
        {recommendations && recommendations.length > 0 ? (
          <>
            {/* Grid optimisé pour 12 cours */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {recommendations.map((course, index) => (
                <div key={course.id || index}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {/* Badge Top Match seulement pour les cours avec haute similarité */}
                          {course.similarity && course.similarity > 0.7 && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200 dark:border-green-800 dark:text-green-400">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Top Match
                            </Badge>
                          )}
                        </div>
                        
                        {/* Affichage du pourcentage de compatibilité sans icône */}
                        {course.similarity && (
                          <div className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {Math.round(course.similarity * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem] text-gray-900 dark:text-white">
                        {course.title || course.course || 'Cours sans titre'}
                      </CardTitle>
                      
                      {course.partner && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Par {course.partner}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {course.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                          {course.description}
                        </p>
                      )}
                      
                      <div className="space-y-3">
                        {course.theme && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {course.theme}
                          </Badge>
                        )}
                        
                        <Link href={course._id ? `/courses/${course._id}` : '#'}
                          onClick={(e) => {
                            if (!course._id) {
                              e.preventDefault()
                              // Optionnel: Afficher un message ou une notification
                            }
                          }}
                        >
                          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                            Voir le cours
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <Link href="/courses">
                <Button variant="outline" className="px-8 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Voir tous les cours
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aucune recommandation disponible pour le moment.
            </p>
            <Button onClick={refetch} className="mr-4 bg-blue-600 hover:bg-blue-700 text-white">
              Générer des recommandations
            </Button>
            <Link href="/courses">
              <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Parcourir tous les cours
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}