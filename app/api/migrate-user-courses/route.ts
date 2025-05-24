import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    // Vérifier si l'utilisateur est connecté et a un ID
    if (!session?.user || !("id" in session.user) || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Récupérer tous les utilisateurs
    const users = await db.collection("users").find({}).toArray();
    
    let updatedUsers = 0;
    let updatedCourses = 0;

    // Parcourir tous les utilisateurs et mettre à jour leurs cours
    for (const user of users) {
      if (user.courses && user.courses.length > 0) {
        const updatedCoursesList = user.courses.map((course: any, index: number) => {
          // Vérifier si le cours a déjà un id
          if (!course.id) {
            updatedCourses++;
            return {
              ...course,
              id: index + 100 // Générer un id simple basé sur l'index + 100
            };
          }
          return course;
        });

        // Mettre à jour l'utilisateur avec les nouveaux cours
        await db.collection("users").updateOne(
          { _id: user._id },
          { $set: { courses: updatedCoursesList } }
        );
        
        if (updatedCoursesList.some((c: any) => !c.id)) {
          updatedUsers++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration terminée: ${updatedUsers} utilisateurs et ${updatedCourses} cours mis à jour`,
    });
  } catch (error) {
    console.error("Error during migration:", error);
    return NextResponse.json(
      { error: "Une erreur s'est produite pendant la migration" },
      { status: 500 }
    );
  }
}

