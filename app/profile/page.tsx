"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ProfileInfo } from "@/components/profile-info"
import { UserCourses } from "@/components/user-courses"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [availableInterests, setAvailableInterests] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [initialInterests, setInitialInterests] = useState<string[]>([])
  const [isUpdatingInterests, setIsUpdatingInterests] = useState(false)

  // Fetch the user's current interests and available themes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user")

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/auth/signin")
            return
          }
          throw new Error("Failed to fetch user data")
        }

        const userData = await response.json()

        if (userData.success && userData.user) {
          setUser(userData.user)

          // Set initial interests from user data
          const userInterests = userData.user.interests || []
          setSelectedInterests(userInterests)
          setInitialInterests(userInterests)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchThemes = async () => {
      try {
        const response = await fetch("/api/themes")

        if (!response.ok) {
          throw new Error(`Error fetching themes: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && Array.isArray(data.themes)) {
          setAvailableInterests(data.themes)
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger les thèmes",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching themes:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les thèmes",
          variant: "destructive",
        })
      }
    }

    fetchUserData()
    fetchThemes()
  }, [router, toast])

  const handleInterestChange = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const saveInterests = async () => {
    setIsUpdatingInterests(true)

    try {
      // Call API to update interests
      const response = await fetch("/api/user/interests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interests: selectedInterests }),
      })

      const result = await response.json()

      if (result.success) {
        setInitialInterests([...selectedInterests])
        toast({
          title: "Succès",
          description: "Vos thèmes préférés ont été mis à jour",
        })
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Impossible de mettre à jour vos thèmes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving interests:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de vos thèmes",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingInterests(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto py-8">Chargement...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

      {user && <ProfileInfo user={user} />}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Centres d'intérêt</CardTitle>
          <CardDescription>Gérez vos thèmes préférés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
            {availableInterests.length > 0 ? (
              <div className="space-y-2">
                {availableInterests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={`interest-${interest}`}
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={() => handleInterestChange(interest)}
                    />
                    <Label htmlFor={`interest-${interest}`} className="cursor-pointer">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Aucun thème disponible</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={saveInterests}
            disabled={isUpdatingInterests || JSON.stringify(selectedInterests) === JSON.stringify(initialInterests)}
          >
            {isUpdatingInterests ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </CardFooter>
      </Card>

      {user && <UserCourses userId={user.id} />}
    </div>
  )
}
