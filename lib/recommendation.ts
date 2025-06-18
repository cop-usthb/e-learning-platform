// Système de recommandation simple basé sur les intérêts de l'utilisateur
// Dans une application réelle, cela pourrait être un service Python plus sophistiqué

import { connectToDatabase } from "@/lib/mongodb"
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface TopRecommendation {
  course_id: number
  course_name: string
  similarity: number
}

interface PythonResult {
  user_id: string
  method: string
  count: number
  top_recommendations: TopRecommendation[]
  timestamp: string
  error?: string
}

// Type pour les cours enrichis avec les recommandations
export interface RecommendedCourse {
  id: number
  _id: string
  title?: string
  course?: string
  description?: string
  price?: number
  partner?: string
  skills?: string[]
  level?: string
  theme?: string
  rating?: number
  enrollmentCount?: number
  similarity: number
  similarity_percentage: number
  recommendationRank: number
  course_name_from_python?: string
  [key: string]: any // Pour les propriétés additionnelles venant de MongoDB
}

export async function getRecommendationsForUser(userId: string, interests: string[] = []): Promise<RecommendedCourse[]> {
  try {
    console.log(`Génération de recommandations pour l'utilisateur: ${userId}`)
    
    // 1. Exécuter le script Python pour obtenir top_recommendations
    const pythonResult = await executePythonRecommendations(userId)
    
    if (!pythonResult) {
      console.log("X Script Python n'a pas retourné de résultat")
      return []
    }

    if (pythonResult.error) {
      console.log("X Erreur Python:", pythonResult.error)
      return []
    }

    if (!pythonResult.top_recommendations || !Array.isArray(pythonResult.top_recommendations)) {
      console.log("X Format de recommandations invalide:", pythonResult)
      return []
    }

    if (pythonResult.top_recommendations.length === 0) {
      console.log("! Aucune recommandation retournée par Python")
      return []
    }

    console.log(`V Python a retourné ${pythonResult.top_recommendations.length} recommandations valides`)

    const { top_recommendations } = pythonResult
    
    // 2. Extraire les IDs des cours depuis top_recommendations
    const courseIds = top_recommendations.map(rec => rec.course_id)
    console.log(`IDs de cours recommandés par Python: ${courseIds}`)
    console.log(`Taux de similarité:`, top_recommendations.map(rec => `${rec.course_id}: ${Math.round(rec.similarity * 100)}%`))

    // 3. Récupérer les détails complets des cours depuis MongoDB
    const { db } = await connectToDatabase()
    const courses = await db
      .collection("Course")
      .find({ id: { $in: courseIds } })
      .toArray()

    // 4. Enrichir les cours avec les scores de similarité dans l'ordre des top_recommendations
    const enrichedCourses: RecommendedCourse[] = top_recommendations.map((topRec, index) => {
      const course = courses.find(c => c.id === topRec.course_id)
      
      if (course) {
        // Nettoyer le cours (supprimer _id MongoDB)
        const { _id, ...cleanCourse } = course
        
        return {
          ...cleanCourse,
          id: course.id || topRec.course_id,
          _id: _id.toString(),
          title: course.title || course.name || course.courseName || topRec.course_name,
          course: course.course || course.title || course.name || topRec.course_name,
          description: course.description || `Cours recommandé avec ${Math.round(topRec.similarity * 100)}% de compatibilité`,
          price: course.price || 0,
          partner: course.partner || 'Partenaire inconnu',
          skills: course.skills || [],
          level: course.level || course.difficulty || 'Non spécifié',
          theme: course.theme || 'Général',
          rating: course.rating || 0,
          enrollmentCount: course.enrollmentCount || 0,
          similarity: topRec.similarity,
          similarity_percentage: Math.round(topRec.similarity * 100),
          recommendationRank: index + 1,
          course_name_from_python: topRec.course_name
        }
      } else {
        // Si le cours n'existe pas dans MongoDB, créer un objet basique mais complet
        console.warn(`Cours ${topRec.course_id} non trouvé dans MongoDB`)
        return {
          id: topRec.course_id,
          _id: topRec.course_id.toString(),
          title: topRec.course_name,
          course: topRec.course_name,
          description: `Cours recommandé avec ${Math.round(topRec.similarity * 100)}% de compatibilité`,
          price: 0,
          partner: 'Partenaire inconnu',
          skills: [],
          level: 'Non spécifié',
          theme: 'Général',
          rating: 0,
          enrollmentCount: 0,
          similarity: topRec.similarity,
          similarity_percentage: Math.round(topRec.similarity * 100),
          recommendationRank: index + 1,
          course_name_from_python: topRec.course_name
        }
      }
    })

    console.log(`Recommandations finales: ${enrichedCourses.length} cours`)
    console.log('Ordre et pourcentages:', enrichedCourses.map(c => `#${c.recommendationRank}: ${c.similarity_percentage}%`))
    
    return enrichedCourses
    
  } catch (error) {
    console.error("Erreur lors de la génération des recommandations:", error)
    
    // Plus de fallback - retourner un tableau vide
    return []
  }
}

async function executePythonRecommendations(userId: string): Promise<PythonResult | null> {
  try {
    console.log(`Exécution du script Python pour l'utilisateur: ${userId}`)
    
    const startTime = Date.now()
    
    const command = `python recommendations.py --user-id "${userId}" --method contenu --num 12 --format json`
    
    console.log(`Commande exécutée: ${command}`)
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // ✅ AUGMENTÉ À 60 SECONDES
      maxBuffer: 2 * 1024 * 1024, // ✅ AUGMENTÉ À 2MB
      cwd: process.cwd(),
      encoding: 'utf8'
    })
    
    const executionTime = Date.now() - startTime
    console.log(`Script Python exécuté en ${executionTime}ms`)
    
    if (stderr) {
      console.log('Messages Python (stderr):', stderr.substring(0, 500) + '...')
    }
    
    if (!stdout || !stdout.trim()) {
      console.error('X Stdout vide - Script probablement interrompu')
      console.error('Stderr complet:', stderr)
      throw new Error('Script Python interrompu - aucune sortie JSON')
    }
    
    // Extraire seulement le JSON de la sortie (dernière ligne)
    const lines = stdout.trim().split('\n')
    const jsonLine = lines[lines.length - 1]
    
    // Parser la sortie JSON
    let result: PythonResult
    try {
      result = JSON.parse(jsonLine)
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError)
      console.error('Dernière ligne reçue:', jsonLine)
      console.error('Sortie complète:', stdout)
      throw new Error('Format de sortie Python invalide')
    }
    
    if (result.error) {
      throw new Error(`Erreur Python: ${result.error}`)
    }
    
    console.log(`Python a retourné ${result.count} top_recommendations`)
    console.log('Top recommendations:', result.top_recommendations?.slice(0, 3).map(r => 
      `ID: ${r.course_id}, Nom: ${r.course_name}, Similarité: ${Math.round(r.similarity * 100)}%`
    ))
    
    return result
    
  } catch (error) {
    console.error('X Erreur lors de l\'exécution du script Python:', error)

    // Plus de détails sur l'erreur
    if (error instanceof Error) {
      console.error('Type d\'erreur:', error.name)
      console.error('Message:', error.message)
      if ('code' in error) {
        console.error('Code d\'erreur:', (error as any).code)
      }
      if ('signal' in error) {
        console.error('Signal:', (error as any).signal)
      }
    }
    
    return null
  }
}

// Fonction utilitaire pour tester la disponibilité de Python
export async function testPythonAvailability(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('python --version', { timeout: 5000 })
    console.log('Python disponible:', stdout.trim())
    return true
  } catch (error) {
    try {
      const { stdout } = await execAsync('python3 --version', { timeout: 5000 })
      console.log('Python3 disponible:', stdout.trim())
      return true
    } catch (error2) {
      console.error('Python non disponible')
      return false
    }
  }
}

async function getFallbackRecommendations(interests: string[]): Promise<RecommendedCourse[]> {
  try {
    const { db } = await connectToDatabase()
    
    let query: any = {}
    
    // Si l'utilisateur a des intérêts, les utiliser pour le filtrage
    if (interests && interests.length > 0) {
      query.theme = { $in: interests }
    }
    
    // Récupérer des cours avec une préférence pour ceux qui correspondent aux intérêts
    const courses = await db
      .collection("Course")
      .find(query)
      .sort({ rating: -1, enrollmentCount: -1 })
      .limit(12) // Changé de 10 à 12
      .toArray()
    
    // Si pas assez de cours avec les intérêts, compléter avec des cours populaires
    if (courses.length < 12) { // Changé de 10 à 12
      const additionalCourses = await db
        .collection("Course")
        .find({ _id: { $nin: courses.map(c => c._id) } })
        .sort({ rating: -1, enrollmentCount: -1 })
        .limit(12 - courses.length) // Changé pour compléter jusqu'à 12
        .toArray()
      
      courses.push(...additionalCourses)
    }
    
    // Ajouter des scores de similarité réalistes et s'assurer que tous les champs requis sont présents
    const coursesWithRating: RecommendedCourse[] = courses.map((course, index) => {
      const { _id, ...cleanCourse } = course
      // Scores décroissants de 80% à 50% pour 12 cours (au lieu de 55% pour 10)
      const similarity = 0.80 - (index * 0.025)
      
      return {
        ...cleanCourse,
        id: course.id || index,
        _id: _id.toString(),
        title: course.title || course.name || course.courseName || `Cours ${index + 1}`,
        course: course.course || course.title || course.name || `Cours ${index + 1}`,
        description: course.description || 'Description non disponible',
        price: course.price || 0,
        partner: course.partner || 'Partenaire inconnu',
        skills: course.skills || [],
        level: course.level || course.difficulty || 'Non spécifié',
        theme: course.theme || 'Général',
        rating: course.rating || 0,
        enrollmentCount: course.enrollmentCount || 0,
        similarity: Math.max(similarity, 0.50), // Minimum 50% au lieu de 55%
        similarity_percentage: Math.round(Math.max(similarity, 0.50) * 100),
        recommendationRank: index + 1
      }
    })
    
    console.log(`Fallback: ${coursesWithRating.length} cours retournés`)
    console.log('Pourcentages fallback:', coursesWithRating.map(c => `${c.similarity_percentage}%`))
    
    return coursesWithRating
    
  } catch (error) {
    console.error("Erreur dans getFallbackRecommendations:", error)
    return []
  }
}
