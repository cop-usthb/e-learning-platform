// Système de recommandation simple basé sur les intérêts de l'utilisateur
// Dans une application réelle, cela pourrait être un service Python plus sophistiqué

import { connectToDatabase } from "@/lib/mongodb"
import { spawn, exec } from 'child_process'
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
  title: string // Obligatoire au lieu d'optionnel
  course: string // Obligatoire au lieu d'optionnel
  description: string // Obligatoire au lieu d'optionnel
  price: number
  partner: string
  skills: string[]
  level: string
  theme: string
  rating: number
  enrollmentCount: number
  similarity: number
  similarity_percentage: number
  score_percentage: number // Attribut normalisé Z-Score du script Python
  method: string
  recommendationRank: number
  course_name_from_python?: string
  [key: string]: any
}

// Nouveau type pour les recommandations du script hybrid
interface HybridRecommendation {
  id: string
  title: string
  score: number
  score_percentage: number // Attribut normalisé Z-Score
  method: string
}

interface HybridPythonResult {
  success: boolean
  recommendations: HybridRecommendation[]
  error?: string
}

export async function getRecommendationsForUser(userId: string, interests: string[] = []): Promise<{
  recommendations: RecommendedCourse[]
  executionInfo: any
}> {
  let recommendations: RecommendedCourse[] = []
  let executionInfo = {
    pythonExecuted: false,
    pythonSuccess: false,
    fallbackUsed: false,
    finalRecommendationsCount: 0,
    error: null as string | null
  }

  try {
    console.log(`Génération de recommandations pour l'utilisateur: ${userId}`)
    console.log(`Intérêts formatés:`, interests)
    
    // Exécuter le script Python hybride
    const pythonResult = await executeHybridPythonRecommendations(userId)
    executionInfo.pythonExecuted = true

    if (pythonResult.success && pythonResult.recommendations && pythonResult.recommendations.length > 0) {
      executionInfo.pythonSuccess = true
      
      // Extraire les IDs des cours depuis les recommandations Python
      const courseIds = pythonResult.recommendations
        .map((rec: any) => parseInt(rec.id))
        .filter((id: number) => !isNaN(id))

      if (courseIds.length > 0) {
        // Récupérer les détails des cours depuis MongoDB
        const { db } = await connectToDatabase()
        const courses = await db.collection("Course").find({
          id: { $in: courseIds }
        }).toArray()

        // Créer un mapping des cours par ID
        const courseMap = new Map(courses.map(course => [course.id, course]))

        // Enrichir les recommandations avec les détails des cours
        const enrichedCourses: RecommendedCourse[] = []
        
        for (let index = 0; index < pythonResult.recommendations.length; index++) {
          const hybridRec = pythonResult.recommendations[index]
          const courseId = parseInt(hybridRec.id)
          const course = courseMap.get(courseId)
          
          if (course) {
            const { _id, ...cleanCourse } = course
            
            // Créer l'objet avec tous les champs requis
            const enrichedCourse: RecommendedCourse = {
              // Copier les champs du cours existant
              ...cleanCourse,
              // Champs obligatoires avec valeurs par défaut garanties
              id: course.id || courseId,
              _id: _id.toString(),
              title: course.course || course.title || course.name || hybridRec.title || `Cours ${courseId}`,
              course: course.course || course.title || course.name || hybridRec.title || `Cours ${courseId}`,
              description: course.description || course.what_you_will_learn || `Cours recommandé`,
              price: course.price || 0,
              partner: course.partner || course.university || 'Partenaire inconnu',
              skills: course.skills || [],
              level: course.level || course.difficulty || 'Non spécifié',
              theme: course.theme || course.subject || 'Général',
              rating: course.rating || 0,
              enrollmentCount: course.enrollmentCount || 0,
              // CORRECTION : Utiliser score_percentage pour TOUS les attributs de score
              similarity: hybridRec.score_percentage / 100 || 0, // ✅ Convertir en décimal pour similarity
              similarity_percentage: hybridRec.score_percentage || 0, // ✅ Utiliser score_percentage
              score_percentage: hybridRec.score_percentage || 0,      // ✅ Utiliser score_percentage
              method: hybridRec.method || "hybrid",
              recommendationRank: index + 1,
              course_name_from_python: hybridRec.title
            }
            
            enrichedCourses.push(enrichedCourse)
          }
        }

        recommendations = enrichedCourses
        executionInfo.finalRecommendationsCount = recommendations.length

        console.log(`✅ Script hybride a retourné ${recommendations.length} recommandations valides`)
        console.log('📊 Détails des scores:', recommendations.map(r => 
          `ID: ${r.id}, score_percentage: ${r.score_percentage}%, similarity_percentage: ${r.similarity_percentage}%, method: ${r.method}, title: ${r.title?.substring(0, 30)}...`
        ))

        if (recommendations.length > 0) {
          return { recommendations, executionInfo }
        }
      }
    }

    // Si le script Python a échoué, utiliser le fallback
    throw new Error("Python script returned no valid recommendations")

  } catch (error) {
    console.error("Error in hybrid recommendations:", error)
    executionInfo.error = error instanceof Error ? error.message : String(error)
    executionInfo.fallbackUsed = true

    // Utiliser les recommandations de secours
    try {
      const fallbackRecommendations = await getFallbackRecommendations(interests)
      
      recommendations = fallbackRecommendations.map((course, index) => ({
        ...course,
        // CORRECTION : Utiliser score_percentage pour TOUS les attributs
        similarity: (80 - (index * 2.5)) / 100, // ✅ Convertir en décimal pour similarity
        similarity_percentage: 80 - (index * 2.5), // ✅ Valeur en pourcentage
        score_percentage: 80 - (index * 2.5), // ✅ Valeur en pourcentage
        method: "fallback",
        recommendationRank: index + 1
      }))

      executionInfo.finalRecommendationsCount = recommendations.length
      console.log('📊 Recommandations fallback avec score_percentage:', recommendations.map(r => 
        `ID: ${r.id}, score_percentage: ${r.score_percentage}%, title: ${r.title?.substring(0, 30)}...`
      ))
    } catch (fallbackError) {
      console.error("Fallback recommendations also failed:", fallbackError)
      executionInfo.error = `Primary and fallback failed: ${executionInfo.error} | ${fallbackError}`
    }
  }

  return { recommendations, executionInfo }
}

async function executeHybridPythonRecommendations(userId: string): Promise<HybridPythonResult> {
  return new Promise((resolve) => {
    console.log('🐍 Démarrage du script Python hybride...')
    
    const pythonProcess = spawn('python', [
      'recommendation_script.py',
      userId,
      'course',
      '--k', '15',
      '--lambda_param', '0.7',
      '--verbose'
    ], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    pythonProcess.on('close', (code) => {
      console.log(`🐍 Script Python terminé avec le code: ${code}`)
      console.log(`📤 Sortie stdout (${stdout.length} caractères):`, stdout.substring(0, 500))
      console.log(`📤 Sortie stderr (${stderr.length} caractères):`, stderr.substring(0, 500))
      
      // Accepter le code 0 ou null (parfois le processus se termine correctement mais avec null)
      if ((code === 0 || code === null) && stdout.trim()) {
        try {
          // Extraire le JSON de la sortie
          const lines = stdout.trim().split('\n')
          let jsonStartIndex = -1
          
          // Chercher la ligne qui commence par '['
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim()
            if (line.startsWith('[')) {
              jsonStartIndex = i
              break
            }
          }
          
          if (jsonStartIndex === -1) {
            // Essayer de trouver un JSON valide dans la sortie
            const jsonMatch = stdout.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const recommendations = JSON.parse(jsonMatch[0])
              
              const validRecommendations = recommendations.filter((rec: any) => 
                rec.id && 
                typeof rec.score_percentage === 'number' && 
                rec.score_percentage >= 0 && 
                rec.score_percentage <= 100
              )

              console.log(`✅ Script Python retourné ${validRecommendations.length} recommandations valides avec score_percentage`)

              return resolve({
                success: true,
                recommendations: validRecommendations
              })
            }
            
            throw new Error('No JSON array found in output')
          }
          
          const jsonOutput = lines.slice(jsonStartIndex).join('\n').trim()
          const recommendations = JSON.parse(jsonOutput)
          
          // Valider que chaque recommandation a les attributs nécessaires
          const validRecommendations = recommendations.filter((rec: any) => 
            rec.id && 
            typeof rec.score_percentage === 'number' && 
            rec.score_percentage >= 0 && 
            rec.score_percentage <= 100
          )

          console.log(`✅ Script Python retourné ${validRecommendations.length} recommandations valides avec score_percentage`)

          resolve({
            success: true,
            recommendations: validRecommendations
          })
        } catch (parseError) {
          console.error("❌ Failed to parse Python output:", parseError)
          console.error("Stdout complet:", stdout)
          resolve({
            success: false,
            recommendations: [],
            error: `JSON parse error: ${parseError}`
          })
        }
      } else {
        console.error(`❌ Python script failed with code ${code}`)
        console.error("Stderr:", stderr)
        resolve({
          success: false,
          recommendations: [],
          error: `Python script exit code: ${code}, stderr: ${stderr}`
        })
      }
    })

    pythonProcess.on('error', (error) => {
      console.error("❌ Failed to start Python process:", error)
      resolve({
        success: false,
        recommendations: [],
        error: `Process error: ${error.message}`
      })
    })

    // Timeout après 30 secondes
    setTimeout(() => {
      console.log('⏰ Timeout du script Python après 30s')
      pythonProcess.kill()
      resolve({
        success: false,
        recommendations: [],
        error: "Python script timeout (30s)"
      })
    }, 30000)
  })
}

async function getFallbackRecommendations(interests: string[]): Promise<RecommendedCourse[]> {
  try {
    const { db } = await connectToDatabase()
    
    let query: any = {}
    
    // Si l'utilisateur a des intérêts, les utiliser pour le filtrage
    if (interests && interests.length > 0) {
      console.log('🔍 Recherche avec intérêts:', interests)
      
      // Convertir "Programing & Software Engineering" en mots-clés recherchables
      const searchTerms = interests.flatMap(interest => 
        interest.split(/[&,\s]+/).map(term => term.trim()).filter(term => term.length > 0)
      )
      
      console.log('🔍 Termes de recherche:', searchTerms)
      
      const interestRegex = searchTerms.map(term => new RegExp(term, 'i'))
      query = {
        $or: [
          { theme: { $in: interestRegex } },
          { subject: { $in: interestRegex } },
          { course: { $in: interestRegex } },
          { partner: { $in: interestRegex } },
          { description: { $in: interestRegex } },
          { what_you_will_learn: { $in: interestRegex } }
        ]
      }
    }
    
    // Récupérer des cours populaires
    const courses = await db
      .collection("Course")
      .find(query)
      .sort({ rating: -1, enrollmentCount: -1 })
      .limit(12)
      .toArray()
    
    // Si pas assez de cours avec les intérêts, compléter avec des cours populaires
    if (courses.length < 12) {
      const additionalCourses = await db
        .collection("Course")
        .find({ _id: { $nin: courses.map(c => c._id) } })
        .sort({ rating: -1, enrollmentCount: -1 })
        .limit(12 - courses.length)
        .toArray()
      
      courses.push(...additionalCourses)
    }
    
    // Créer les cours avec tous les champs requis
    const coursesWithRating: RecommendedCourse[] = courses.map((course, index) => {
      const { _id, ...cleanCourse } = course
      
      return {
        ...cleanCourse,
        // Champs obligatoires avec valeurs par défaut garanties
        id: course.id || index,
        _id: _id.toString(),
        title: course.course || course.title || course.name || `Cours ${index + 1}`,
        course: course.course || course.title || course.name || `Cours ${index + 1}`,
        description: course.description || course.what_you_will_learn || 'Description non disponible',
        price: course.price || 0,
        partner: course.partner || course.university || 'Partenaire inconnu',
        skills: course.skills || [],
        level: course.level || course.difficulty || 'Non spécifié',
        theme: course.theme || course.subject || 'Général',
        rating: course.rating || 0,
        enrollmentCount: course.enrollmentCount || 0,
        similarity: 0,
        similarity_percentage: 0, // Sera calculé dans getRecommendationsForUser
        score_percentage: 0, // Sera calculé dans getRecommendationsForUser
        method: "fallback",
        recommendationRank: index + 1
      }
    })
    
    console.log(`📚 Fallback: ${coursesWithRating.length} cours retournés`)
    
    return coursesWithRating
    
  } catch (error) {
    console.error("Error in fallback recommendations:", error)
    return []
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
