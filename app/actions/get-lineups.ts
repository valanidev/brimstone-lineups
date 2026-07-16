"use server"

import { db } from "@/db"
import { lineups } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function getLineupsByMap(
  mapName: string,
  page: number = 1,
  pageSize: number = 8,
  siteName?: string | null
) {
  try {
    const skippedItems = (page - 1) * pageSize

    const conditions = [eq(lineups.map, mapName)]
    if (siteName) {
      conditions.push(eq(lineups.site, siteName))
    }

    const data = await db
      .select()
      .from(lineups)
      .where(and(...conditions))
      .limit(pageSize)
      .offset(skippedItems)

    return data
  } catch (error) {
    console.error("Erreur Drizzle lors de la récupération:", error)
    return []
  }
}
