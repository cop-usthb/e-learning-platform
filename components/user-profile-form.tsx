"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

// Sample interests - in a real app, these would come from the API
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

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide",
  }),
  interests: z.array(z.string()).min(1, {
    message: "Veuillez sélectionner au moins un centre d'intérêt",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface UserProfileFormProps {
  user: any
}

export default function UserProfileForm({ user }: UserProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Default form values
  const defaultValues: Partial<ProfileFormValues> = {
    name: user?.name || "",
    email: user?.email || "",
    interests: user?.interests || [],
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsLoading(true)

      // In a real app, this would update the user profile
      // For now, we'll just show a success message

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      })

      router.refresh()
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Input placeholder="votre@email.com" {...field} disabled />
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
                <FormLabel>Centres d'intérêt</FormLabel>
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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Mise à jour..." : "Mettre à jour le profil"}
        </Button>
      </form>
    </Form>
  )
}
