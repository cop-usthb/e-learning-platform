export interface Course {
  _id: string
  course: string // Titre du cours (au lieu de title)
  description?: string
  price: number
  image?: string | null
  partner: string
  skills: string[]
  level: string
  duration: string
  language?: string | null
  satisfactionRate?: number
  rating?: number
  reviewcount?: string
  certificatetype?: string
  crediteligibility?: boolean
  learningOutcomes?: string[]
  chapters: Chapter[]
}

export interface Chapter {
  id: string
  title: string
  description: string
}

export interface UserCourse {
  courseId: string;
  id: number; // Nouvel attribut ajouté
  progress: number;
  purchased: boolean;
  purchasedAt: string;
  rating: number | null;
  completedChapters?: string[];
}

export interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
  courses: UserCourse[] // Tableau des cours auxquels l'utilisateur est inscrit
}
