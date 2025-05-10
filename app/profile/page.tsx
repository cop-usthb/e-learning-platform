import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUserPurchasedCourses } from "@/lib/user"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserProfileForm from "@/components/user-profile-form"
import UserCoursesList from "@/components/user-courses-list"

// Improved serialization function
function serializeData(data: any): any {
  if (data === null || data === undefined) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(serializeData)
  }

  if (data instanceof Date) {
    return data.toISOString()
  }

  if (typeof data === "object") {
    // Handle MongoDB ObjectId or any object with toString method
    if (data._id) {
      if (typeof data._id === "object" && data._id !== null && typeof data._id.toString === "function") {
        data = { ...data, _id: data._id.toString() }
      }
    }

    // Handle other object properties
    const serialized: any = {}
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeData(value)
    }
    return serialized
  }

  return data
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  let purchasedCourses = await getUserPurchasedCourses(session.user.id)

  // Filtrer explicitement pour exclure le cours problématique s'il n'a pas de date d'achat
  purchasedCourses = purchasedCourses.filter((course) => {
    // Vérifier si c'est le cours "Reinforcement Learning"
    const isReinforcementLearningCourse =
      course.course && typeof course.course === "string" && course.course.includes("Reinforcement Learning")

    // Si c'est le cours problématique, vérifier strictement la date d'achat
    if (isReinforcementLearningCourse) {
      const hasValidPurchaseDate =
        course.purchaseDate !== null && course.purchaseDate !== undefined && course.purchaseDate !== ""

      console.log(
        `Reinforcement Learning course found in profile page. Has valid purchase date: ${hasValidPurchaseDate}`,
      )

      return hasValidPurchaseDate
    }

    // Pour les autres cours, vérifier simplement que la date d'achat existe
    return course.purchaseDate !== null && course.purchaseDate !== undefined
  })

  // Ensure all courses have string IDs before passing to client components
  const serializedCourses = serializeData(purchasedCourses)

  // Log the serialized courses for debugging
  console.log(
    "Serialized courses:",
    JSON.stringify(
      serializedCourses.map((c: any) => ({
        id: c._id,
        title: c.course,
        hasPurchaseDate: !!c.purchaseDate,
      })),
      null,
      2,
    ),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

      <Tabs defaultValue="courses">
        <TabsList className="mb-8">
          <TabsTrigger value="courses">Mes cours</TabsTrigger>
          <TabsTrigger value="profile">Informations personnelles</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <UserCoursesList courses={serializedCourses} />
        </TabsContent>

        <TabsContent value="profile">
          <UserProfileForm user={session.user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
