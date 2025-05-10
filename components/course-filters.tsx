"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

// Sample data - in a real app, these would come from the API
const SKILLS = [
  "Programming",
  "Data Science",
  "Cloud Computing",
  "Project Management",
  "Software Engineering",
  "Artificial Intelligence",
  "Machine Learning",
  "Web Development",
  "Mobile Development",
]

const PARTNERS = ["SkillUp EdTech", "IBM", "Microsoft", "Google", "Amazon", "Coursera", "Udemy", "edX"]

export default function CourseFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedPartners, setSelectedPartners] = useState<string[]>([])

  // Initialize filters from URL
  useEffect(() => {
    const skill = searchParams.get("skill")
    const partner = searchParams.get("partner")

    if (skill) setSelectedSkills([skill])
    if (partner) setSelectedPartners([partner])
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Handle skills
    if (selectedSkills.length === 1) {
      params.set("skill", selectedSkills[0])
    } else if (selectedSkills.length > 1) {
      // For simplicity, we'll just use the first selected skill
      params.set("skill", selectedSkills[0])
    } else {
      params.delete("skill")
    }

    // Handle partners
    if (selectedPartners.length === 1) {
      params.set("partner", selectedPartners[0])
    } else if (selectedPartners.length > 1) {
      // For simplicity, we'll just use the first selected partner
      params.set("partner", selectedPartners[0])
    } else {
      params.delete("partner")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const resetFilters = () => {
    setSelectedSkills([])
    setSelectedPartners([])

    const params = new URLSearchParams(searchParams.toString())
    params.delete("skill")
    params.delete("partner")

    router.push(`${pathname}?${params.toString()}`)
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const togglePartner = (partner: string) => {
    setSelectedPartners((prev) => (prev.includes(partner) ? prev.filter((p) => p !== partner) : [...prev, partner]))
  }

  return (
    <div className="space-y-6">
      <div className="font-medium text-lg">Filtres</div>

      <Accordion type="multiple" defaultValue={["skills", "partners"]}>
        <AccordionItem value="skills">
          <AccordionTrigger>Compétences</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {SKILLS.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => toggleSkill(skill)}
                  />
                  <Label htmlFor={`skill-${skill}`} className="text-sm">
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="partners">
          <AccordionTrigger>Partenaires</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {PARTNERS.map((partner) => (
                <div key={partner} className="flex items-center space-x-2">
                  <Checkbox
                    id={`partner-${partner}`}
                    checked={selectedPartners.includes(partner)}
                    onCheckedChange={() => togglePartner(partner)}
                  />
                  <Label htmlFor={`partner-${partner}`} className="text-sm">
                    {partner}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col space-y-2">
        <Button onClick={applyFilters}>Appliquer les filtres</Button>
        <Button variant="outline" onClick={resetFilters}>
          Réinitialiser
        </Button>
      </div>
    </div>
  )
}
