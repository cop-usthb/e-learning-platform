import { createHash } from "crypto"

// Fonction simple pour hacher un mot de passe
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

// Fonction pour vérifier un mot de passe
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hashed = hashPassword(password)
  return hashed === hashedPassword
}
