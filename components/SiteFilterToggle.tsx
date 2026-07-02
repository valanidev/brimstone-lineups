import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SiteFilter } from "@/types/types"

interface SiteFilterToggleProps {
  selectedSite: SiteFilter
  onSiteChange: (site: SiteFilter) => void
  availableSitesOnMap: string[]
  hasLineups: boolean
}

export default function SiteFilterToggle({
  selectedSite,
  onSiteChange,
  availableSitesOnMap,
  hasLineups,
}: SiteFilterToggleProps) {
  if (!hasLineups) return null

  return (
    <ToggleGroup
      type="single"
      value={selectedSite}
      onValueChange={(value) => {
        if (value) onSiteChange(value as SiteFilter)
      }}
      className="h-10 gap-1 rounded-lg border border-gray-800 bg-[#14171c] p-1"
    >
      {availableSitesOnMap.includes("A") && (
        <ToggleGroupItem
          value="A"
          className="rounded-md px-4 text-xs font-semibold text-gray-400 uppercase transition-all data-[state=on]:bg-[#3a1c20] data-[state=on]:text-[#ff4655]"
        >
          A
        </ToggleGroupItem>
      )}

      {availableSitesOnMap.includes("B") && (
        <ToggleGroupItem
          value="B"
          className="rounded-md px-4 text-xs font-semibold text-gray-400 uppercase transition-all data-[state=on]:bg-[#3a1c20] data-[state=on]:text-[#ff4655]"
        >
          B
        </ToggleGroupItem>
      )}

      {availableSitesOnMap.includes("C") && (
        <ToggleGroupItem
          value="C"
          className="rounded-md px-4 text-xs font-semibold text-gray-400 uppercase transition-all data-[state=on]:bg-[#3a1c20] data-[state=on]:text-[#ff4655]"
        >
          C
        </ToggleGroupItem>
      )}

      <ToggleGroupItem
        value="all"
        className="rounded-md px-3 text-xs font-semibold text-gray-400 transition-all data-[state=on]:bg-[#22252a] data-[state=on]:text-white"
      >
        Tous
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
