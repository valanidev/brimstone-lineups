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
import { Maximize2, X, Timer } from "lucide-react"

interface LineupCardProps {
  lineup: Lineup
}

export default function LineupCard({ lineup }: LineupCardProps) {
  const [open, setOpen] = useState(false) // Gestion de l'ouverture locale automatique
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  const difficultyColors = {
    Facile: "text-green-400",
    Moyenne: "text-yellow-500",
    Difficile: "text-red-500",
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {/* Le DialogTrigger intercepte le clic et ouvre la modal automatiquement */}
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
              <span className={difficultyColors[lineup.difficulty]}>
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

            {/* Affichage du temps de trajet en secondes */}
            <div className="flex items-center gap-2 self-start rounded-lg border border-[#ff4655]/30 bg-[#ff4655]/10 px-3 py-1.5 text-sm font-bold tracking-wider text-[#ff4655] uppercase sm:self-auto">
              <Timer className="h-4 w-4 stroke-[2.5]" />
              <span>Trajet : {lineup.travelTime}s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:px-8">
            {/* Image From */}
            <div className="group/img relative flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                1. Position de visée
              </span>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900 shadow-lg">
                <Image
                  src={lineup.from}
                  alt="Position de visée"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setFullscreenImage(lineup.from)}
                  className="absolute right-4 bottom-4 z-20 rounded-lg bg-black/80 p-2.5 text-white shadow-md transition-all duration-200 group-hover/img:opacity-100 hover:bg-[#ff4655] lg:opacity-0"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Image To */}
            <div className="group/img relative flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                2. Point d'impact
              </span>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900 shadow-lg">
                <Image
                  src={lineup.to}
                  alt="Point d'impact"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setFullscreenImage(lineup.to)}
                  className="absolute right-4 bottom-4 z-20 rounded-lg bg-black/80 p-2.5 text-white shadow-md transition-all duration-200 group-hover/img:opacity-100 hover:bg-[#ff4655] lg:opacity-0"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LIGHTBOX MAP */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/95 duration-200 fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            className="absolute top-4 right-4 z-[110] rounded-full bg-gray-900/80 p-3 text-white transition-colors hover:bg-[#ff4655]"
            onClick={() => setFullscreenImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative h-[92vh] w-[92vw]">
            <Image
              src={fullscreenImage}
              alt="Plein écran"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  )
}
