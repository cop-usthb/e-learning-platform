"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MigrateCourses() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleMigration = async () => {
    if (!session?.user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir migrer les données des cours utilisateurs ? Cette opération ajoutera un identifiant numérique à tous les cours achetés.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/migrate-user-courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Succès",
          description: data.message,
        });
        router.refresh();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la migration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Migration des cours utilisateurs</CardTitle>
            <CardDescription>Vous devez être connecté pour accéder à cette page</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/auth/signin")}>Se connecter</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Migration des cours utilisateurs</CardTitle>
          <CardDescription>
            Cette opération ajoutera un attribut "id" à chaque cours acheté par les utilisateurs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            La migration mettra à jour la structure de données des cours utilisateurs 
            en ajoutant un identifiant numérique unique pour chaque cours acheté.
          </p>
          <p className="text-muted-foreground text-sm">
            Note: Cette opération peut prendre du temps si vous avez de nombreux utilisateurs.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleMigration} disabled={loading}>
            {loading ? "Migration en cours..." : "Lancer la migration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}