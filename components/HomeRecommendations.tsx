'use client'

import { useHomeRecommendations } from '@/hooks/useHomeRecommendations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, AlertCircle, TrendingUp, LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function HomeRecommendations() {
  const { data: session, status } = useSession()
  
  // Seuls les utilisateurs connectés doivent appeler le hook
  const shouldFetchRecommendations = status === 'authenticated' && session?.user
  const { recommendations, loading, error, refetch } = useHomeRecommendations(
    shouldFetchRecommendations ? 12 : 0
  )

  // Si l'utilisateur n'est pas connecté, afficher le message de connexion
  if (status === 'unauthenticated') {
    return (
      <section className="py-12 bg-white dark:bg-[#020817]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Recommandé pour vous
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez des cours personnalisés basés sur votre profil et vos préférences d'apprentissage
            </p>
          </div>
          
          <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Connectez-vous pour des recommandations personnalisées
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Créez votre compte ou connectez-vous pour découvrir des cours adaptés à vos intérêts et objectifs d'apprentissage.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/signin">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                    <LogIn className="h-4 w-4 mr-2" />
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30 px-6">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Créer un compte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Section alternative pour les visiteurs non connectés */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-8">
              En attendant, explorez nos cours populaires
            </h3>
            <div className="text-center">
              <Link href="/courses">
                <Button variant="outline" className="px-8 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Parcourir tous les cours
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Si la session est en cours de chargement
  if (status === 'loading') {
    return (
      <section className="py-12 bg-white dark:bg-[#020817]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Recommandé pour vous
          </h2>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-3 text-blue-600" />
            <span className="text-gray-700 dark:text-gray-300">
              Vérification de votre session...
            </span>
          </div>
        </div>
      </section>
    )
  }

  // Si les recommandations sont en cours de chargement
  if (loading) {
    return (
      <section className="py-12 bg-white dark:bg-[#020817]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recommandé pour vous
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                disabled={true}
              >
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Chargement...
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez des cours personnalisés basés sur votre profil et vos préférences d'apprentissage
            </p>
          </div>
          
          <div className="flex justify-center items-center py-8 mb-8">
            <Loader2 className="h-8 w-8 animate-spin mr-3 text-blue-600" />
            <span className="text-gray-700 dark:text-gray-300">
              Génération de vos recommandations personnalisées...
            </span>
          </div>
          
          {/* Skeleton Cards - 12 cours */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={index} className="h-full animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-5/6"></div>
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
          <div className="text-center mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recommandé pour vous
              </h2>
              <Button 
                onClick={refetch} 
                variant="outline" 
                size="sm"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Découvrez des cours personnalisés basés sur votre profil et vos préférences d'apprentissage
            </p>
          </div>
          
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Recommandé pour vous
            </h2>
            <Button 
              onClick={refetch} 
              variant="outline" 
              size="sm"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Actualiser
            </Button>
          </div>
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
                        
                        {/* Affichage du pourcentage de compatibilité */}
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