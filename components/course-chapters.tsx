"use client"

import { useState, useEffect } from "react"
import { updateCompletedChapters } from "@/actions/courses"
import { useToast } from "@/hooks/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, CheckCircle, Lock, AlertTriangle, Unlock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface Chapter {
  id: string
  title: string
  description: string
}

interface CourseChaptersProps {
  courseId: string
  chapters: Chapter[]
  completedChapters: string[] // Ces données viennent de la base de données
}

export function CourseChapters({ courseId, chapters, completedChapters }: CourseChaptersProps) {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  // Fonction pour extraire le numéro de chapitre d'un ID
  const extractChapterNumber = (chapterId: string): number => {
    // Format attendu: "chapter-X-xxxxx" où X est le numéro du chapitre
    const match = chapterId.match(/chapter-(\d+)-/);
    return match ? parseInt(match[1], 10) : -1;
  }

  // Déduplication des chapitres complétés par numéro de chapitre
  const dedupCompletedChapters = (chapterIds: string[]): string[] => {
    const chapterNumbersSet = new Set<number>();
    const uniqueChapterIds: string[] = [];
    
    chapterIds.forEach(id => {
      const chapterNumber = extractChapterNumber(id);
      if (chapterNumber !== -1 && !chapterNumbersSet.has(chapterNumber)) {
        chapterNumbersSet.add(chapterNumber);
        uniqueChapterIds.push(id);
      }
    });
    
    return uniqueChapterIds;
  }

  // Chapitres complétés dédupliqués (par numéro de chapitre)
  const [cleanCompletedChapters] = useState<string[]>(dedupCompletedChapters(completedChapters || []));

  // Compter les chapitres dupliqués pour avertir l'administrateur
  const duplicatesCount = completedChapters ? completedChapters.length - cleanCompletedChapters.length : 0;
  
  // Pour suivre les nouveaux chapitres sélectionnés dans cette session
  const [newlySelectedChapters, setNewlySelectedChapters] = useState<string[]>([]);
  
  // Pour suivre les chapitres à supprimer (retirer de complétés)
  const [chaptersToRemove, setChaptersToRemove] = useState<number[]>([]);
  
  // État combiné pour l'affichage
  const [displayedCompletedChapters, setDisplayedCompletedChapters] = useState<string[]>([
    ...cleanCompletedChapters
  ]);
  
  // Met à jour l'affichage quand les états changent
  useEffect(() => {
    // Tous les numéros de chapitres complétés
    const completedChapterNumbers = cleanCompletedChapters.map(extractChapterNumber);
    
    // Filtrer les nouvelles sélections qui ne sont pas déjà complétées (par numéro)
    const filteredNewSelections = newlySelectedChapters.filter(id => {
      const num = extractChapterNumber(id);
      return num !== -1 && !completedChapterNumbers.includes(num);
    });
    
    // Filtrer les chapitres complétés pour retirer ceux qui ont été marqués pour suppression
    const filteredCompletedChapters = cleanCompletedChapters.filter(id => {
      const num = extractChapterNumber(id);
      return !chaptersToRemove.includes(num);
    });
    
    setDisplayedCompletedChapters([...filteredCompletedChapters, ...filteredNewSelections]);
  }, [cleanCompletedChapters, newlySelectedChapters, chaptersToRemove]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  }

  // Vérifie si un chapitre est déjà validé (par numéro de chapitre)
  const isChapterAlreadyCompleted = (chapterId: string): boolean => {
    const chapterNumber = extractChapterNumber(chapterId);
    return cleanCompletedChapters.some(id => extractChapterNumber(id) === chapterNumber) && 
           !chaptersToRemove.includes(chapterNumber);
  }

  const toggleChapterSelection = (chapterId: string) => {
    const chapterNumber = extractChapterNumber(chapterId);
    
    // Option 1: Le chapitre est dans la DB mais marqué pour suppression (on le remet)
    if (cleanCompletedChapters.some(id => extractChapterNumber(id) === chapterNumber) && 
        chaptersToRemove.includes(chapterNumber)) {
      
      setChaptersToRemove(chaptersToRemove.filter(num => num !== chapterNumber));
      return;
    }
    
    // Option 2: Le chapitre est dans la DB et pas encore marqué pour suppression (on le marque pour suppression)
    if (cleanCompletedChapters.some(id => extractChapterNumber(id) === chapterNumber)) {
      setChaptersToRemove([...chaptersToRemove, chapterNumber]);
      return;
    }
    
    // Option 3: Le chapitre est dans les sélections nouvelles (on le retire)
    if (newlySelectedChapters.some(id => extractChapterNumber(id) === chapterNumber)) {
      setNewlySelectedChapters(
        newlySelectedChapters.filter(id => extractChapterNumber(id) !== chapterNumber)
      );
      return;
    }
    
    // Option 4: Le chapitre n'est nulle part (on l'ajoute aux sélections nouvelles)
    setNewlySelectedChapters([...newlySelectedChapters, chapterId]);
  }

  const saveProgress = async () => {
    setIsUpdating(true);

    try {
      // Filtrer les chapitres complétés en retirant ceux marqués pour suppression
      const filteredCompletedChapters = cleanCompletedChapters.filter(id => {
        const num = extractChapterNumber(id);
        return !chaptersToRemove.includes(num);
      });
      
      // Combiner avec les nouveaux chapitres sélectionnés
      const finalSelection = [...filteredCompletedChapters, ...newlySelectedChapters];
      
      const result = await updateCompletedChapters(courseId, finalSelection);

      if (result.success) {
        toast({
          title: "Progression mise à jour",
          description: "Votre progression a été enregistrée avec succès",
        });
        
        // Forcer un rechargement pour mettre à jour les données depuis la DB
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Impossible de mettre à jour votre progression",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre progression",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  // Vérifier si le chapitre est sélectionné (combiné)
  const isChapterSelected = (chapterId: string): boolean => {
    const chapterNumber = extractChapterNumber(chapterId);
    
    // Vérifier dans les complétés originaux (et pas marqués pour suppression)
    const completedInOriginal = cleanCompletedChapters.some(
      id => extractChapterNumber(id) === chapterNumber
    ) && !chaptersToRemove.includes(chapterNumber);
    
    // Vérifier dans les nouveaux sélectionnés
    const selectedInNew = newlySelectedChapters.some(
      id => extractChapterNumber(id) === chapterNumber
    );
    
    return completedInOriginal || selectedInNew;
  }

  // Vérifier s'il y a des modifications à enregistrer
  const hasChanges = (): boolean => {
    return newlySelectedChapters.length > 0 || chaptersToRemove.length > 0;
  }

  // Vérifier si un chapitre est en cours de suppression
  const isMarkedForRemoval = (chapterId: string): boolean => {
    const chapterNumber = extractChapterNumber(chapterId);
    return chaptersToRemove.includes(chapterNumber) && 
           cleanCompletedChapters.some(id => extractChapterNumber(id) === chapterNumber);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Contenu du cours
          {duplicatesCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>{duplicatesCount} doublons détectés</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Des chapitres terminés ont été détectés en double dans vos données.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <CardDescription>
          {displayedCompletedChapters.length} sur {chapters.length} chapitres terminés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {chapters.map((chapter) => {
            const isCompleted = isChapterAlreadyCompleted(chapter.id);
            const isSelected = isChapterSelected(chapter.id);
            const isRemoval = isMarkedForRemoval(chapter.id);
            
            return (
              <div key={chapter.id} className="border rounded-md overflow-hidden">
                <div className="flex items-center p-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mr-3 relative">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleChapterSelection(chapter.id)}
                            id={`chapter-${chapter.id}`}
                            className={isRemoval ? "opacity-50" : ""}
                          />
                          {isCompleted && !isRemoval && (
                            <span className="absolute -right-4 -bottom-4 text-green-600">
                              <Lock className="h-3 w-3" />
                            </span>
                          )}
                          {isRemoval && (
                            <span className="absolute -right-4 -bottom-4 text-amber-600">
                              <Unlock className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isCompleted && !isRemoval && <p>Chapitre terminé et verrouillé</p>}
                        {isRemoval && <p>Chapitre marqué pour être retiré</p>}
                        {!isCompleted && !isRemoval && !isSelected && <p>Marquer comme terminé</p>}
                        {!isCompleted && !isRemoval && isSelected && <p>Marquer comme non terminé</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div 
                    className="flex-1 flex items-center justify-between cursor-pointer hover:bg-muted"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div>
                      <span className={`font-medium ${isCompleted && !isRemoval ? "text-green-600" : ""} ${isRemoval ? "text-amber-600 line-through" : ""}`}>
                        {chapter.title}
                        {isCompleted && !isRemoval && (
                          <CheckCircle className="h-4 w-4 ml-2 inline text-green-600" />
                        )}
                      </span>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform ${
                        expandedChapter === chapter.id ? "transform rotate-180" : ""
                      }`} 
                    />
                  </div>
                </div>
                <Collapsible open={expandedChapter === chapter.id}>
                  <CollapsibleContent className="p-4 pt-0 border-t">
                    <p className="text-sm text-muted-foreground">
                      {chapter.description}
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={saveProgress} 
          disabled={isUpdating || !hasChanges()}
          className="w-full"
        >
          {isUpdating ? "Mise à jour en cours..." : "Enregistrer la progression"}
        </Button>
      </CardFooter>
    </Card>
  );
}
