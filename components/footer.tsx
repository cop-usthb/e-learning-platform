export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">EduPlateforme</h3>
            <p className="text-muted-foreground">
              Plateforme de cours en ligne pour tous les niveaux. Apprenez à votre rythme avec nos cours de qualité.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-muted-foreground hover:text-foreground">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/courses" className="text-muted-foreground hover:text-foreground">
                  Cours
                </a>
              </li>
              <li>
                <a href="/profile" className="text-muted-foreground hover:text-foreground">
                  Mon profil
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-muted-foreground">
              <p>Email: contact@eduplateforme.com</p>
              <p>Téléphone: +33 1 23 45 67 89</p>
            </address>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EduPlateforme. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
