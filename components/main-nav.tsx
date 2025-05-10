"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const { status } = useSession()
  const isAuthenticated = status === "authenticated"

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Accueil
      </Link>
      <Link
        href="/courses"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/courses" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Tous les cours
      </Link>
      
      {/* Lien vers les cours recommandés - visible uniquement pour les utilisateurs connectés */}
      {isAuthenticated && (
        <Link
          href="/recommendations"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === "/recommendations" 
              ? "text-primary" 
              : "text-muted-foreground",
            "flex items-center"
          )}
        >
          Recommandés
          <span className="ml-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
            Perso
          </span>
        </Link>
      )}
      
      <Link
        href="/about"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/about" ? "text-primary" : "text-muted-foreground"
        )}
      >
        À propos
      </Link>
      
      {/* Vous pouvez ajouter d'autres liens de navigation ici */}
    </nav>
  )
}