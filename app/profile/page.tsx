"use client"

<<<<<<< HEAD
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ProfileInfo } from "@/components/profile-info"
import { UserCourses } from "@/components/user-courses"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
=======
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  BookOpen, 
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Plus,
  Check,
  Loader2
} from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  phone?: string
  location?: string
  bio?: string
  interests: string[]
  courses: Array<{
    id: string
    title: string
    progress: number
    completed: boolean
    purchaseDate: string
  }>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
>>>>>>> b4f9f29 (Adding content based local system)
  const [isLoading, setIsLoading] = useState(true)
  const [availableInterests, setAvailableInterests] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [initialInterests, setInitialInterests] = useState<string[]>([])
  const [isUpdatingInterests, setIsUpdatingInterests] = useState(false)
<<<<<<< HEAD

  // Fetch the user's current interests and available themes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user")

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/auth/signin")
            return
          }
          throw new Error("Failed to fetch user data")
        }

        const userData = await response.json()

        if (userData.success && userData.user) {
          setUser(userData.user)

          // Set initial interests from user data
          const userInterests = userData.user.interests || []
          setSelectedInterests(userInterests)
          setInitialInterests(userInterests)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchThemes = async () => {
      try {
        const response = await fetch("/api/themes")

        if (!response.ok) {
          throw new Error(`Error fetching themes: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && Array.isArray(data.themes)) {
          setAvailableInterests(data.themes)
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de charger les thèmes",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching themes:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les thèmes",
          variant: "destructive",
        })
      }
    }

    fetchUserData()
    fetchThemes()
  }, [router, toast])

  const handleInterestChange = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

=======
  const [editingInterests, setEditingInterests] = useState(false)
  const [newInterest, setNewInterest] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
      fetchThemes()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user")

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/signin")
          return
        }
        throw new Error("Failed to fetch user data")
      }

      const userData = await response.json()

      if (userData.success && userData.user) {
        setProfile(userData.user)
        const userInterests = userData.user.interests || []
        setSelectedInterests(userInterests)
        setInitialInterests(userInterests)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchThemes = async () => {
    try {
      const response = await fetch("/api/themes")

      if (!response.ok) {
        throw new Error(`Error fetching themes: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && Array.isArray(data.themes)) {
        setAvailableInterests(data.themes)
      } else {
        // Thèmes par défaut si l'API échoue
        setAvailableInterests([
          'Programming', 'Data Science', 'Machine Learning', 'Web Development',
          'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'AI',
          'Design', 'Marketing', 'Business', 'Languages'
        ])
      }
    } catch (error) {
      console.error("Error fetching themes:", error)
      // Utiliser des thèmes par défaut
      setAvailableInterests([
        'Programming', 'Data Science', 'Machine Learning', 'Web Development',
        'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'AI',
        'Design', 'Marketing', 'Business', 'Languages'
      ])
    }
  }

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const addCustomInterest = () => {
    if (newInterest.trim() && !selectedInterests.includes(newInterest.trim())) {
      setSelectedInterests(prev => [...prev, newInterest.trim()])
      setNewInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest))
  }

>>>>>>> b4f9f29 (Adding content based local system)
  const saveInterests = async () => {
    setIsUpdatingInterests(true)

    try {
<<<<<<< HEAD
      // Call API to update interests
=======
>>>>>>> b4f9f29 (Adding content based local system)
      const response = await fetch("/api/user/interests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interests: selectedInterests }),
      })

      const result = await response.json()

      if (result.success) {
        setInitialInterests([...selectedInterests])
<<<<<<< HEAD
        toast({
          title: "Succès",
          description: "Vos thèmes préférés ont été mis à jour",
=======
        setEditingInterests(false)
        if (profile) {
          setProfile({ ...profile, interests: selectedInterests })
        }
        toast({
          title: "Succès",
          description: "Vos centres d'intérêt ont été mis à jour",
>>>>>>> b4f9f29 (Adding content based local system)
        })
      } else {
        toast({
          title: "Erreur",
<<<<<<< HEAD
          description: result.message || "Impossible de mettre à jour vos thèmes",
=======
          description: result.message || "Impossible de mettre à jour vos centres d'intérêt",
>>>>>>> b4f9f29 (Adding content based local system)
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving interests:", error)
      toast({
        title: "Erreur",
<<<<<<< HEAD
        description: "Une erreur est survenue lors de la mise à jour de vos thèmes",
=======
        description: "Une erreur est survenue lors de la mise à jour",
>>>>>>> b4f9f29 (Adding content based local system)
        variant: "destructive",
      })
    } finally {
      setIsUpdatingInterests(false)
    }
  }

<<<<<<< HEAD
  if (isLoading) {
    return <div className="container mx-auto py-8">Chargement...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Mon profil</h1>

      {user && <ProfileInfo user={user} />}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Centres d'intérêt</CardTitle>
          <CardDescription>Gérez vos thèmes préférés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
            {availableInterests.length > 0 ? (
              <div className="space-y-2">
                {availableInterests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={`interest-${interest}`}
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={() => handleInterestChange(interest)}
                    />
                    <Label htmlFor={`interest-${interest}`} className="cursor-pointer">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Aucun thème disponible</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={saveInterests}
            disabled={isUpdatingInterests || JSON.stringify(selectedInterests) === JSON.stringify(initialInterests)}
          >
            {isUpdatingInterests ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </CardFooter>
      </Card>

      {user && <UserCourses userId={user.id} />}
=======
  const cancelEditingInterests = () => {
    setSelectedInterests([...initialInterests])
    setEditingInterests(false)
    setNewInterest('')
  }

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020817] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020817] flex items-center justify-center">
        <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Accès refusé
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vous devez être connecté pour accéder à votre profil.
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("/auth/signin")}
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020817]">
      <div className="container mx-auto px-4 py-8">
        {/* Header du profil */}
        <Card className="mb-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={session.user?.image || ''} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {session.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {session.user?.name || 'Utilisateur'}
                </h1>
                
                <div className="flex flex-col md:flex-row gap-4 text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Mail className="w-4 h-4" />
                    <span>{session.user?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.location && (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
                
                {profile?.bio && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs du profil */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 mr-2" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-gray-700 dark:text-gray-300">
              <BookOpen className="w-4 h-4 mr-2" />
              Mes Cours
            </TabsTrigger>
          </TabsList>

          {/* Aperçu */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Statistiques */}
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cours suivis</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile?.courses?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cours terminés</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {profile?.courses?.filter(c => c.completed).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Centres d'intérêt</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedInterests.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Centres d'intérêt */}
              <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-gray-900 dark:text-white">
                      Centres d'intérêt
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editingInterests ? cancelEditingInterests() : setEditingInterests(true)}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {editingInterests ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!editingInterests ? (
                    // Affichage des intérêts
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.length > 0 ? (
                        selectedInterests.map((interest, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                          >
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          Aucun centre d'intérêt défini. Cliquez sur modifier pour en ajouter.
                        </p>
                      )}
                    </div>
                  ) : (
                    // Édition des intérêts
                    <div className="space-y-6">
                      {/* Intérêts sélectionnés */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Vos centres d'intérêt actuels
                        </Label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedInterests.map((interest, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 pr-1"
                            >
                              {interest}
                              <button
                                onClick={() => removeInterest(interest)}
                                className="ml-2 hover:text-red-600 dark:hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Thèmes disponibles */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Thèmes disponibles
                        </Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                          {availableInterests.map((interest) => (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={interest}
                                checked={selectedInterests.includes(interest)}
                                onCheckedChange={() => handleInterestToggle(interest)}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                              />
                              <Label
                                htmlFor={interest}
                                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                              >
                                {interest}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Ajouter un intérêt personnalisé */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Ajouter un intérêt personnalisé
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nouvel intérêt..."
                            value={newInterest}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInterest(e.target.value)}
                            onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && addCustomInterest()}
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          />
                          <Button
                            onClick={addCustomInterest}
                            size="sm"
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={saveInterests}
                          disabled={isUpdatingInterests}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isUpdatingInterests ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sauvegarde...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Sauvegarder
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={cancelEditingInterests}
                          variant="outline"
                          disabled={isUpdatingInterests}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mes Cours */}
          <TabsContent value="courses" className="mt-6">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Mes Cours</CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.courses && profile.courses.length > 0 ? (
                  <div className="space-y-4">
                    {profile.courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Acheté le {new Date(course.purchaseDate).toLocaleDateString()}
                          </p>
                          {/* Barre de progression */}
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                              <span>Progression</span>
                              <span>{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Badge
                            variant={course.completed ? "default" : "secondary"}
                            className={course.completed 
                              ? "bg-green-600 text-white" 
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            }
                          >
                            {course.completed ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Terminé
                              </>
                            ) : (
                              'En cours'
                            )}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Aucun cours acheté pour le moment.
                    </p>
                    <Button
                      onClick={() => router.push('/courses')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Découvrir les cours
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
>>>>>>> b4f9f29 (Adding content based local system)
    </div>
  )
}
