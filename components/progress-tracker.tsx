"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { updateCourseProgress } from "@/actions/courses"

interface ProgressTrackerProps {
  courseId: string
  currentProgress: number
}

export function ProgressTracker({ courseId, currentProgress }: ProgressTrackerProps) {
  const [progress, setProgress] = useState(currentProgress)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0])
  }

  const handleSaveProgress = async () => {
    setIsLoading(true)

    try {
      const result = await updateCourseProgress(courseId, progress)

      if (result.success) {
        toast({
          title: "Progression mise à jour",
          description: `Votre progression est maintenant de ${progress}%`,
        })
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur est survenue",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8 p-6 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Votre progression</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Progression actuelle</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Slider value={[progress]} min={0} max={100} step={5} onValueChange={handleProgressChange} />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveProgress} disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer la progression"}
          </Button>
        </div>
      </div>
    </div>
  )
}
