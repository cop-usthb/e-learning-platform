"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { getThemes } from "@/lib/courses"
import { registerUser } from "@/actions/auth"
import { z } from "zod"

// Schéma de validation pour la première étape
const signupSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

export default function SignUpPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [availableInterests, setAvailableInterests] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Charger les thèmes disponibles
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        console.log("Fetching themes...")
        const response = await fetch("/api/themes")

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Themes API response:", data)

        if (data.success && data.themes && Array.isArray(data.themes)) {
          setAvailableInterests(data.themes)
        } else {
          console.error("Invalid themes data:", data)
          toast({
            title: "Erreur",
            description: "Format de données des thèmes invalide",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erreur lors du chargement des thèmes:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les thèmes",
          variant: "destructive",
        })
      }
    }

    fetchThemes()
  }, [toast])

  const handleInterestChange = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const validateStep1 = () => {
    try {
      signupSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const path = err.path[0] as string
          newErrors[path] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleNextStep = async () => {
    if (validateStep1()) {
      setIsLoading(true)
      setIsLoading(false)
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    if (selectedInterests.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un centre d'intérêt",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        interests: selectedInterests,
      })

      if (result.success) {
        toast({
          title: "Inscription réussie",
          description: "Vous pouvez maintenant vous connecter",
        })
        router.push("/auth/signin")
      } else {
        toast({
          title: "Erreur d'inscription",
          description: result.message || "Une erreur est survenue",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inscription - Étape {step}/2</CardTitle>
          <CardDescription>
            {step === 1 ? "Créez votre compte pour accéder à nos cours" : "Sélectionnez vos centres d'intérêt"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom d'utilisateur</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  J'accepte les conditions d'utilisation
                </Label>
              </div>
              {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms}</p>}
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Thèmes préférés (sélectionnez au moins un)</Label>
                <div className="border rounded-md p-3 h-60 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p>Chargement des compétences...</p>
                    </div>
                  ) : availableInterests.length > 0 ? (
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
                    <p className="text-center text-muted-foreground">Aucun centre d'intérêt disponible</p>
                  )}
                </div>
                {selectedInterests.length === 0 && formSubmitted && (
                  <p className="text-sm text-muted-foreground">Veuillez sélectionner au moins un thème</p>
                )}
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {step === 1 ? (
            <Button onClick={handleNextStep} className="w-full" disabled={isLoading}>
              Continuer
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1" disabled={isLoading}>
                Retour
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={isLoading || selectedInterests.length === 0}>
                {isLoading ? "Inscription en cours..." : "S'inscrire"}
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">
            Déjà un compte ?{" "}
            <a href="/auth/signin" className="text-primary hover:underline">
              Se connecter
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
