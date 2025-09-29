import "server-only"
import { neon } from "@neondatabase/serverless"

// Singleton pattern for Neon connection
let neonClient: any = null

export function getNeonClient() {
  if (!neonClient) {
    if (!process.env.NEON_DATABASE_URL) {
      throw new Error("NEON_DATABASE_URL environment variable is not set")
    }
    neonClient = neon(process.env.NEON_DATABASE_URL)
  }
  return neonClient
}

export const getSql = () => getNeonClient()

export const sql = getSql()
