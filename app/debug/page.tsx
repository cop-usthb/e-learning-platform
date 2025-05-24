"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function DebugPage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session])

  const fetchUserData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/debug?userId=${session.user.id}`)
      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetUserCourses = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser tous vos cours ? Cette action est irréversible.")) {
      return
    }

    setResetLoading(true)
    try {
      const response = await fetch("/api/reset-user-courses", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        alert(data.message)
        fetchUserData()
        router.refresh()
      } else {
        alert("Erreur: " + (data.error || "Une erreur est survenue"))
      }
    } catch (error) {
      console.error("Error resetting user courses:", error)
      alert("Une erreur est survenue")
    } finally {
      setResetLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Débogage</CardTitle>
            <CardDescription>Vous devez être connecté pour accéder à cette page</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/auth/signin")}>Se connecter</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Débogage</CardTitle>
          <CardDescription>Informations sur l'utilisateur et ses cours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Utilisateur</h2>
              <pre className="bg-muted p-4 rounded-md overflow-auto mt-2 text-sm">
                {loading ? "Chargement..." : JSON.stringify(userData?.user, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-xl font-bold">Cours achetés</h2>
              <pre className="bg-muted p-4 rounded-md overflow-auto mt-2 text-sm">
                {loading ? "Chargement..." : JSON.stringify(userData?.userCourses, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={fetchUserData} disabled={loading}>
            {loading ? "Chargement..." : "Rafraîchir"}
          </Button>
          <Button variant="destructive" onClick={resetUserCourses} disabled={resetLoading}>
            {resetLoading ? "Réinitialisation..." : "Réinitialiser mes cours"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
