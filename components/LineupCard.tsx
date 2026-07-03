"use client"

import { useState, useEffect } from "react"
import { Lineup } from "@/types/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import { X, Timer, ChevronLeft, ChevronRight } from "lucide-react"

interface LineupCardProps {
  lineup: Lineup
}

export default function LineupCard({ lineup }: LineupCardProps) {
  const [open, setOpen] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  // Liste ordonnée des photos propres à cette lineup
  const photos = [lineup.from, lineup.to]

  // Fonctions de navigation gauche/droite entre ces deux photos
  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setFullscreenImage((prev) =>
      prev === lineup.from ? lineup.to : lineup.from
    )
  }

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setFullscreenImage((prev) => (prev === lineup.to ? lineup.from : lineup.to))
  }

  // Écouteur clavier pour naviguer à la volée avec les touches directionnelles
  useEffect(() => {
    if (!fullscreenImage) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenImage(null)
      if (e.key === "ArrowRight") handleNextPhoto()
      if (e.key === "ArrowLeft") handlePrevPhoto()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [fullscreenImage])

  const difficultyColors = {
    Facile: "text-green-400",
    Moyenne: "text-yellow-500",
    Difficile: "text-red-500",
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Card className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border-gray-800 bg-[#14171c] p-0 transition-all hover:border-gray-700 hover:shadow-[0_0_20px_rgba(255,70,85,0.1)]">
            <CardHeader className="relative aspect-video w-full space-y-0 overflow-hidden bg-gray-900 p-0">
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#14171c] from-15% to-transparent opacity-90" />
              <Image
                src={lineup.to}
                alt={lineup.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </CardHeader>

            <CardContent className="p-4 pb-3">
              <h3 className="mb-2 line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-[#ff4655]">
                {lineup.title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {lineup.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="border-none bg-[#1c2026] px-2 py-0.5 text-[11px] font-normal text-gray-400"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-gray-800 bg-[#14171c] p-4 pt-3 text-xs font-medium">
              <span className="text-gray-500">Site {lineup.site}</span>
              <span
                className={
                  difficultyColors[
                    lineup.difficulty as keyof typeof difficultyColors
                  ] || "text-gray-400"
                }
              >
                {lineup.difficulty}
              </span>
            </CardFooter>
          </Card>
        </DialogTrigger>

        {/* MODAL : Vue Gros Plan */}
        <DialogContent className="max-h-[90vh] w-[95vw] !max-w-none overflow-y-auto rounded-2xl border-gray-800 bg-[#14171c] p-5 shadow-2xl md:w-[90vw] md:p-8 xl:w-[85vw]">
          <div className="mb-6 flex flex-col gap-4 border-b border-gray-800 pb-4 sm:flex-row sm:items-center sm:justify-between xl:mx-8">
            <DialogTitle className="text-xl font-bold tracking-wide md:text-2xl">
              {lineup.title}{" "}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({lineup.map} - Site {lineup.site})
              </span>
            </DialogTitle>

            <div className="flex items-center gap-2 self-start rounded-lg border border-[#ff4655]/30 bg-[#ff4655]/10 px-3 py-1.5 text-sm font-bold tracking-wider text-[#ff4655] uppercase sm:self-auto">
              <Timer className="h-4 w-4 stroke-[2.5]" />
              <span>Trajet : {lineup.travelTime}s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:px-8">
            {/* Image From (Position de visée) */}
            <div className="group/img relative flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                1. Position de visée
              </span>
              {/* MODIFICATION : Clic n'importe où sur l'image pour l'ouvrir */}
              <div
                onClick={() => setFullscreenImage(lineup.from)}
                className="relative aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900 shadow-lg"
              >
                <Image
                  src={lineup.from}
                  alt="Position de visée"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 z-20 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-gray-300 uppercase opacity-0 transition-opacity duration-200 group-hover/img:opacity-100">
                  Cliquez pour agrandir
                </div>
              </div>
            </div>

            {/* Image To (Point d'impact) */}
            <div className="group/img relative flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                2. Point d'impact
              </span>
              {/* MODIFICATION : Clic n'importe où sur l'image pour l'ouvrir */}
              <div
                onClick={() => setFullscreenImage(lineup.to)}
                className="relative aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900 shadow-lg"
              >
                <Image
                  src={lineup.to}
                  alt="Point d'impact"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 z-20 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-gray-300 uppercase opacity-0 transition-opacity duration-200 group-hover/img:opacity-100">
                  Cliquez pour agrandir
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LIGHTBOX ULTRA-RESPONSIVE (Faux plein écran) */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[9999] flex animate-in items-center justify-center bg-black/95 backdrop-blur-sm duration-200 fade-in"
          onClick={() => setFullscreenImage(null)} // Clique en dehors ferme la visionneuse
        >
          {/* BOUTON FERMER (La croix) */}
          <button
            className="absolute top-6 right-6 z-[10010] rounded-full bg-gray-900/80 p-3 text-white transition-colors hover:bg-[#ff4655]"
            onClick={() => setFullscreenImage(null)}
          >
            <X className="h-6 w-6 stroke-[2.5]" />
          </button>

          {/* BOUTON PRÉCÉDENT (Flèche Gauche) */}
          <button
            className="absolute left-6 z-[10010] rounded-full bg-gray-900/80 p-4 text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
            onClick={handlePrevPhoto}
          >
            <ChevronLeft className="h-6 w-6 stroke-[3]" />
          </button>

          {/* ZONE CENTRALE DE L'IMAGE */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[85vh] w-[90vw] max-w-6xl"
          >
            <Image
              src={fullscreenImage}
              alt="Plein écran"
              fill
              className="object-contain" // Contain évite d'étirer ou couper l'image
              priority
              unoptimized
            />

            {/* Étiquette d'étape dynamique */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-gray-800 bg-gray-950/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md">
              {fullscreenImage === lineup.from
                ? "📍 1. Position de visée"
                : "🎯 2. Point d'impact"}
            </div>
          </div>

          {/* BOUTON SUIVANT (Flèche Droite) */}
          <button
            className="absolute right-6 z-[10010] rounded-full bg-gray-900/80 p-4 text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
            onClick={handleNextPhoto}
          >
            <ChevronRight className="h-6 w-6 stroke-[3]" />
          </button>
        </div>
      )}
    </>
  )
}
