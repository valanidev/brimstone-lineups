"use client"

import { useState, useEffect } from "react"
import LineupCard from "@/components/LineupCard"
import { Lineup, MapName, SiteFilter } from "@/types/types"
import Sidebar from "@/components/Sidebar"
import SiteFilterToggle from "@/components/SiteFilterToggle"
import CreateLineupModal from "@/components/CreateLineupModal"
import { getCachedLineupsByMap } from "@/app/actions/get-lineups" // Import de la fonction de cache

export default function LineupsGallery() {
  const [selectedMap, setSelectedMap] = useState<MapName>("Ascent")
  const [selectedSite, setSelectedSite] = useState<SiteFilter>("all")

  // État local pour stocker les vraies lineups récupérées de la base de données
  const [dbLineups, setDbLineups] = useState<Lineup[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fetch des données à chaque fois que la map change
  useEffect(() => {
    async function loadLineups() {
      setIsLoading(true)
      const data = await getCachedLineupsByMap(selectedMap)

      // Adaptation légère des types si nécessaire (ex: forcer le cast en Lineup)
      setDbLineups(data as unknown as Lineup[])
      setIsLoading(false)
    }

    loadLineups()
  }, [selectedMap])

  // Détermination dynamique des sites disponibles d'après la base de données
  const availableSitesOnMap = Array.from(
    new Set(dbLineups.map((lineup) => lineup.site))
  )

  // Filtrage local (instantané pour l'utilisateur) sur le site sélectionné
  const filteredLineups = dbLineups.filter((lineup) => {
    if (selectedSite === "all") return true
    return lineup.site === selectedSite
  })

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0f1115] font-sans text-gray-200">
      {/* TOP HEADER GLOBAL */}
      <nav className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-[#14171c] px-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rotate-45 bg-[#ff4655]" />
          <span className="text-sm font-bold tracking-widest text-white uppercase">
            Brimstone Lineups
          </span>
        </div>

        {/* Intégration de la Modal de création */}
        <CreateLineupModal />
      </nav>

      {/* CONTENU PRINCIPAL (Sidebar + Galerie) */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedMap={selectedMap}
          onSelectMap={(map) => {
            setSelectedMap(map)
            setSelectedSite("all") // Reset le filtre du site quand la map change
          }}
        />

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
              hasLineups={dbLineups.length > 0}
            />
          </header>

          {/* Grille des résultats avec gestion du chargement */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff4655] border-t-transparent"></div>
            </div>
          ) : filteredLineups.length > 0 ? (
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
