"use client"

import { useState } from "react"
import { createLineup } from "@/app/actions/lineup"
import { Button } from "@/components/ui/button"
import Image from "next/image"
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
import imageCompression from "browser-image-compression" // AJOUT : Importation du compresseur

export default function CreateLineupModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewToUrl, setPreviewToUrl] = useState<string | null>(null)

  // États pour les composants Select contrôlés de shadcn
  const [mapName, setMapName] = useState<string>("")
  const [difficulty, setDifficulty] = useState<string>("")
  const [site, setSite] = useState<string>("")

  // Configuration globale pour la compression d'image sans perte visuelle
  const compressionOptions = {
    maxSizeMB: 0.6, // Réduit le fichier cible sous les 600 Ko (idéal pour la vitesse)
    maxWidthOrHeight: 1920, // Redimensionne la 4K inutile vers du 1080p
    useWebWorker: true, // Exécute en arrière-plan pour éviter de figer l'UI
    fileType: "image/webp", // Convertit en WebP (excellent ratio poids/qualité)
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMarker({ x, y })
  }

  // AJOUT : Fonction générique pour intercepter le fichier, le compresser et mettre à jour l'input du DOM
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // 1. Compression à la volée (renvoie un Blob)
      const compressedBlob = await imageCompression(file, compressionOptions)

      // 2. CONVERSION : Convertir le Blob en un objet File valide pour le navigateur
      const compressedFile = new File([compressedBlob], file.name, {
        type: compressedBlob.type,
        lastModified: Date.now(),
      })

      // 3. Remplacement du fichier brut par le fichier compressé dans l'événement original
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(compressedFile) // Plus d'erreur ici !
      e.target.files = dataTransfer.files

      // 4. Mise à jour de l'aperçu visuel local
      setPreview(URL.createObjectURL(compressedFile))
    } catch (error) {
      console.error("Erreur lors de la compression de l'image :", error)
      // Fallback si la compression échoue : on prend l'image d'origine
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("map", mapName)
    formData.append("difficulty", difficulty)
    formData.append("site", site)
    formData.append("markerX", marker?.x.toString() || "")
    formData.append("markerY", marker?.y.toString() || "")

    const result = await createLineup(formData, selectedTags)

    setLoading(false)
    if (result.success) {
      setOpen(false)
      setSelectedTags([])
      setMapName("")
      setDifficulty("")
      setSite("")
      setMarker(null)
      setPreviewUrl(null)
      setPreviewToUrl(null)
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

          {/* Map */}
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

          {/* Temps de trajet */}
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

          {/* Difficulté & Site */}
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

          {/* Tags */}
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
            <Label className="text-xs font-semibold text-gray-400 uppercase">
              Image : Point de départ (cliquez pour placer le point)
            </Label>
            <Input
              type="file"
              accept="image/*"
              name="img-from"
              required
              className="cursor-pointer border-gray-800 bg-[#0f1115] text-gray-400 file:mr-2 file:bg-[#1c2026] file:text-white"
              onChange={(e) => handleFileChange(e, setPreviewUrl)} // MODIFIÉ
            />
            {previewUrl && (
              <div
                className="relative mt-2 aspect-video w-full cursor-crosshair overflow-hidden rounded-lg border border-gray-700"
                onClick={handleImageClick}
              >
                <Image
                  src={previewUrl}
                  alt="Preview Départ"
                  fill
                  className="pointer-events-none object-cover"
                />
                {marker && (
                  <div
                    className="absolute h-6 w-6 animate-in rounded-full border-2 border-[#ff4655] bg-transparent shadow-[0_0_4px_rgba(255,70,85,0.6)] zoom-in"
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                )}
              </div>
            )}
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
              onChange={(e) => handleFileChange(e, setPreviewToUrl)} // MODIFIÉ
            />
            {previewToUrl && (
              <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg border border-gray-700">
                <Image
                  src={previewToUrl}
                  alt="Preview Arrivée"
                  fill
                  className="object-cover"
                />
              </div>
            )}
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
