"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface CourseSearchProps {
  initialSearch?: string
}

export default function CourseSearch({ initialSearch = "" }: CourseSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(window.location.search)

    if (searchQuery) {
      params.set("search", searchQuery)
    } else {
      params.delete("search")
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2">
      <Input
        type="text"
        placeholder="Rechercher des cours..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={isPending}>
        <Search className="h-4 w-4 mr-2" />
        Rechercher
      </Button>
    </form>
  )
}
