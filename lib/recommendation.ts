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

// Nouveau type pour les recommandations du script hybrid
interface HybridRecommendation {
  id: string
  title: string
  score: number
  method: string
}

interface HybridPythonResult {
  recommendations?: HybridRecommendation[]
  error?: string
}

export async function getRecommendationsForUser(userId: string, interests: string[] = []): Promise<RecommendedCourse[]> {
  try {
    console.log(`Génération de recommandations pour l'utilisateur: ${userId}`)
    
    // 1. Exécuter le script Python hybride pour obtenir des recommandations
    const pythonResult = await executeHybridPythonRecommendations(userId)
    
    if (!pythonResult) {
      console.log("X Script Python hybride n'a pas retourné de résultat")
      return []
    }

    if (pythonResult.error) {
      console.log("X Erreur Python hybride:", pythonResult.error)
      return []
    }

    if (!pythonResult.recommendations || !Array.isArray(pythonResult.recommendations)) {
      console.log("X Format de recommandations hybrides invalide:", pythonResult)
      return []
    }

    if (pythonResult.recommendations.length === 0) {
      console.log("! Aucune recommandation retournée par le script hybride")
      return []
    }

    console.log(`V Script hybride a retourné ${pythonResult.recommendations.length} recommandations valides`)

    const { recommendations } = pythonResult
    
    // 2. Extraire les IDs des cours depuis les recommandations hybrides
    const courseIds = recommendations.map(rec => parseInt(rec.id)).filter(id => !isNaN(id))
    console.log(`IDs de cours recommandés par le script hybride: ${courseIds}`)
    console.log(`Scores:`, recommendations.map(rec => `${rec.id}: ${Math.round(rec.score * 100)}%`))

    // 3. Récupérer les détails complets des cours depuis MongoDB
    const { db } = await connectToDatabase()
    const courses = await db
      .collection("Course")
      .find({ id: { $in: courseIds } })
      .toArray()

    // 4. Enrichir les cours avec les scores dans l'ordre des recommandations
    const enrichedCourses: RecommendedCourse[] = recommendations.map((hybridRec, index) => {
      const courseId = parseInt(hybridRec.id)
      const course = courses.find(c => c.id === courseId)
      
      if (course) {
        // Nettoyer le cours (supprimer _id MongoDB)
        const { _id, ...cleanCourse } = course
        
        return {
          ...cleanCourse,
          id: course.id || courseId,
          _id: _id.toString(),
          title: course.title || course.name || course.courseName || hybridRec.title,
          course: course.course || course.title || course.name || hybridRec.title,
          description: course.description || `Cours recommandé avec ${Math.round(hybridRec.score * 100)}% de compatibilité`,
          price: course.price || 0,
          partner: course.partner || 'Partenaire inconnu',
          skills: course.skills || [],
          level: course.level || course.difficulty || 'Non spécifié',
          theme: course.theme || 'Général',
          rating: course.rating || 0,
          enrollmentCount: course.enrollmentCount || 0,
          similarity: hybridRec.score,
          similarity_percentage: Math.round(hybridRec.score * 100),
          recommendationRank: index + 1,
          course_name_from_python: hybridRec.title,
          method: hybridRec.method // Ajouter la méthode utilisée
        }
      } else {
        // Si le cours n'existe pas dans MongoDB, créer un objet basique mais complet
        console.warn(`Cours ${courseId} non trouvé dans MongoDB`)
        return {
          id: courseId,
          _id: courseId.toString(),
          title: hybridRec.title,
          course: hybridRec.title,
          description: `Cours recommandé avec ${Math.round(hybridRec.score * 100)}% de compatibilité`,
          price: 0,
          partner: 'Partenaire inconnu',
          skills: [],
          level: 'Non spécifié',
          theme: 'Général',
          rating: 0,
          enrollmentCount: 0,
          similarity: hybridRec.score,
          similarity_percentage: Math.round(hybridRec.score * 100),
          recommendationRank: index + 1,
          course_name_from_python: hybridRec.title,
          method: hybridRec.method
        }
      }
    })

    console.log(`Recommandations finales: ${enrichedCourses.length} cours`)
    console.log('Ordre et pourcentages:', enrichedCourses.map(c => `#${c.recommendationRank}: ${c.similarity_percentage}% (${c.method})`))
    
    return enrichedCourses
    
  } catch (error) {
    console.error("Erreur lors de la génération des recommandations:", error)
    return []
  }
}

async function executeHybridPythonRecommendations(userId: string): Promise<HybridPythonResult | null> {
  try {
    console.log(`Exécution du script Python hybride pour l'utilisateur: ${userId}`)
    
    const startTime = Date.now()
    
    // Nouvelle commande pour le script hybride
    const command = `python recommendation_script.py "${userId}" course --k 12 --lambda_param 0.7 --verbose`
    
    console.log(`Commande exécutée: ${command}`)
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000, // 2 minutes pour le script plus complexe
      maxBuffer: 4 * 1024 * 1024, // 4MB pour plus de données
      cwd: process.cwd(),
      encoding: 'utf8'
    })
    
    const executionTime = Date.now() - startTime
    console.log(`Script Python hybride exécuté en ${executionTime}ms`)
    
    if (stderr) {
      console.log('Messages Python hybride (stderr):', stderr.substring(0, 500) + '...')
    }
    
    if (!stdout || !stdout.trim()) {
      console.error('X Stdout vide - Script hybride probablement interrompu')
      console.error('Stderr complet:', stderr)
      throw new Error('Script Python hybride interrompu - aucune sortie JSON')
    }
    
    // Extraire le JSON de la sortie (le JSON est à la fin après les logs)
    let jsonOutput: string
    try {
      // Chercher le dernier bloc JSON valide dans la sortie
      const lines = stdout.trim().split('\n')
      
      // Trouver la ligne qui commence par '[' (début du JSON array)
      let jsonStartIndex = -1
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim()
        if (line.startsWith('[')) {
          jsonStartIndex = i
          break
        }
      }
      
      if (jsonStartIndex === -1) {
        throw new Error('Aucun JSON array trouvé dans la sortie')
      }
      
      // Extraire toutes les lignes depuis le début du JSON jusqu'à la fin
      jsonOutput = lines.slice(jsonStartIndex).join('\n').trim()
      
      console.log('JSON extrait:', jsonOutput.substring(0, 200) + '...')
      
    } catch (extractError) {
      console.error('Erreur lors de l\'extraction du JSON:', extractError)
      console.error('Sortie complète:', stdout)
      throw new Error('Impossible d\'extraire le JSON de la sortie')
    }
    
    // Parser le JSON extrait
    let recommendations: HybridRecommendation[]
    try {
      recommendations = JSON.parse(jsonOutput)
      
      // Vérifier que c'est bien un array
      if (!Array.isArray(recommendations)) {
        throw new Error('Le JSON parsé n\'est pas un array')
      }
      
    } catch (parseError) {
      console.error('Erreur de parsing JSON hybride:', parseError)
      console.error('JSON à parser:', jsonOutput)
      throw new Error('Format JSON invalide')
    }
    
    // Construire le résultat final
    const result: HybridPythonResult = {
      recommendations: recommendations
    }
    
    console.log(`Script hybride a retourné ${result.recommendations?.length || 0} recommandations`)
    console.log('Top recommendations:', result.recommendations?.slice(0, 3).map(r => 
      `ID: ${r.id}, Titre: ${r.title}, Score: ${Math.round(r.score * 100)}%, Méthode: ${r.method}`
    ))
    
    return result
    
  } catch (error) {
    console.error('X Erreur lors de l\'exécution du script Python hybride:', error)

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
