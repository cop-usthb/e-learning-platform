import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db-init"

export async function GET() {
  try {
    const result = await initializeDatabase()

    if (result) {
      return NextResponse.json({ success: true, message: "Base de données initialisée avec succès" })
    } else {
      return NextResponse.json(
        { success: false, message: "Erreur lors de l'initialisation de la base de données" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erreur:", error)
    return NextResponse.json({ success: false, message: "Une erreur est survenue" }, { status: 500 })
  }
}
