import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          Développez vos compétences avec nos cours en ligne
        </h1>
        <p className="text-xl text-muted-foreground max-w-[800px] mb-8">
          Accédez à des milliers de cours de qualité dans les domaines de la technologie, du management et bien plus
          encore. Apprenez à votre rythme et obtenez des certifications reconnues.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/courses">
            <Button size="lg">Découvrir les cours</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="lg">
              Créer un compte
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
