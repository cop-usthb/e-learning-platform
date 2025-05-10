"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CourseChaptersProps {
  courseId: string
  completedChapters: number[]
}

export default function CourseChapters({ courseId, completedChapters = [] }: CourseChaptersProps) {
  const router = useRouter()
  const [selectedChapters, setSelectedChapters] = useState<number[]>(completedChapters)
  const [isUpdating, setIsUpdating] = useState(false)

  // Générer 10 chapitres
  const chapters = Array.from({ length: 10 }, (_, i) => i + 1)

  const toggleChapter = (chapterNumber: number) => {
    setSelectedChapters((prev) =>
      prev.includes(chapterNumber) ? prev.filter((ch) => ch !== chapterNumber) : [...prev, chapterNumber],
    )
  }

  const saveProgress = async () => {
    try {
      setIsUpdating(true)

      const response = await fetch("/api/user/courses/chapters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          completedChapters: selectedChapters,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la mise à jour des chapitres")
      }

      toast({
        title: "Progression mise à jour",
        description: `Votre progression a été enregistrée.`,
      })

      router.refresh()
    } catch (error) {
      console.error("Update chapters error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 border rounded-lg p-4">
        {chapters.map((chapter) => (
          <div key={chapter} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
            <Checkbox
              id={`chapter-${chapter}`}
              checked={selectedChapters.includes(chapter)}
              onCheckedChange={() => toggleChapter(chapter)}
            />
            <label
              htmlFor={`chapter-${chapter}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              Chapitre {chapter}
            </label>
          </div>
        ))}
      </div>

      <Button onClick={saveProgress} disabled={isUpdating} className="w-full">
        {isUpdating ? "Enregistrement..." : "Enregistrer ma progression"}
      </Button>
    </div>
  )
}
