"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ProtectedContentProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedContent({ 
  children, 
  redirectTo = "/login" 
}: ProtectedContentProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Si le statut est "unauthenticated", cela signifie que la session a été vérifiée
    // et que l'utilisateur n'est pas connecté
    if (status === "unauthenticated") {
      router.push(redirectTo)
    }
  }, [status, router, redirectTo])

  // Session en cours de chargement
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse">Chargement...</div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté, montrer une interface pour le rediriger
  if (status === "unauthenticated") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contenu réservé</CardTitle>
          <CardDescription>
            Cette fonctionnalité est réservée aux utilisateurs connectés.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Veuillez vous connecter ou créer un compte pour accéder aux cours recommandés
            personnalisés selon vos centres d'intérêt.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/login")} className="flex-1">
              Se connecter
            </Button>
            <Button onClick={() => router.push("/auth/signup")} variant="outline" className="flex-1">
              Créer un compte
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si l'utilisateur est connecté, afficher le contenu protégé
  return <>{children}</>
}