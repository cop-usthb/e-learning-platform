import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Développez vos compétences avec nos cours en ligne
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Accédez à des centaines de cours de qualité dans divers domaines. Apprenez à votre rythme et suivez votre
              progression.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/courses">
                <Button size="lg">Découvrir les cours</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline">
                  S'inscrire gratuitement
                </Button>
              </Link>
            </div>
          </div>
          <div className="mx-auto lg:ml-auto">
            <div className="aspect-video overflow-hidden rounded-xl bg-muted flex items-center justify-center">
              <img
                src="/placeholder.svg?height=500&width=800"
                alt="Plateforme de cours en ligne"
                width={800}
                height={500}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
