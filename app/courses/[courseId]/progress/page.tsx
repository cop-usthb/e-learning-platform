"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ChevronLeft, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Chapter {
  id: string;
  title: string;
  completed: boolean;
}

export default function CourseProgressPage() {
  const { courseId } = useParams() as { courseId: string }
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [courseName, setCourseName] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Calculer le pourcentage de progression
  const progressPercentage = chapters.length > 0
    ? Math.round((chapters.filter(ch => ch.completed).length / chapters.length) * 100)
    : 0

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchCourseProgress()
    }
  }, [status, courseId, router])

  const fetchCourseProgress = async () => {
    try {
      setIsLoading(true)
      
      // Récupérer les informations du cours
      const courseResponse = await fetch(`/api/courses/${courseId}`)
      const courseData = await courseResponse.json()
      
      setCourseName(courseData.title)
      
      // Récupérer la progression du cours
      const progressResponse = await fetch(`/api/user/courses/${courseId}/progress`)
      const progressData = await progressResponse.json()
      
      if (progressData.chapters) {
        setChapters(progressData.chapters)
      } else {
        // Si pas de progression, créer des chapitres à partir des données du cours
        setChapters(
          courseData.chapters?.map((chapter: any) => ({
            id: chapter.id || chapter._id,
            title: chapter.title,
            completed: false
          })) || []
        )
      }
    } catch (error) {
      console.error("Error fetching course progress:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger la progression du cours",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleChapter = (index: number) => {
    setChapters(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], completed: !updated[index].completed }
      return updated
    })
  }

  const saveProgress = async () => {
    if (!session?.user?.id) return
    
    try {
      setIsSaving(true)
      
      const response = await fetch(`/api/user/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapters })
      })
      
      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde")
      }
      
      toast({
        title: "Progression sauvegardée",
        description: "Votre progression a été mise à jour avec succès",
      })
    } catch (error) {
      console.error("Error saving progress:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder votre progression",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-4 mb-4">
              <div className="h-5 w-5 rounded bg-muted"></div>
              <div className="h-6 bg-muted rounded w-4/5"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{courseName}</CardTitle>
          <CardDescription>Suivez et mettez à jour votre progression dans ce cours</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progression totale</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-4">Chapitres du cours</h3>
            
            {chapters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun chapitre disponible pour ce cours.
              </p>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <div key={chapter.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`chapter-${chapter.id}`}
                      checked={chapter.completed}
                      onCheckedChange={() => toggleChapter(index)}
                    />
                    <label 
                      htmlFor={`chapter-${chapter.id}`}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                        chapter.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {chapter.title}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button onClick={saveProgress} disabled={isSaving}>
            {isSaving ? (
              "Sauvegarde en cours..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder la progression
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}