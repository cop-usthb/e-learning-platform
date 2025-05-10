import { Metadata } from "next"
import SignUpFormMultiStep from "@/components/signup-form-multi-step"

export const metadata: Metadata = {
  title: "S'inscrire - EduPlateforme",
  description: "Créez un compte pour accéder à nos cours en ligne",
}

export default function SignUpPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <SignUpFormMultiStep />
      </div>
    </div>
  )
}