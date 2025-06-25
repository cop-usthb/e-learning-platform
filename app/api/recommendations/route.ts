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

    console.log(`🔍 Demande de recommandations pour l'utilisateur: ${session.user.id}`)

    // Récupérer les intérêts de l'utilisateur
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(session.user.id) 
    })
    
    // S'assurer que les intérêts sont dans un format correct
    let userInterests: string[] = []
    if (user?.interests) {
      if (typeof user.interests === 'string') {
        userInterests = [user.interests]
      } else if (Array.isArray(user.interests)) {
        userInterests = user.interests.filter(interest => typeof interest === 'string')
      }
    }
    
    console.log(`👤 Intérêts de l'utilisateur:`, userInterests)

    // Obtenir les recommandations via le script Python hybride
    const { recommendations, executionInfo } = await getRecommendationsForUser(
      session.user.id,
      userInterests
    )

    // Vérifier que recommendations est un array
    if (!Array.isArray(recommendations)) {
      console.error("❌ Recommendations is not an array:", recommendations)
      return NextResponse.json({ 
        success: false,
        recommendations: [], 
        executionInfo: { error: "Invalid recommendations format" },
        count: 0,
        method: 'error'
      })
    }

    // Limiter le nombre de recommandations
    const limitedRecommendations = recommendations.slice(0, num)

    console.log(`✅ Recommandations retournées: ${limitedRecommendations.length} cours`)
    console.log('📊 Scores finaux:', limitedRecommendations.map(r => 
      `${r.id}: ${r.score_percentage}% (${r.method}) - ${r.title?.substring(0, 50)}...`
    ))
    console.log('🔍 Méthode utilisée:', executionInfo.pythonSuccess ? 'Python' : 'Fallback')
    console.log('🔍 Première recommandation:', limitedRecommendations[0])
    console.log('🔍 Attributs de score:', {
      score: limitedRecommendations[0]?.score,
      similarity_percentage: limitedRecommendations[0]?.similarity_percentage,
      score_percentage: limitedRecommendations[0]?.score_percentage
    })

    return NextResponse.json({
      success: true,
      recommendations: limitedRecommendations,
      count: limitedRecommendations.length,
      method: executionInfo.pythonSuccess ? 'python_hybrid' : 'fallback',
      user_interests: userInterests,
      executionInfo
    })

  } catch (error) {
    console.error('❌ Erreur API recommandations:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la génération des recommandations',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        recommendations: [],
        count: 0
      },
      { status: 500 }
    )
  }
}