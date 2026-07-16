"use client"

import { useState, useEffect, useRef } from "react"
import LineupCard from "@/components/LineupCard"
import { Lineup, MapName, SiteFilter } from "@/types/types"
import Sidebar from "@/components/Sidebar"
import SiteFilterToggle from "@/components/SiteFilterToggle"
import CreateLineupModal from "@/components/CreateLineupModal"
import { getLineupsByMap } from "@/app/actions/get-lineups" // On passe sur la fonction paginée
import { Loader2 } from "lucide-react"

export default function LineupsGallery() {
  const [selectedMap, setSelectedMap] = useState<MapName>("Ascent")
  const [selectedSite, setSelectedSite] = useState<SiteFilter>("all")

  // États pour la pagination et le scroll infini
  const [dbLineups, setDbLineups] = useState<Lineup[]>([])
  const [page, setPage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)

  // Cible de l'observateur pour détecter le bas de page
  const observerTarget = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 4

  // 1. EFFET : Réinitialisation et Chargement Initial (quand la Map ou le Filtre change)
  useEffect(() => {
    async function loadInitialLineups() {
      setIsLoading(true)
      setPage(1)
      setHasMore(true)

      // Appel de l'action serveur avec les filtres
      const data = await getLineupsByMap(
        selectedMap,
        1,
        PAGE_SIZE,
        selectedSite === "all" ? null : selectedSite
      )

      setDbLineups(data as unknown as Lineup[])

      if (data.length < PAGE_SIZE) {
        setHasMore(false)
      }
      setIsLoading(false)
    }

    loadInitialLineups()
  }, [selectedMap, selectedSite])

  // 2. EFFET : Intersection Observer pour détecter le scroll et charger la suite
  useEffect(() => {
    const target = observerTarget.current
    if (!target || !hasMore || isLoading || isFetchingMore) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isFetchingMore && hasMore) {
          setIsFetchingMore(true)
          const nextPage = page + 1

          const newData = await getLineupsByMap(
            selectedMap,
            nextPage,
            PAGE_SIZE,
            selectedSite === "all" ? null : selectedSite
          )

          if (newData.length === 0) {
            setHasMore(false)
          } else {
            setDbLineups((prev) => [
              ...prev,
              ...(newData as unknown as Lineup[]),
            ])
            setPage(nextPage)
            if (newData.length < PAGE_SIZE) {
              setHasMore(false)
            }
          }
          setIsFetchingMore(false)
        }
      },
      {
        rootMargin: "200px", // Déclenche le chargement 200px avant le bas réel
      }
    )

    observer.observe(target)

    return () => {
      if (target) observer.unobserve(target)
    }
  }, [page, hasMore, isLoading, isFetchingMore, selectedMap, selectedSite])

  // Pour conserver l'affichage dynamique des sites du filtre, on se base sur les éléments chargés
  // ou une liste fixe propre à Valorant ("A", "B", "C") selon votre implémentation de <SiteFilterToggle />
  const availableSitesOnMap = Array.from(
    new Set(dbLineups.map((lineup) => lineup.site))
  )

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

          {/* Grille des résultats avec gestion du chargement initial */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff4655] border-t-transparent"></div>
            </div>
          ) : dbLineups.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {dbLineups.map((lineup) => (
                  <LineupCard key={lineup.id} lineup={lineup} />
                ))}
              </div>

              {/* ÉLÉMENT ESPION : Déclencheur du scroll infini */}
              <div
                ref={observerTarget}
                className="flex min-h-[60px] justify-center py-8"
              >
                {isFetchingMore && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin text-[#ff4655]" />
                    Chargement des lineups suivantes...
                  </div>
                )}
                {!hasMore && (
                  <p className="text-xs tracking-widest text-gray-600 uppercase">
                    ✨ Fin des lineups disponibles
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-[#14171c]/30">
              <p className="text-sm text-gray-500">
                Aucune lineup enregistrée pour {selectedMap}{" "}
                {selectedSite !== "all" ? `(Site ${selectedSite})` : ""}.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
