"use server"

import { db } from "@/db"
import { lineups } from "@/db/schema"
import { revalidatePath } from "next/cache"

// Utilitaire pour transformer le fichier uploadé en chaîne Base64
async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  return `data:${file.type};base64,${buffer.toString("base64")}`
}

export async function createLineup(formData: FormData, selectedTags: string[]) {
  try {
    const title = formData.get("title") as string
    const map = formData.get("map") as string
    const travelTime = parseFloat(formData.get("travelTime") as string)
    const site = formData.get("site") as string
    const difficulty = formData.get("difficulty") as string
    const imgFrom = formData.get("img-from") as File
    const imgTo = formData.get("img-to") as File

    const markerXRaw = formData.get("markerX")
    const markerYRaw = formData.get("markerY")
    const markerX = markerXRaw ? parseFloat(markerXRaw as string) : null
    const markerY = markerYRaw ? parseFloat(markerYRaw as string) : null

    if (
      !title ||
      !map ||
      !site ||
      !difficulty ||
      !imgFrom ||
      !imgTo ||
      !markerX ||
      !markerY
    ) {
      throw new Error("Champs obligatoires manquants.")
    }

    // Conversion parallèle des deux images en Base64
    const [fromBase64, toBase64] = await Promise.all([
      fileToBase64(imgFrom),
      fileToBase64(imgTo),
    ])

    // Insertion Drizzle (l'UUID est géré tout seul en BDD via la clause default)
    const [newLineup] = await db
      .insert(lineups)
      .values({
        title,
        map,
        site,
        difficulty,
        tags: selectedTags,
        from: fromBase64,
        to: toBase64,
        travelTime: isNaN(travelTime) ? 0 : travelTime,
        markerX,
        markerY,
      })
      .returning()

    revalidatePath("/")
    return { success: true, lineup: newLineup }
  } catch (error) {
    console.error("Erreur lors de l'insertion Drizzle :", error)
    return { success: false, error: "Impossible de sauvegarder la lineup." }
  }
}

// export async function deleteLineup(id: string) {
//   try {
//     // Suppression de la lineup correspondant à l'ID
//     await db.delete(lineups).where(eq(lineups.id, id))

//     // Force la mise à jour de la page pour refléter la suppression immédiatement
//     revalidatePath("/")

//     return { success: true }
//   } catch (error) {
//     console.error("Erreur lors de la suppression :", error)
//     return { success: false, error: "Impossible de supprimer la lineup." }
//   }
// }
