"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

// Centres d'intérêts disponibles
const INTERESTS = [
  { id: "programming", label: "Programmation" },
  { id: "data-science", label: "Data Science" },
  { id: "cloud", label: "Cloud Computing" },
  { id: "ai", label: "Intelligence Artificielle" },
  { id: "web", label: "Développement Web" },
  { id: "mobile", label: "Développement Mobile" },
  { id: "project-management", label: "Gestion de Projet" },
  { id: "design", label: "Design" },
]

const signupFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "Le nom doit contenir au moins 2 caractères",
    }),
    email: z.string().email({
      message: "Veuillez entrer une adresse email valide",
    }),
    password: z.string().min(6, {
      message: "Le mot de passe doit contenir au moins 6 caractères",
    }),
    confirmPassword: z.string(),
    interests: z.array(z.string()).min(1, {
      message: "Veuillez sélectionner au moins un centre d'intérêt",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupFormSchema>

export default function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      interests: [],
    },
  })

  async function onSubmit(data: SignupFormValues) {
    try {
      setIsLoading(true)

      // Envoyer les données d'inscription au serveur
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          interests: data.interests, // Envoyer les centres d'intérêts sélectionnés
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue lors de l'inscription")
      }

      toast({
        title: "Compte créé avec succès",
        description: "Vous pouvez maintenant vous connecter avec vos identifiants.",
      })

      router.push("/login")
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Erreur d'inscription",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue lors de la création de votre compte.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Votre nom" {...field} />
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
                  <Input placeholder="votre@email.com" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interests"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Centres d'intérêt (sélectionnez au moins un)</FormLabel>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {INTERESTS.map((interest) => (
                    <FormField
                      key={interest.id}
                      control={form.control}
                      name="interests"
                      render={({ field }) => {
                        return (
                          <FormItem key={interest.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(interest.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, interest.id])
                                    : field.onChange(field.value?.filter((value) => value !== interest.id))
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{interest.label}</FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer un compte"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <p className="text-muted-foreground">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
