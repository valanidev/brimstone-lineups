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

export type MapName = (typeof MAPS)[number]
export type SiteFilter = "A" | "B" | "C" | "all"

export interface Lineup {
  id: string
  title: string
  map: MapName
  site: "A" | "B" | "C"
  type: "Attaque" | "Défense"
  difficulty: "Facile" | "Moyenne" | "Difficile"
  tags: string[]
  from: string
  to: string
  travelTime: number
}
