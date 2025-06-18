<<<<<<< HEAD
=======
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import HomeRecommendations from "@/components/HomeRecommendations"
>>>>>>> b4f9f29 (Adding content based local system)
import { HeroSection } from "@/components/hero-section"
import { RecommendedCourses } from "@/components/recommended-courses"
import { getRecommendedCourses } from "@/lib/courses"

<<<<<<< HEAD
export default async function Home() {
  const recommendedCourses = await getRecommendedCourses()

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <RecommendedCourses courses={recommendedCourses} />
=======
export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  // Pour les utilisateurs non connectés, utiliser les cours recommandés génériques
  const fallbackCourses = await getRecommendedCourses()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Apprenez sans limites
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Découvrez des milliers de cours en ligne pour développer vos compétences
            et accélérer votre carrière
          </p>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
              Commencer maintenant
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition duration-300">
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      {/* Recommandations Section */}
      {session?.user ? (
        // Recommandations personnalisées pour les utilisateurs connectés
        <HomeRecommendations />
      ) : (
        // Cours recommandés génériques pour les visiteurs
        <RecommendedCourses courses={fallbackCourses} />
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pourquoi choisir notre plateforme ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une expérience d'apprentissage complète avec des fonctionnalités avancées
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Recommandations IA</h3>
              <p className="text-gray-600">
                Notre algorithme d'apprentissage automatique vous suggère les meilleurs cours selon votre profil
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Contenu de qualité</h3>
              <p className="text-gray-600">
                Accédez à des milliers de cours créés par des experts de l'industrie
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Suivi des progrès</h3>
              <p className="text-gray-600">
                Suivez votre progression et obtenez des certificats à la fin de vos cours
              </p>
            </div>
          </div>
        </div>
      </section>
>>>>>>> b4f9f29 (Adding content based local system)
    </div>
  )
}
