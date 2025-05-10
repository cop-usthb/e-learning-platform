import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function getRandomRecommendations(interests: string[] = [], limit = 6) {
  try {
    const { db } = await connectToDatabase()

    let query = {}

    // Si l'utilisateur a des intérêts, filtrer les cours qui correspondent
    if (interests && interests.length > 0) {
      const interestRegex = interests.map((interest) => new RegExp(interest, "i"))
      query = {
        $or: interestRegex.map((regex) => ({ skills: { $regex: regex } })),
      }
    }

    // Récupérer des cours aléatoires
    const courses = await db
      .collection("Courses")
      .aggregate([{ $match: query }, { $sample: { size: limit } }])
      .toArray()

    return courses
  } catch (error) {
    console.error("Error getting random recommendations:", error)
    return []
  }
}

export async function getScoredRecommendations(db: any, interests: string[] = [], userId: string | null = null, limit = 6) {
  try {
    // Base de calcul des scores
    const baseScore = 70; // Score minimum pour une recommandation
    
    // Construire la requête MongoDB
    let query: any = {};
    
    // Exclure les cours déjà achetés par l'utilisateur si un ID est fourni
    let purchasedCourseIds: string[] = [];
    if (userId) {
      const user = await db.collection("Users").findOne({ _id: new ObjectId(userId) });
      if (user && user.purchasedCourses) {
        purchasedCourseIds = user.purchasedCourses
          .filter((pc: any) => pc.courseId) // Vérifier que courseId existe
          .map((pc: any) => pc.courseId.toString()); // Convertir tous les IDs en string
      }
      
      if (purchasedCourseIds.length > 0) {
        query._id = { $nin: purchasedCourseIds.map(id => {
          try {
            return ObjectId.isValid(id) ? new ObjectId(id) : id;
          } catch (e) {
            return id;
          }
        })};
      }
    }

    // Récupérer tous les cours correspondant à la requête
    const courses = await db.collection("Courses").find(query).toArray();
    
    // Calculer les scores pour chaque cours
    const scoredCourses = courses.map(course => {
      // Score initial basé sur la note du cours
      let score = baseScore;
      
      // Augmenter le score en fonction de la note du cours (0-10%)
      const rating = parseFloat(course.rating) || 0;
      score += Math.min(rating * 2, 10);
      
      // Augmenter le score si les compétences correspondent aux intérêts (0-20%)
      if (interests && interests.length > 0 && course.skills) {
        const courseSkills = typeof course.skills === 'string' 
          ? course.skills.toLowerCase() 
          : JSON.stringify(course.skills).toLowerCase();
          
        const matchCount = interests.filter(interest => 
          courseSkills.includes(interest.toLowerCase())
        ).length;
        
        if (matchCount > 0) {
          // Plus il y a de correspondances, plus le score est élevé
          score += Math.min(matchCount * 5, 20);
        }
      }
      
      return {
        ...course,
        recommendationScore: Math.min(Math.round(score), 100) // Limiter à 100%
      };
    });

    // Trier par score décroissant
    scoredCourses.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    // Limiter le nombre de résultats
    return scoredCourses.slice(0, limit);
  } catch (error) {
    console.error("Error getting scored recommendations:", error);
    return [];
  }
}
