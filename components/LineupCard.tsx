"use client"

import { useState, useEffect, useRef } from "react"
import { Lineup, TAGS } from "@/types/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import {
  X,
  Timer,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  RotateCcw,
} from "lucide-react"

interface LineupCardProps {
  lineup: Lineup
  onUpdate?: (updatedLineup: Lineup) => void
}

export default function LineupCard({ lineup, onUpdate }: LineupCardProps) {
  const [open, setOpen] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  // États pour le mode édition
  const [isEditing, setIsEditing] = useState(false)
  const [currentLineup, setCurrentLineup] = useState<Lineup>({ ...lineup })
  const [editForm, setEditForm] = useState<Lineup>({ ...lineup })

  // États réels pour le rendu zoom/pan
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

  // Synchronise si la lineup change depuis l'extérieur
  useEffect(() => {
    setCurrentLineup({ ...lineup })
    setEditForm({ ...lineup })
  }, [lineup])

  // Réinitialisation propre à la fermeture/changement d'image
  useEffect(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setIsDragging(false)
    setIsEditing(false)
    setEditForm({ ...currentLineup })
  }, [fullscreenImage, currentLineup])

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
      prev === currentLineup.from ? currentLineup.to : currentLineup.from
    )
  }

  const handlePrevPhoto = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation()
    setFullscreenImage((prev) =>
      prev === currentLineup.to ? currentLineup.from : currentLineup.to
    )
  }

  // Action de sauvegarde des modifications
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentLineup(editForm)
    if (onUpdate) {
      onUpdate(editForm)
    }
    setIsEditing(false)
  }

  // Toggle la sélection d'un tag prédéfini
  const toggleTag = (tag: string) => {
    setEditForm((prev) => {
      const exists = prev.tags.includes(tag)
      if (exists) {
        return { ...prev, tags: prev.tags.filter((t) => t !== tag) }
      } else {
        return { ...prev, tags: [...prev.tags, tag] }
      }
    })
  }

  // ÉCOUTEUR CLAVIER & MOUSE MOVE (DRAG)
  useEffect(() => {
    if (!fullscreenImage) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenImage(null)
      if (e.key === "ArrowRight" && !isEditing) handleNextPhoto(e)
      if (e.key === "ArrowLeft" && !isEditing) handlePrevPhoto(e)
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
  }, [fullscreenImage, isDragging, isEditing])

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

  const handleImageClickOrMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing && fullscreenImage === currentLineup.from) {
      e.preventDefault()
      const rect = e.currentTarget.getBoundingClientRect()

      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      const percentX = Math.min(100, Math.max(0, (clickX / rect.width) * 100))
      const percentY = Math.min(100, Math.max(0, (clickY / rect.height) * 100))

      setEditForm((prev) => ({
        ...prev,
        markerX: parseFloat(percentX.toFixed(2)),
        markerY: parseFloat(percentY.toFixed(2)),
      }))
      return
    }

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
                src={currentLineup.to}
                alt={currentLineup.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </CardHeader>

            <CardContent className="p-4 pb-3">
              <h3 className="mb-2 line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-[#ff4655]">
                {currentLineup.title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {currentLineup.tags.map((tag) => (
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
              <span className="text-gray-500">Site {currentLineup.site}</span>
              <span
                className={
                  difficultyColors[
                    currentLineup.difficulty as keyof typeof difficultyColors
                  ] || "text-gray-400"
                }
              >
                {currentLineup.difficulty}
              </span>
            </CardFooter>
          </Card>
        </DialogTrigger>

        {/* MODAL : Vue Gros Plan */}
        <DialogContent className="max-h-[90vh] w-[95vw] !max-w-none overflow-y-auto rounded-2xl border-gray-800 bg-[#14171c] p-5 shadow-2xl md:w-[90vw] md:p-8 xl:w-[85vw]">
          <div className="mb-6 flex flex-col gap-4 border-b border-gray-800 pb-4 sm:flex-row sm:items-center sm:justify-between xl:mx-8">
            <DialogTitle className="text-xl font-bold tracking-wide md:text-2xl">
              {currentLineup.title}{" "}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({currentLineup.map} - Site {currentLineup.site})
              </span>
            </DialogTitle>

            <div className="flex items-center gap-2 rounded-lg border border-[#ff4655]/30 bg-[#ff4655]/10 px-3 py-1.5 text-sm font-bold tracking-wider text-[#ff4655] uppercase">
              <Timer className="h-4 w-4 stroke-[2.5]" />
              <span>Trajet : {currentLineup.travelTime}s</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:px-8">
            <div className="group/img relative flex flex-col gap-2.5">
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                1. Position de visée
              </span>
              <div
                onClick={() => setFullscreenImage(currentLineup.from)}
                className="relative aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900 shadow-lg"
              >
                <Image
                  src={currentLineup.from}
                  alt="Position de visée"
                  fill
                  className="object-cover"
                />

                {currentLineup.markerX !== undefined &&
                  currentLineup.markerY !== undefined &&
                  currentLineup.markerX !== null &&
                  currentLineup.markerY !== null && (
                    <div
                      className="absolute h-6 w-6 rounded-full border-2 border-[#ff4655] bg-transparent shadow-[0_0_6px_rgba(255,70,85,0.8)]"
                      style={{
                        left: `${currentLineup.markerX}%`,
                        top: `${currentLineup.markerY}%`,
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
                onClick={() => setFullscreenImage(currentLineup.to)}
                className="relative aspect-video w-full cursor-zoom-in overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900 shadow-lg"
              >
                <Image
                  src={currentLineup.to}
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

      {/* LIGHTBOX DE MODIFICATION & DE VISUALISATION */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm duration-200 select-none fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          {/* BOUTON FERMER */}
          <button
            className="pointer-events-auto absolute top-6 right-6 z-10010 rounded-full bg-gray-900/80 p-3 text-white transition-colors hover:bg-[#ff4655]"
            onClick={(e) => {
              e.stopPropagation()
              setFullscreenImage(null)
            }}
          >
            <X className="h-6 w-6 stroke-[2.5]" />
          </button>

          {/* ACTIONS D'ÉDITION GLOBALES */}
          <div className="pointer-events-auto absolute top-6 left-6 z-10010 flex items-center gap-2">
            {!isEditing ? (
              <button
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/90 px-4 py-2.5 text-sm font-semibold text-gray-200 transition-all hover:bg-gray-800 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
              >
                <Edit2 className="h-4 w-4 text-[#ff4655]" />
                Modifier la lineup
              </button>
            ) : (
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-500"
                  onClick={handleSave}
                >
                  <Check className="h-4 w-4" />
                  Enregistrer
                </button>
                <button
                  className="flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(false)
                    setEditForm({ ...currentLineup })
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* CHEVRON GAUCHE (Masqué pendant l'édition) */}
          {!isEditing && (
            <button
              className="pointer-events-auto absolute left-6 z-10010 rounded-full bg-gray-900/80 p-4 text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
              onClick={handlePrevPhoto}
            >
              <ChevronLeft className="h-6 w-6 stroke-3" />
            </button>
          )}

          <div
            className="flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* CONTENEUR DE L'IMAGE GÉANTE */}
            <div
              ref={containerRef}
              tabIndex={0}
              onMouseDown={handleImageClickOrMouseDown}
              className={`relative aspect-video max-h-[75vh] w-[95vw] max-w-7xl overflow-hidden rounded-lg transition-shadow focus:outline-none ${
                isEditing && fullscreenImage === currentLineup.from
                  ? "cursor-crosshair shadow-[0_0_30px_rgba(255,70,85,0.2)] ring-2 ring-[#ff4655]/50"
                  : zoom > 1
                    ? isDragging
                      ? "cursor-grabbing"
                      : "cursor-grab"
                    : "cursor-default"
              }`}
            >
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

                {/* VISUALISATION / DÉPLACEMENT DU MARKER EN TEMPS RÉEL */}
                {fullscreenImage === currentLineup.from &&
                  editForm.markerX !== undefined &&
                  editForm.markerY !== undefined &&
                  editForm.markerX !== null &&
                  editForm.markerY !== null && (
                    <div
                      className={`pointer-events-none absolute h-8 w-8 rounded-full border-2 bg-transparent shadow-[0_0_8px_rgba(255,70,85,0.9)] transition-all ${
                        isEditing
                          ? "scale-110 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.9)]"
                          : "border-[#ff4655]"
                      }`}
                      style={{
                        left: `${editForm.markerX}%`,
                        top: `${editForm.markerY}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  )}
              </div>
            </div>

            {/* BARRE DE RENDER/EDITION EN BAS */}
            <div className="pointer-events-auto w-[95vw] max-w-7xl rounded-2xl border border-gray-800 bg-gray-950/95 p-4 text-sm font-semibold text-white shadow-2xl backdrop-blur-md">
              {isEditing ? (
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-900 pb-3 text-xs">
                    {/* Édition Timer */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tracking-wider text-gray-400 uppercase">
                        ⏱️ Timer de trajet :
                      </span>
                      <input
                        type="number"
                        className="w-20 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1 text-center font-bold text-white focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655]/50 focus:outline-none"
                        value={editForm.travelTime}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            travelTime: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                      <span className="text-gray-400">secondes</span>
                    </div>

                    {fullscreenImage === currentLineup.from && (
                      <span className="text-[11px] font-medium tracking-wide text-yellow-400">
                        🎯 Cliquez n'importe où sur l'image pour repositionner
                        le marqueur
                      </span>
                    )}
                  </div>

                  {/* Sélection Système de Tags Prédéfinis (identique à la création) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] tracking-wider text-gray-400 uppercase">
                      🏷️ Tags associés :
                    </span>
                    <div className="flex max-h-[75px] flex-wrap gap-1.5 overflow-y-auto pr-2">
                      {TAGS.map((tag) => {
                        const isSelected = editForm.tags.includes(tag)
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                              isSelected
                                ? "border-[#ff4655] bg-[#ff4655]/10 text-[#ff4655] shadow-[0_0_10px_rgba(255,70,85,0.1)]"
                                : "border-gray-800/80 bg-gray-900/60 text-gray-400 hover:border-gray-700 hover:text-gray-300"
                            }`}
                          >
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-2 text-xs tracking-wider uppercase">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">
                      {fullscreenImage === currentLineup.from
                        ? "📍 1. Position de visée"
                        : "🎯 2. Point d'impact"}
                    </span>
                    <span className="font-normal text-gray-600">|</span>
                    <span className="font-bold text-[#ff4655]">
                      Trajet : {currentLineup.travelTime}s
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {currentLineup.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-gray-800 bg-gray-900 px-2 py-0.5 text-[10px] font-normal tracking-normal text-gray-400 normal-case"
                      >
                        {t}
                      </span>
                    ))}
                    {zoom > 1 && (
                      <span className="ml-2 font-normal tracking-normal text-gray-500 lowercase">
                        ({Math.round(zoom * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CHEVRON DROIT (Masqué pendant l'édition) */}
          {!isEditing && (
            <button
              className="pointer-events-auto absolute right-6 z-10010 rounded-full bg-gray-900/80 p-4 text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
              onClick={handleNextPhoto}
            >
              <ChevronRight className="h-6 w-6 stroke-3" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
