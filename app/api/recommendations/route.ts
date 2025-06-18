import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRecommendationsForUser } from '@/lib/recommendation'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    // Récupérer la session utilisateur
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const num = parseInt(searchParams.get('num') || '8')

    console.log(`Demande de recommandations pour l'utilisateur: ${session.user.id}`)

    // Récupérer les intérêts de l'utilisateur
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(session.user.id) 
    })
    
    const userInterests = user?.interests || []
    console.log(`Intérêts de l'utilisateur: ${userInterests}`)

    // Obtenir les recommandations via le script Python
    const recommendations = await getRecommendationsForUser(
      session.user.id,
      userInterests
    )

    // Limiter le nombre de recommandations
    const limitedRecommendations = recommendations.slice(0, num)

    console.log(`Recommandations retournées: ${limitedRecommendations.length} cours`)

    return NextResponse.json({
      success: true,
      recommendations: limitedRecommendations,
      count: limitedRecommendations.length,
      method: 'python_collaborative',
      user_interests: userInterests
    })

  } catch (error) {
    console.error('Erreur API recommandations:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération des recommandations',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}