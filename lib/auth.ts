import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import { createHash } from "crypto"
import { executeProfileUpdate } from "@/lib/executeScript"

function simpleHash(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

function simpleCompare(password: string, hashedPassword: string): boolean {
  return simpleHash(password) === hashedPassword
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const { db } = await connectToDatabase()
          const user = await db.collection("users").findOne({ email: credentials.email })

          if (!user) {
            return null
          }

          const isPasswordValid = simpleCompare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.JWT_SECRET,
  events: {
    async createUser() {
      // Execute profile update script when a new user is created
      try {
        console.log("New user registered, updating user profiles...")
        await executeProfileUpdate("signup")
      } catch (error) {
        console.error("Failed to update profiles after new user registration:", error)
      }
    },
  },
}
