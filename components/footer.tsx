import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">EduPlateforme</h3>
            <p className="text-muted-foreground text-sm">
              Votre plateforme de cours en ligne pour développer vos compétences et avancer dans votre carrière.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">
                  Tous les cours
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-sm text-muted-foreground hover:text-primary">
                  Inscription
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Catégories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses?skill=Programming" className="text-sm text-muted-foreground hover:text-primary">
                  Programmation
                </Link>
              </li>
              <li>
                <Link href="/courses?skill=Data%20Science" className="text-sm text-muted-foreground hover:text-primary">
                  Data Science
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?skill=Cloud%20Computing"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Cloud Computing
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?skill=Project%20Management"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Gestion de Projet
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">support@eduplateforme.com</li>
              <li className="text-sm text-muted-foreground">+33 1 23 45 67 89</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} EduPlateforme. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
