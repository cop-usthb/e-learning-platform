"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trash2 } from "lucide-react"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

interface Course {
  _id: string
  courseId: string
  courseName: string
  partner?: string
  progress: number
  purchasedAt: string
}

interface UserCoursesProps {
  userId: string
}

export function UserCourses({ userId }: UserCoursesProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  useEffect(() => {
    fetchUserCourses()
  }, [userId, toast])

  const fetchUserCourses = async () => {
    try {
      const response = await fetch(`/api/courses/user?userId=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }

      const data = await response.json()

      if (data.success) {
        setCourses(data.courses || [])
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de charger vos cours",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching user courses:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos cours",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch("/api/courses/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: courseToDelete }),
      })

      const data = await response.json()

      if (data.success) {
        // Mettre à jour l'état local pour refléter la suppression
        setCourses(courses.filter(course => course.courseId !== courseToDelete))
        
        toast({
          title: "Succès",
          description: "Le cours a été supprimé de votre bibliothèque",
        })
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible de supprimer ce cours",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du cours",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsConfirmOpen(false)
      setCourseToDelete(null)
      router.refresh() // Pour rafraîchir les données de la page
    }
  }

  const openDeleteConfirmation = (courseId: string) => {
    setCourseToDelete(courseId)
    setIsConfirmOpen(true)
  }

  if (isLoading) {
    return <div>Chargement de vos cours...</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Mes cours</CardTitle>
          <CardDescription>Consultez les cours auxquels vous êtes inscrit</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course._id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex-grow">
                      <h3 className="font-semibold">{course.courseName}</h3>
                      {course.partner && <p className="text-sm text-muted-foreground">Par {course.partner}</p>}
                      <div className="mt-2">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-right mt-1">{course.progress}% complété</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openDeleteConfirmation(course.courseId)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                      <Link href={`/courses/${course.courseId}`}>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Voir le cours</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Vous n'êtes inscrit à aucun cours</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce cours ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le cours sera définitivement supprimé de votre bibliothèque et votre progression sera perdue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCourse}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression en cours..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
