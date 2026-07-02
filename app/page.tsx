"use client"

import { useState } from "react"
import LineupCard from "@/components/LineupCard"
import { Lineup, MapName, SiteFilter } from "@/types/types"
import Sidebar from "@/components/Sidebar"
import SiteFilterToggle from "@/components/SiteFilterToggle"
import CreateLineupModal from "@/components/CreateLineupModal"

// Mock de données (inchangé)
const MOCK_LINEUPS: Lineup[] = [
  {
    id: "1",
    title: "Sky Smoke Short",
    map: "Ascent",
    site: "B",
    type: "Attaque",
    difficulty: "Facile",
    tags: ["Smoke", "Short"],
    from: "/images/example.png",
    to: "/images/example.png",
    travelTime: 7,
  },
  {
    id: "2",
    title: "B Site Default Molotov",
    map: "Ascent",
    site: "B",
    type: "Attaque",
    difficulty: "Moyenne",
    tags: ["Molotov", "Default"],
    from: "/images/example.png",
    to: "/images/example.png",
    travelTime: 8.5,
  },
  {
    id: "3",
    title: "Lotus C Main Smoke",
    map: "Lotus",
    site: "C",
    type: "Attaque",
    difficulty: "Difficile",
    tags: ["Smoke", "Main"],
    from: "/images/example.png",
    to: "/images/example.png",
    travelTime: 7,
  },
]

export default function LineupsGallery() {
  const [selectedMap, setSelectedMap] = useState<MapName>("Ascent")
  const [selectedSite, setSelectedSite] = useState<SiteFilter>("all")

  const lineupsByMap = MOCK_LINEUPS.filter(
    (lineup) => lineup.map === selectedMap
  )

  const availableSitesOnMap = Array.from(
    new Set(lineupsByMap.map((lineup) => lineup.site))
  )

  const filteredLineups = lineupsByMap.filter((lineup) => {
    if (selectedSite === "all") return true
    return lineup.site === selectedSite
  })

  return (
    // CORRECTION : Remplacement de min-h-screen par h-screen, ajout de w-screen et overflow-hidden
    // Cela bloque la fenêtre à la taille exacte du moniteur pour empêcher la scrollbar globale
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0f1115] font-sans text-gray-200">
      {/* TOP HEADER GLOBAL */}
      {/* CORRECTION : Remplacement de sticky par un h-16 strict couplé à un shrink-0 pour pas qu'il se déforme */}
      <nav className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-[#14171c] px-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rotate-45 bg-[#ff4655]" />{" "}
          <span className="text-sm font-bold tracking-widest text-white uppercase">
            Brimstone Lineups
          </span>
        </div>

        {/* Intégration de la Modal de création */}
        <CreateLineupModal />
      </nav>

      {/* CONTENU PRINCIPAL (Sidebar + Galerie) */}
      {/* CORRECTION : overflow-hidden ici pour forcer le layout à se diviser proprement sans déborder */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedMap={selectedMap}
          onSelectMap={(map) => {
            setSelectedMap(map)
            setSelectedSite("all")
          }}
        />

        {/* CORRECTION : C'est ce conteneur (la galerie seule) qui hérite du scroll vertical autonome */}
        <main className="flex-1 overflow-y-auto p-8">
          <header className="mb-8 flex flex-col gap-4 border-b border-gray-800/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
                {selectedMap}
              </h1>
              <p className="text-sm text-gray-400">
                Affichage des lineups disponibles pour la carte {selectedMap}.
              </p>
            </div>

            <SiteFilterToggle
              selectedSite={selectedSite}
              onSiteChange={setSelectedSite}
              availableSitesOnMap={availableSitesOnMap}
              hasLineups={lineupsByMap.length > 0}
            />
          </header>

          {/* Grille des résultats */}
          {filteredLineups.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLineups.map((lineup) => (
                <LineupCard key={lineup.id} lineup={lineup} />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-[#14171c]/30">
              <p className="text-sm text-gray-500">
                Aucune lineup enregistrée pour {selectedMap}.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
