import { MapName, MAPS } from "@/types/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  selectedMap: MapName
  onSelectMap: (map: MapName) => void
  onCloseMobile?: () => void
  isMobile?: boolean // Nouvelle prop optionnelle pour distinguer le mode d'affichage
}

export default function Sidebar({
  selectedMap,
  onSelectMap,
  onCloseMobile,
  isMobile = false,
}: SidebarProps) {
  const renderMapList = () => (
    <div>
      <h2 className="mb-3 px-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
        Cartes
      </h2>
      <ScrollArea className="h-[calc(100vh-80px)] pr-2">
        <ul className="space-y-1">
          {MAPS.map((map) => {
            const isActive = selectedMap === map
            return (
              <li key={map}>
                <button
                  onClick={() => {
                    onSelectMap(map)
                    if (onCloseMobile) onCloseMobile()
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
                    isActive
                      ? "border-l-4 border-[#ff4655] bg-[#3a1c20] text-[#ff4655]"
                      : "text-gray-400 hover:bg-[#1c2026] hover:text-white"
                  }`}
                >
                  {map}
                </button>
              </li>
            )
          })}
        </ul>
      </ScrollArea>
    </div>
  )

  // Si c'est sur mobile, on renvoie directement le contenu pour éviter que <aside> ne le masque
  if (isMobile) {
    return <div className="flex w-full flex-col gap-6">{renderMapList()}</div>
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-gray-800 bg-[#14171c] p-4 md:flex">
      {renderMapList()}
    </aside>
  )
}
