"use server"

import { db } from "@/db"
import { lineups } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getCachedLineupsByMap(mapName: string) {
  try {
    // Fetch direct depuis Postgres
    const data = await db.select().from(lineups).where(eq(lineups.map, mapName))

    return data
  } catch (error) {
    console.error("Erreur Drizzle lors de la récupération:", error)
    return []
  }
}
