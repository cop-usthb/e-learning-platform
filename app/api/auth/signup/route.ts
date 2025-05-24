import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { executeProfileUpdate } from "@/lib/executeScript";

export async function POST(request) {
  try {
    const { fullName, email, password } = await request.json();

    // Validation des données
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await db.collection("users").insertOne({
      fullName,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      courses: [],
      interests: [],
      preferences: {
        theme: "light",
        notifications: true,
      },
    });

    // Exécuter le script de mise à jour des profils après inscription
    console.log("Nouvel utilisateur créé, lancement de la mise à jour des profils...");
    try {
      // Exécuter de façon asynchrone pour ne pas bloquer la réponse
      executeProfileUpdate("signup").then(result => {
        console.log(`Résultat de la mise à jour des profils: ${result.message}`);
      }).catch(error => {
        console.error(`Erreur lors de la mise à jour des profils après inscription:`, error);
      });
    } catch (error) {
      console.error(`Erreur lors du lancement de la mise à jour:`, error);
      // Ne pas bloquer l'inscription en cas d'erreur avec le script
    }

    return NextResponse.json({
      success: true,
      message: "Inscription réussie",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}