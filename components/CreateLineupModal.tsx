"use client"

import { useState } from "react"
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
import { Plus, Check } from "lucide-react"

// Liste des tags Valorant prédéfinis
const PREDEFINED_TAGS = ["Post-plant", "Retake"]

export default function CreateLineupModal() {
  // État local pour suivre les tags sélectionnés dans la modal
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Fonction pour ajouter/retirer un tag au clic
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-10 gap-2 rounded-lg bg-[#ff4655] px-4 text-xs font-semibold tracking-wider text-white uppercase transition-all hover:bg-[#e03e4b]">
          <Plus className="h-4 w-4 stroke-3" />
          Ajouter une lineup
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[95vh] overflow-y-auto border-gray-800 bg-[#14171c] text-gray-200 sm:max-w-[450px]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Nouvelle Lineup
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            Remplissez les détails pour ajouter une nouvelle lineup à la
            galerie.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
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
              placeholder="Ex: Mid to A safe"
              className="border-gray-800 bg-[#0f1115] text-white focus-visible:ring-[#ff4655]"
            />
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
              type="number"
              step="0.1"
              min="0"
              placeholder="Ex: 4.5"
              className="border-gray-800 bg-[#0f1115] text-white focus-visible:ring-[#ff4655]"
            />
          </div>

          {/* SECTION CÔTE À CÔTE : Difficulté & Site */}
          <div className="flex w-full flex-col gap-4 sm:flex-row">
            {/* Dropdown pour la Difficulté */}
            <div className="flex flex-1 flex-col gap-2">
              <Label className="text-xs font-semibold text-gray-400 uppercase">
                Difficulté
              </Label>
              <Select>
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

            {/* Dropdown pour le Site */}
            <div className="flex flex-1 flex-col gap-2">
              <Label className="text-xs font-semibold text-gray-400 uppercase">
                Site
              </Label>
              <Select>
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
              {PREDEFINED_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "secondary"}
                    onClick={() => toggleTag(tag)}
                    className={`flex cursor-pointer items-center gap-1 border-none px-2.5 py-1 text-xs font-medium transition-all select-none ${
                      isSelected
                        ? "bg-[#ff4655] text-white hover:bg-[#ff4655]/90"
                        : "bg-[#1c2026] text-gray-400 hover:bg-[#22272e] hover:text-white"
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
              type="file"
              accept="image/*"
              className="cursor-pointer border-gray-800 bg-[#0f1115] text-gray-400 file:mr-2 file:rounded file:border-none file:bg-[#1c2026] file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-gray-700"
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
              type="file"
              accept="image/*"
              className="cursor-pointer border-gray-800 bg-[#0f1115] text-gray-400 file:mr-2 file:rounded file:border-none file:bg-[#1c2026] file:px-2 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-gray-700"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            className="h-10 w-full bg-[#ff4655] text-xs font-semibold tracking-wider text-white uppercase hover:bg-[#e03e4b]"
          >
            Enregistrer la lineup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
