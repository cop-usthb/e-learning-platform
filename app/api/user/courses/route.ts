import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUserPurchasedCourses } from "@/lib/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const purchasedCourses = await getUserPurchasedCourses(session.user.id)

    return NextResponse.json(purchasedCourses)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des cours" }, { status: 500 })
  }
}
