"use client"

import { useState, useEffect, useRef } from "react"
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

  // États réels pour le rendu
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // États de déplacement (Pan)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  // Refs pour éviter les closures périmées (Stale Closures) dans les listeners window
  const stateRef = useRef({ zoom: 1, offset: { x: 0, y: 0 } })

  useEffect(() => {
    stateRef.current = { zoom, offset }
  }, [zoom, offset])

  // Réinitialisation propre à la fermeture/changement
  useEffect(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setIsDragging(false)
  }, [fullscreenImage])

  // Focus immédiat et forcé pour le fonctionnement instantané du scroll
  useEffect(() => {
    if (fullscreenImage) {
      let frameId: number
      const forceFocus = () => {
        if (containerRef.current) {
          containerRef.current.focus()
        } else {
          frameId = requestAnimationFrame(forceFocus)
        }
      }
      frameId = requestAnimationFrame(forceFocus)
      return () => cancelAnimationFrame(frameId)
    }
  }, [fullscreenImage])

  // FONCTION DE SÉCURITÉ : Limite stricte aux bords de l'image
  const clampOffset = (x: number, y: number, targetZoom: number) => {
    if (!containerRef.current || targetZoom <= 1) return { x: 0, y: 0 }

    const rect = containerRef.current.getBoundingClientRect()
    const maxX = 0
    const minX = -(targetZoom - 1) * rect.width
    const maxY = 0
    const minY = -(targetZoom - 1) * rect.height

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    }
  }

  const handleNextPhoto = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation()
    setFullscreenImage((prev) =>
      prev === lineup.from ? lineup.to : lineup.from
    )
  }

  const handlePrevPhoto = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation()
    setFullscreenImage((prev) => (prev === lineup.to ? lineup.from : lineup.to))
  }

  // ÉCOUTEUR CLAVIER & MOUSE MOVE (DRAG)
  useEffect(() => {
    if (!fullscreenImage) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenImage(null)
      if (e.key === "ArrowRight") handleNextPhoto(e)
      if (e.key === "ArrowLeft") handlePrevPhoto(e)
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || stateRef.current.zoom <= 1) return

      const rawX = e.clientX - dragStart.current.x
      const rawY = e.clientY - dragStart.current.y

      setOffset(clampOffset(rawX, rawY, stateRef.current.zoom))
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [fullscreenImage, isDragging])

  // ÉCOUTEUR DU SCROLL GLOBAL
  useEffect(() => {
    if (!fullscreenImage) return

    const handleGlobalWheel = (e: WheelEvent) => {
      if (!containerRef.current) return

      const targetElement = e.target as HTMLElement
      const isOverLightbox =
        containerRef.current.contains(targetElement) ||
        targetElement.closest(".fixed.inset-0")

      if (!isOverLightbox) return

      e.preventDefault()
      e.stopPropagation()

      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const { zoom: currentZoom, offset: currentOffset } = stateRef.current

      const zoomFactor = 1.15
      let newZoom =
        e.deltaY < 0 ? currentZoom * zoomFactor : currentZoom / zoomFactor
      newZoom = Math.max(1, Math.min(newZoom, 6))

      if (newZoom === 1) {
        setZoom(1)
        setOffset({ x: 0, y: 0 })
      } else {
        const xs = (mouseX - currentOffset.x) / currentZoom
        const ys = (mouseY - currentOffset.y) / currentZoom

        const rawX = mouseX - xs * newZoom
        const rawY = mouseY - ys * newZoom

        setZoom(newZoom)
        setOffset(clampOffset(rawX, rawY, newZoom))
      }
    }

    window.addEventListener("wheel", handleGlobalWheel, {
      passive: false,
      capture: true,
    })
    return () => {
      window.removeEventListener("wheel", handleGlobalWheel, { capture: true })
    }
  }, [fullscreenImage])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

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
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#14171c] from-15% to-transparent opacity-50" />
              <Image
                src={lineup.to}
                alt={lineup.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
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

            <div className="flex items-center gap-2 rounded-lg border border-[#ff4655]/30 bg-[#ff4655]/10 px-3 py-1.5 text-sm font-bold tracking-wider text-[#ff4655] uppercase">
              <Timer className="h-4 w-4 stroke-[2.5]" />
              <span>Trajet : {lineup.travelTime}s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:px-8">
            <div className="group/img relative flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                1. Position de visée
              </span>
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

                {lineup.markerX !== undefined &&
                  lineup.markerY !== undefined &&
                  lineup.markerX !== null &&
                  lineup.markerY !== null && (
                    <div
                      className="absolute h-6 w-6 rounded-full border-2 border-[#ff4655] bg-transparent shadow-[0_0_6px_rgba(255,70,85,0.8)]"
                      style={{
                        left: `${lineup.markerX}%`,
                        top: `${lineup.markerY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}

                <div className="absolute top-3 left-3 z-20 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-gray-300 uppercase opacity-0 transition-opacity duration-200 group-hover/img:opacity-100">
                  Cliquez pour agrandir
                </div>
              </div>
            </div>

            <div className="group/img relative flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                2. Point d'impact
              </span>
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

      {/* LIGHTBOX */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm duration-200 select-none fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            className="pointer-events-auto absolute top-6 right-6 z-10010 rounded-full bg-gray-900/80 p-3 text-white transition-colors hover:bg-[#ff4655]"
            onClick={(e) => {
              e.stopPropagation()
              setFullscreenImage(null)
            }}
          >
            <X className="h-6 w-6 stroke-[2.5]" />
          </button>

          <button
            className="pointer-events-auto absolute left-6 z-10010 rounded-full bg-gray-900/80 p-4 text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
            onClick={handlePrevPhoto}
          >
            <ChevronLeft className="h-6 w-6 stroke-3" />
          </button>

          <div
            className="flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* TAILLE AUGMENTÉE ICI : max-h-[88vh] w-[95vw] max-w-7xl */}
            <div
              ref={containerRef}
              tabIndex={0}
              onMouseDown={handleMouseDown}
              className={`relative aspect-video max-h-[88vh] w-[95vw] max-w-7xl overflow-hidden rounded-lg focus:outline-none ${
                zoom > 1
                  ? isDragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "cursor-default"
              }`}
            >
              {/* Espace rajouté et transition ajustée */}
              <div
                className="relative h-full w-full origin-top-left transition-transform duration-200 ease-out will-change-transform"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                }}
              >
                <Image
                  src={fullscreenImage}
                  alt="Plein écran"
                  fill
                  className="pointer-events-none object-cover"
                  priority
                  unoptimized
                />

                {/* OUTLINE ROUGE */}
                {fullscreenImage === lineup.from &&
                  lineup.markerX !== undefined &&
                  lineup.markerY !== undefined &&
                  lineup.markerX !== null &&
                  lineup.markerY !== null && (
                    <div
                      className="absolute h-8 w-8 rounded-full border-2 border-[#ff4655] bg-transparent shadow-[0_0_8px_rgba(255,70,85,0.9)]"
                      style={{
                        left: `${lineup.markerX}%`,
                        top: `${lineup.markerY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
              </div>
            </div>

            <div className="rounded-full border border-gray-800 bg-gray-950/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-md">
              {fullscreenImage === lineup.from
                ? "📍 1. Position de visée"
                : "🎯 2. Point d'impact"}
              {zoom > 1 && (
                <span className="ml-2 text-gray-400">
                  ({Math.round(zoom * 100)}%)
                </span>
              )}
            </div>
          </div>

          <button
            className="pointer-events-auto absolute right-6 z-10010 rounded-full bg-gray-900/80 p-4 text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
            onClick={handleNextPhoto}
          >
            <ChevronRight className="h-6 w-6 stroke-3" />
          </button>
        </div>
      )}
    </>
  )
}
