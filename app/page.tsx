"use client"

import { useState, useEffect, useRef } from "react"
import LineupCard from "@/components/LineupCard"
import { Lineup, MapName, SiteFilter } from "@/types/types"
import Sidebar from "@/components/Sidebar"
import SiteFilterToggle from "@/components/SiteFilterToggle"
import CreateLineupModal from "@/components/CreateLineupModal"
import { getLineupsByMap } from "@/app/actions/get-lineups"
import { Loader2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function LineupsGallery() {
  const [selectedMap, setSelectedMap] = useState<MapName>("Ascent")
  const [selectedSite, setSelectedSite] = useState<SiteFilter>("all")

  const [dbLineups, setDbLineups] = useState<Lineup[]>([])
  const [page, setPage] = useState<number>(1)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)

  const [mapHasData, setMapHasData] = useState<boolean>(false)

  const observerTarget = useRef<HTMLDivElement>(null)
  const PAGE_SIZE = 8

  useEffect(() => {
    async function loadInitialLineups() {
      setIsLoading(true)
      setPage(1)
      setHasMore(true)

      const data = await getLineupsByMap(
        selectedMap,
        1,
        PAGE_SIZE,
        selectedSite === "all" ? null : selectedSite
      )

      setDbLineups(data as unknown as Lineup[])

      if (selectedSite === "all") {
        setMapHasData(data.length > 0)
      }

      if (data.length < PAGE_SIZE) {
        setHasMore(false)
      }
      setIsLoading(false)
    }

    loadInitialLineups()
  }, [selectedMap, selectedSite])

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
      { rootMargin: "200px" }
    )

    observer.observe(target)

    return () => {
      if (target) observer.unobserve(target)
    }
  }, [page, hasMore, isLoading, isFetchingMore, selectedMap, selectedSite])

  const availableSitesOnMap = ["A", "B", "C"]

  const handleLineupCreated = (newLineup: Lineup) => {
    const matchesMap = newLineup.map === selectedMap
    const matchesSite =
      selectedSite === "all" || newLineup.site === selectedSite

    if (matchesMap) {
      setMapHasData(true)
      if (matchesSite) {
        setDbLineups((prev) => [...prev, newLineup])
      }
    }
  }

  const handleSelectMap = (map: MapName) => {
    setSelectedMap(map)
    setSelectedSite("all")
    setMapHasData(false)
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0f1115] font-sans text-gray-200">
      <nav className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-[#14171c] px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 border-r border-gray-800 bg-[#14171c] p-4 pt-12 text-gray-200"
            >
              {/* MODIFIÉ : Ajout de la prop isMobile pour forcer l'affichage */}
              <Sidebar
                selectedMap={selectedMap}
                onSelectMap={handleSelectMap}
                onCloseMobile={() => setMobileMenuOpen(false)}
                isMobile={true}
              />
            </SheetContent>
          </Sheet>

          <div className="xs:block hidden h-3 w-3 rotate-45 bg-[#ff4655]" />

          {/* MODIFIÉ : Titre adaptatif (BL sur mobile, Brimstone Lineups sur desktop) */}
          <span className="block text-sm font-bold tracking-widest text-white uppercase md:hidden">
            BL
          </span>
          <span className="hidden text-sm font-bold tracking-widest text-white uppercase md:block">
            Brimstone Lineups
          </span>
        </div>
        <CreateLineupModal onLineupCreated={handleLineupCreated} />
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar selectedMap={selectedMap} onSelectMap={handleSelectMap} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <header className="mb-6 flex flex-col gap-4 border-b border-gray-800/60 pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-bold tracking-tight text-white sm:mb-2 sm:text-3xl">
                {selectedMap}
              </h1>
              <p className="hidden text-sm text-gray-400 sm:block">
                Affichage des lineups disponibles pour la carte {selectedMap}.
              </p>
            </div>

            <SiteFilterToggle
              selectedSite={selectedSite}
              onSiteChange={setSelectedSite}
              availableSitesOnMap={availableSitesOnMap}
              hasLineups={mapHasData || selectedSite !== "all"}
            />
          </header>

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

              <div
                ref={observerTarget}
                className="flex min-h-15 justify-center py-8"
              >
                {isFetchingMore && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin text-[#ff4655]" />
                    Chargement des lineups suivantes...
                  </div>
                )}
                {!hasMore && (
                  <p className="text-xs tracking-widest text-gray-600 uppercase">
                    Fin des lineups disponibles
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-[#14171c]/30 p-4 text-center">
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
