"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import { executeProfileUpdate } from "@/lib/executeScript"

// Option alternative avec typage explicite
import { UpdateFilter } from "mongodb"

// Fonction pour acheter un cours
export async function purchaseCourse(courseId: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, message: "Vous devez être connecté pour acheter un cours" };
    }

    const { db } = await connectToDatabase();

    // Vérifier si le cours existe
    let courseObjectId;
    try {
      courseObjectId = new ObjectId(courseId);
    } catch (error) {
      return { success: false, message: "ID de cours invalide" };
    }

    const course = await db.collection("Course").findOne({ _id: courseObjectId });

    if (!course) {
      return { success: false, message: "Cours non trouvé" };
    }

    // Récupérer l'utilisateur
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return { success: false, message: "Utilisateur non trouvé" };
    }

    // Vérifier si l'utilisateur a déjà acheté ce cours
    const userCourses = user.courses || [];
    const courseAlreadyPurchased = userCourses.some((c: any) => c.courseId === courseId);

    if (courseAlreadyPurchased) {
      return { success: false, message: "Vous êtes déjà inscrit à ce cours" };
    }

    // Préparer les données du cours à ajouter
    const courseNumericId = course.id || Math.floor(Math.random() * 10000);
    const newCourse = {
      _id: new ObjectId(),
      courseId,
      id: courseNumericId,
      courseName: course.course,
      partner: course.partner,
      theme: course.theme || "Non classé",
      skills: course.skills || [],
      duration: course.duration,
      level: course.level,
      purchased: true,
      purchasedAt: new Date().toISOString(),
      progress: 0,
      completedChapters: [],
      lastAccessed: new Date().toISOString(),
    };

    // Ajouter le cours aux cours de l'utilisateur
    await db.collection("users").updateOne(
      { _id: user._id },
      { $push: { courses: newCourse } }
    );

    // Exécuter le script de mise à jour des profils
    executeProfileUpdate("purchase").catch(error => {
      // Silence les erreurs pour ne pas bloquer l'achat
    });

    // Revalider les chemins
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/profile");

    return {
      success: true,
      message: "Vous êtes maintenant inscrit à ce cours",
      courseId: courseId,
      id: courseNumericId
    };
  } catch (error) {
    console.error("Error purchasing course:", error);
    return { success: false, message: "Une erreur est survenue lors de l'inscription au cours" };
  }
}

// Fonction pour mettre à jour les chapitres terminés et la progression
export async function updateCompletedChapters(courseId: string, completedChapters: string[]) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, message: "Vous devez être connecté pour mettre à jour votre progression" };
    }

    const { db } = await connectToDatabase();

    // Récupérer l'utilisateur
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return { success: false, message: "Utilisateur non trouvé" };
    }

    // Récupérer les cours de l'utilisateur
    const userCourses = user.courses || [];

    // Trouver le cours spécifique
    const courseIndex = userCourses.findIndex((c: any) => c.courseId === courseId);

    if (courseIndex === -1) {
      return { success: false, message: "Cours non trouvé dans votre bibliothèque" };
    }

    // S'assurer que les chapitres complétés sont uniques
    const uniqueChapterNumbers = [...new Set(completedChapters)];

    // Obtenir le cours depuis la base de données pour connaître le nombre total de chapitres
    let courseObjectId;
    try {
      courseObjectId = new ObjectId(courseId);
    } catch (error) {
      return { success: false, message: "ID de cours invalide" };
    }

    const course = await db.collection("Course").findOne({ _id: courseObjectId });

    if (!course) {
      return { success: false, message: "Cours non trouvé" };
    }

    // Calculer la progression en pourcentage
    const totalChapters = course.chapters?.length || 10; // Fallback à 10 si pas de chapitres définis
    const progress = Math.round((uniqueChapterNumbers.length / totalChapters) * 100);

    // Mettre à jour le cours de l'utilisateur
    userCourses[courseIndex] = {
      ...userCourses[courseIndex],
      completedChapters: uniqueChapterNumbers,
      progress,
      lastAccessed: new Date().toISOString(),
    };

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { courses: userCourses } }
    );

    // Exécuter le script de mise à jour des profils
    executeProfileUpdate("progress").catch(error => {
      // Silence les erreurs pour ne pas bloquer la mise à jour
    });

    // Revalider les chemins
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/profile");

    return { 
      success: true, 
      progress, 
      completedChapters: uniqueChapterNumbers 
    };
  } catch (error) {
    console.error("Error updating completed chapters:", error);
    return { success: false, message: "Une erreur est survenue" };
  }
}

// Fonction pour noter un cours
export async function rateCourse(courseId: string, rating: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, message: "Vous devez être connecté pour noter un cours" };
    }

    // Vérifier que la note est valide (entre 1 et 5)
    if (rating < 1 || rating > 5) {
      return { success: false, message: "La note doit être comprise entre 1 et 5" };
    }

    const { db } = await connectToDatabase();

    // Récupérer l'utilisateur
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return { success: false, message: "Utilisateur non trouvé" };
    }

    // Vérifier si l'utilisateur a acheté ce cours
    const userCourses = user.courses || [];
    const courseIndex = userCourses.findIndex((c: any) => c.courseId === courseId);

    if (courseIndex === -1) {
      return { success: false, message: "Vous n'êtes pas inscrit à ce cours" };
    }

    // Mettre à jour la note du cours
    userCourses[courseIndex] = {
      ...userCourses[courseIndex],
      rating: rating,
      ratedAt: new Date().toISOString(),
    };

    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { courses: userCourses } }
    );

    // Récupérer tous les utilisateurs ayant noté ce cours
    const usersWithRating = await db
      .collection("users")
      .find({ "courses.courseId": courseId, "courses.rating": { $exists: true } })
      .toArray();

    // Calculer la note moyenne
    let totalRating = 0;
    let ratingCount = 0;

    usersWithRating.forEach((u) => {
      const course = u.courses.find((c: any) => c.courseId === courseId);
      if (course && typeof course.rating === "number") {
        totalRating += course.rating;
        ratingCount++;
      }
    });

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    // Mettre à jour la note moyenne du cours dans la collection Course
    if (ratingCount > 0) {
      try {
        const courseObjectId = new ObjectId(courseId);
        await db.collection("Course").updateOne(
          { _id: courseObjectId },
          {
            $set: {
              rating: parseFloat(averageRating.toFixed(1)),
              reviewcount: ratingCount.toString(),
            },
          }
        );
      } catch (error) {
        console.error("Error updating course rating:", error);
        // Ne pas échouer si la mise à jour de la collection Course échoue
      }
    }

    // Exécuter le script de mise à jour des profils
    executeProfileUpdate("rating").catch(error => {
      // Silence les erreurs pour ne pas bloquer la notation
    });

    // Revalider les chemins
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error rating course:", error);
    return { success: false, message: "Une erreur est survenue" };
  }
}

// Fonction pour supprimer un cours de la bibliothèque de l'utilisateur
export async function removeCourse(courseId: string) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return { success: false, message: "Vous devez être connecté pour effectuer cette action" }
    }

    const response = await fetch("/api/courses/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || "Impossible de supprimer ce cours" 
      }
    }

    // Exécuter le script de mise à jour des profils
    executeProfileUpdate("course_removal").catch(error => {
      // Silence les erreurs pour ne pas bloquer la suppression du cours
      console.error("Error executing profile update after course removal:", error);
    });

    // Revalidate paths after removing the course
    revalidatePath(`/courses/${courseId}`)
    revalidatePath("/profile")

    return {
      success: true,
      message: "Cours supprimé de votre bibliothèque",
    }
  } catch (error) {
    console.error("Error removing course:", error)
    return { success: false, message: "Une erreur est survenue lors de la suppression du cours" }
  }
}
