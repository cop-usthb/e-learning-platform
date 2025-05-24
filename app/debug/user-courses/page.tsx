"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function UserCoursesDebugPage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fixingIds, setFixingIds] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserCoursesData()
    }
  }, [session])

  const fetchUserCoursesData = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/debug/user-courses`)
      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error("Error fetching user courses data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fixCourseIds = async () => {
    if (!confirm("Êtes-vous sûr de vouloir corriger les IDs des cours ? Cette action peut modifier vos données.")) {
      return
    }

    setFixingIds(true)
    try {
      const response = await fetch("/api/fix-course-ids")
      const data = await response.json()

      if (data.success) {
        alert(
          `${data.message}\nTotal des cours utilisateur: ${data.totalUserCourses}\nTotal des cours: ${data.totalCourses}`,
        )
        fetchUserCoursesData()
        router.refresh()
      } else {
        alert("Erreur: " + (data.error || "Une erreur est survenue"))
      }
    } catch (error) {
      console.error("Error fixing course IDs:", error)
      alert("Une erreur est survenue")
    } finally {
      setFixingIds(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Débogage des cours utilisateur</CardTitle>
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
          <CardTitle>Débogage des cours utilisateur</CardTitle>
          <CardDescription>Informations détaillées sur les cours de l'utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Cours utilisateur</h2>
              <pre className="bg-muted p-4 rounded-md overflow-auto mt-2 text-sm h-96">
                {loading ? "Chargement..." : JSON.stringify(userData?.userCourses, null, 2)}
              </pre>
            </div>

            <div>
              <h2 className="text-xl font-bold">Mapping des cours</h2>
              <pre className="bg-muted p-4 rounded-md overflow-auto mt-2 text-sm h-48">
                {loading ? "Chargement..." : JSON.stringify(userData?.courseMap, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={fetchUserCoursesData} disabled={loading}>
            {loading ? "Chargement..." : "Rafraîchir"}
          </Button>
          <Button variant="secondary" onClick={fixCourseIds} disabled={fixingIds}>
            {fixingIds ? "Correction en cours..." : "Corriger les IDs des cours"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
