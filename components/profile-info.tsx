"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface ProfileInfoProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [userName, setUserName] = useState(user.name)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateProfile = async () => {
    if (!userName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom ne peut pas être vide",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: userName }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Succès",
          description: "Profil mis à jour",
        })
        setIsEditing(false)
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la mise à jour du profil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>Gérez vos informations personnelles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            {isEditing ? (
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isUpdating}
              />
            ) : (
              <div className="p-2 border rounded-md">{user.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="p-2 border rounded-md">{user.email}</div>
          </div>

          <div className="flex justify-end">
            {isEditing ? (
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setUserName(user.name)
                  }}
                  disabled={isUpdating}
                >
                  Annuler
                </Button>
                <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                  {isUpdating ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Modifier</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
