export const MAPS = [
  "Abyss",
  "Ascent",
  "Breeze",
  "Bind",
  "Corrode",
  "Fracture",
  "Haven",
  "Icebox",
  "Lotus",
  "Pearl",
  "Split",
  "Sunset",
  "Summit",
] as const

export const TAGS = ["Post-plant", "Retake", "Attack", "Defense"] as const

export type MapName = (typeof MAPS)[number]
export type SiteFilter = "A" | "B" | "C" | "all"

export interface Lineup {
  id: string
  title: string
  map: MapName
  site: "A" | "B" | "C"
  difficulty: "Facile" | "Moyenne" | "Difficile"
  tags: string[]
  from: string
  to: string
  markerX: number
  markerY: number
  travelTime: number
}
