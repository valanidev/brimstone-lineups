"use client"

import { useState } from "react"
import { createLineup } from "@/app/actions/lineup"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Check, Loader2 } from "lucide-react"
import { MAPS, TAGS } from "@/types/types"

export default function CreateLineupModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // États pour les composants Select contrôlés de shadcn
  const [mapName, setMapName] = useState<string>("")
  const [difficulty, setDifficulty] = useState<string>("")
  const [site, setSite] = useState<string>("")

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    // Injection manuelle des valeurs des listes déroulantes
    formData.append("map", mapName)
    formData.append("difficulty", difficulty)
    formData.append("site", site)

    const result = await createLineup(formData, selectedTags)

    setLoading(false)
    if (result.success) {
      setOpen(false)
      // Réinitialisation complète du formulaire
      setSelectedTags([])
      setMapName("")
      setDifficulty("")
      setSite("")
    } else {
      alert(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 gap-2 rounded-lg bg-[#ff4655] px-4 text-xs font-semibold tracking-wider text-white uppercase transition-all hover:bg-[#e03e4b]">
          <Plus className="h-4 w-4 stroke-3" />
          Ajouter une lineup
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[95vh] overflow-y-auto border-gray-800 bg-[#14171c] text-gray-200 sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Nouvelle Lineup
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            Remplissez les détails pour ajouter une nouvelle lineup à la
            galerie.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5 py-4">
          {/* Titre */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="title"
              className="text-xs font-semibold text-gray-400 uppercase"
            >
              Titre de la lineup
            </Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Ex: Mid to A safe"
              className="border-gray-800 bg-[#0f1115] text-white focus-visible:ring-[#ff4655]"
            />
          </div>

          {/* AJOUT : Dropdown pour la Map */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-gray-400 uppercase">
              Map
            </Label>
            <Select value={mapName} onValueChange={setMapName} required>
              <SelectTrigger className="w-full border-gray-800 bg-[#0f1115] text-white focus:ring-[#ff4655]">
                <SelectValue placeholder="Sélectionner une map" />
              </SelectTrigger>
              <SelectContent className="border-gray-800 bg-[#0f1115] text-gray-200">
                {MAPS.map((map) => (
                  <SelectItem
                    key={map}
                    value={map}
                    className="focus:bg-[#3a1c20] focus:text-[#ff4655]"
                  >
                    {map}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Temps de trajet (Molly) */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="travelTime"
              className="text-xs font-semibold text-gray-400 uppercase"
            >
              Temps de trajet de la Molly (en secondes)
            </Label>
            <Input
              id="travelTime"
              name="travelTime"
              type="number"
              step="0.1"
              min="0"
              required
              placeholder="Ex: 4.5"
              className="border-gray-800 bg-[#0f1115] text-white focus-visible:ring-[#ff4655]"
            />
          </div>

          {/* Côte à côte : Difficulté & Site */}
          <div className="grid w-full grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-gray-400 uppercase">
                Difficulté
              </Label>
              <Select value={difficulty} onValueChange={setDifficulty} required>
                <SelectTrigger className="w-full border-gray-800 bg-[#0f1115] text-white focus:ring-[#ff4655]">
                  <SelectValue placeholder="Difficulté" />
                </SelectTrigger>
                <SelectContent className="border-gray-800 bg-[#0f1115] text-gray-200">
                  <SelectItem
                    value="Facile"
                    className="focus:bg-green-950/40 focus:text-green-400"
                  >
                    Facile
                  </SelectItem>
                  <SelectItem
                    value="Moyenne"
                    className="focus:bg-yellow-950/40 focus:text-yellow-500"
                  >
                    Moyenne
                  </SelectItem>
                  <SelectItem
                    value="Difficile"
                    className="focus:bg-red-950/40 focus:text-red-500"
                  >
                    Difficile
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-gray-400 uppercase">
                Site
              </Label>
              <Select value={site} onValueChange={setSite} required>
                <SelectTrigger className="w-full border-gray-800 bg-[#0f1115] text-white focus:ring-[#ff4655]">
                  <SelectValue placeholder="Site" />
                </SelectTrigger>
                <SelectContent className="border-gray-800 bg-[#0f1115] text-gray-200">
                  <SelectItem
                    value="A"
                    className="focus:bg-[#3a1c20] focus:text-[#ff4655]"
                  >
                    Site A
                  </SelectItem>
                  <SelectItem
                    value="B"
                    className="focus:bg-[#3a1c20] focus:text-[#ff4655]"
                  >
                    Site B
                  </SelectItem>
                  <SelectItem
                    value="C"
                    className="focus:bg-[#3a1c20] focus:text-[#ff4655]"
                  >
                    Site C
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags Prédéfinis */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-gray-400 uppercase">
              Tags
            </Label>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-800 bg-[#0f1115] p-3">
              {TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "secondary"}
                    onClick={() => toggleTag(tag)}
                    className={`flex cursor-pointer items-center gap-1 border-none px-2.5 py-1 text-xs font-medium transition-all select-none ${
                      isSelected
                        ? "bg-[#ff4655] text-white hover:bg-[#ff4655]/90"
                        : "bg-[#1c2026] text-gray-400"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-3" />}
                    {tag}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Upload Image 1 (From) */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="img-from"
              className="text-xs font-semibold text-gray-400 uppercase"
            >
              Image : Point de départ
            </Label>
            <Input
              id="img-from"
              name="img-from"
              type="file"
              accept="image/*"
              required
              className="cursor-pointer border-gray-800 bg-[#0f1115] text-gray-400 file:mr-2 file:bg-[#1c2026] file:text-white"
            />
          </div>

          {/* Upload Image 2 (To) */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="img-to"
              className="text-xs font-semibold text-gray-400 uppercase"
            >
              Image : Point d'impact
            </Label>
            <Input
              id="img-to"
              name="img-to"
              type="file"
              accept="image/*"
              required
              className="cursor-pointer border-gray-800 bg-[#0f1115] text-gray-400 file:mr-2 file:bg-[#1c2026] file:text-white"
            />
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full bg-[#ff4655] text-xs font-semibold tracking-wider text-white uppercase hover:bg-[#e03e4b]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer la lineup"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
