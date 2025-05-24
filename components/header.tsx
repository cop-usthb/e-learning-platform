"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-bold">
            EduPlateforme
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className={`${
                isActive("/") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Accueil
            </Link>
            <Link
              href="/courses"
              className={`${
                isActive("/courses") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cours
            </Link>
            {session?.user && (
              <Link
                href="/profile"
                className={`${
                  isActive("/profile") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mon profil
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {session?.user ? (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline text-sm">{session.user.name}</span>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                Déconnexion
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth/signin">
                <Button variant="outline">Connexion</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Inscription</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
