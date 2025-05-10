"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"

// Schéma de validation pour l'étape 1 - restrictions simplifiées sur mot de passe
const signUpSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions d'utilisation" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"], 
});

// Type pour l'étape 1
type SignUpFormValues = z.infer<typeof signUpSchema>

// Fetch des compétences disponibles pour l'étape 2
async function fetchAvailableSkills() {
  try {
    const response = await fetch("/api/skills")
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching skills:", error)
    return []
  }
}

export default function SignUpFormMultiStep() {
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState<SignUpFormValues | null>(null)
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  // Charger les compétences disponibles
  useEffect(() => {
    async function loadSkills() {
      const skills = await fetchAvailableSkills()
      setAvailableSkills(skills)
    }
    loadSkills()
  }, [])

  // Formulaire pour l'étape 1
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  })

  // Fonction pour gérer la soumission de l'étape 1
  const onSubmitStep1 = (data: SignUpFormValues) => {
    setUserData(data)
    setStep(2)
  }

  // Fonction pour gérer la sélection des compétences
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  // Fonction pour revenir à l'étape 1
  const goBackToStep1 = () => {
    setStep(1)
  }

  // Fonction pour soumettre le formulaire complet
  const completeSignUp = async () => {
    if (!userData) return

    try {
      setIsSubmitting(true)

      // Créer l'utilisateur avec les données de base
      const userResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        }),
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        throw new Error(errorData.message || "Erreur lors de la création du compte")
      }

      const userData2 = await userResponse.json()
      const userId = userData2.id

      // Mettre à jour les centres d'intérêt
      const interestsResponse = await fetch("/api/user/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          interests: selectedSkills,
        }),
      })

      if (!interestsResponse.ok) {
        throw new Error("Erreur lors de l'enregistrement des centres d'intérêt")
      }

      toast({
        title: "Compte créé avec succès",
        description: "Vous pouvez maintenant vous connecter avec vos identifiants.",
      })

      // Rediriger vers la page de connexion au bon chemin
      router.push("/login")
      
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Erreur d'inscription",
        description: error instanceof Error ? error.message : "Erreur lors de l'inscription",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {step === 1 ? "Créer un compte" : "Sélectionnez vos centres d'intérêt"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {step === 1
            ? "Veuillez fournir vos informations d'inscription"
            : "Choisissez au moins 3 sujets qui vous intéressent"}
        </p>
      </div>

      {/* Indicateur d'étape */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div
          className={`w-3 h-3 rounded-full ${
            step === 1 ? "bg-primary" : "bg-primary/30"
          }`}
        ></div>
        <div
          className={`w-3 h-3 rounded-full ${
            step === 2 ? "bg-primary" : "bg-primary/30"
          }`}
        ></div>
      </div>

      {/* Étape 1: Informations de base */}
      {step === 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      J'accepte les <Link href="/terms" className="underline">conditions d'utilisation</Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Continuer
            </Button>
          </form>
        </Form>
      )}

      {/* Étape 2: Sélection des centres d'intérêt */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm mb-3 text-muted-foreground">
                Sélectionnez les domaines qui vous intéressent:
              </div>
              
              {/* Cadre avec défilement pour les centres d'intérêt */}
              <div className="h-64 overflow-y-auto border rounded-md p-3">
                <div className="grid grid-cols-2 gap-2">
                  {availableSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="px-3 py-2 cursor-pointer text-sm font-normal mb-2"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium">
                  {selectedSkills.length} sélectionné{selectedSkills.length > 1 ? "s" : ""}
                </span>
                {selectedSkills.length < 3 && (
                  <span className="text-amber-500 text-sm">
                    Minimum 3 centres d'intérêt
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={goBackToStep1} className="flex-1">
              Retour
            </Button>
            <Button
              onClick={completeSignUp}
              disabled={selectedSkills.length < 3 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Création en cours..." : "Terminer l'inscription"}
            </Button>
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Vous avez déjà un compte?{" "}
          <Link href="/login" className="underline">
            Connexion
          </Link>
        </p>
      </div>
    </div>
  )
}