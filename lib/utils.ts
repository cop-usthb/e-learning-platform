import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

/**
 * Combines class names using clsx and twMerge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Simple hashing function for passwords
 * Note: For production, use a proper password hashing library like bcrypt
 */
export function simpleHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}
