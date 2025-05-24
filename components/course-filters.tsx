"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CourseFiltersProps {
  themes: string[]
  partners: string[]
}

export function CourseFilters({ themes, partners }: CourseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTheme, setSelectedTheme] = useState(searchParams.get("theme") || "")
  const [selectedPartner, setSelectedPartner] = useState(searchParams.get("partner") || "")
  const [isPending, startTransition] = useTransition()

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)

    if (selectedTheme) {
      params.set("theme", selectedTheme)
    } else {
      params.delete("theme")
    }

    if (selectedPartner) {
      params.set("partner", selectedPartner)
    } else {
      params.delete("partner")
    }

    startTransition(() => {
      router.push(`/courses?${params.toString()}`)
    })
  }

  const resetFilters = () => {
    setSelectedTheme("")
    setSelectedPartner("")

    const params = new URLSearchParams(searchParams)
    params.delete("theme")
    params.delete("partner")

    startTransition(() => {
      router.push(`/courses?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-6">
      <div className="font-medium text-lg">Filtres</div>

      <Accordion type="single" collapsible defaultValue="themes">
        <AccordionItem value="themes">
          <AccordionTrigger>Thèmes</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
              {themes.map((theme) => (
                <div key={theme} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={theme} id={`theme-${theme}`} />
                  <Label htmlFor={`theme-${theme}`} className="cursor-pointer">
                    {theme}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="partners">
          <AccordionTrigger>Partenaires</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedPartner} onValueChange={setSelectedPartner}>
              {partners.map((partner) => (
                <div key={partner} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={partner} id={`partner-${partner}`} />
                  <Label htmlFor={`partner-${partner}`} className="cursor-pointer">
                    {partner}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters} disabled={isPending}>
          {isPending ? "Application..." : "Appliquer les filtres"}
        </Button>
        <Button variant="outline" onClick={resetFilters} disabled={isPending || (!selectedTheme && !selectedPartner)}>
          Réinitialiser
        </Button>
      </div>
    </div>
  )
}
