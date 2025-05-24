import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Fonction pour initialiser les collections si elles n'existent pas
export async function initializeDatabase() {
  try {
    const { db } = await connectToDatabase()

    // Vérifier si les collections existent, sinon les créer
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes("users")) {
      await db.createCollection("users")
      console.log("Collection users créée")
      
      // Créer un index sur l'email pour optimiser les recherches
      await db.collection("users").createIndex({ email: 1 }, { unique: true })
      console.log("Index créé sur users (email)")
    }

    // Mettre à jour les cours existants pour ajouter des chapitres s'ils n'en ont pas
    const courses = await db.collection("Course").find({}).toArray()

    for (const course of courses) {
      if (!course.chapters || course.chapters.length === 0) {
        const chapters = []
        for (let i = 1; i <= 10; i++) {
          chapters.push({
            id: `chapter-${i}-${new ObjectId().toString()}`,
            title: `Chapitre ${i}`,
            description: `Contenu du chapitre ${i}`,
          })
        }

        await db.collection("Course").updateOne({ _id: course._id }, { $set: { chapters } })
      }
    }

    // Migration des données depuis userCourses vers la collection users
    if (collectionNames.includes("userCourses")) {
      console.log("Migration des données de userCourses vers users...")
      
      // Récupérer tous les utilisateurs
      const users = await db.collection("users").find({}).toArray()
      
      for (const user of users) {
        // Récupérer tous les cours de l'utilisateur depuis userCourses
        const userCourses = await db.collection("userCourses").find({ userId: user._id.toString() }).toArray()
        
        // Formater les cours pour les stocker dans l'utilisateur
        const courses = userCourses.map(course => ({
          courseId: course.courseId,
          progress: course.progress || 0,
          purchased: course.purchased || false,
          purchasedAt: course.purchasedAt || new Date().toISOString(),
          rating: course.rating !== undefined ? course.rating : null,
        }))
        
        // Mettre à jour l'utilisateur avec ses cours
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { courses: courses } }
        )
      }
      
      console.log("Migration terminée. Les cours sont maintenant stockés dans les documents utilisateur.")
    } else {
      // S'assurer que tous les utilisateurs ont un tableau de cours vide
      await db.collection("users").updateMany(
        { courses: { $exists: false } },
        { $set: { courses: [] } }
      )
    }

    console.log("Initialisation de la base de données terminée")
    return true
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error)
    return false
  }
}
