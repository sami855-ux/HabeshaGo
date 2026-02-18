// components/user-dashboard/trip/TripsEmptyState.tsx
import { Button } from "@/components/ui/button"
import { Calendar, Search, Filter, Ticket } from "lucide-react"
import { TripCategory } from "@/types/trips"

interface TripsEmptyStateProps {
  category: TripCategory
  hasFilters?: boolean
  onClearFilters?: () => void
}

export default function TripsEmptyState({
  category,
  hasFilters,
  onClearFilters,
}: TripsEmptyStateProps) {
  const messages = {
    upcoming: {
      title: hasFilters ? "No matching upcoming trips" : "No upcoming trips",
      description: hasFilters
        ? "Try adjusting your filters to see more results"
        : "You don't have any upcoming trips. Book your next adventure!",
      icon: Calendar,
    },
    past: {
      title: hasFilters ? "No matching past trips" : "No past trips",
      description: hasFilters
        ? "Try adjusting your filters to see more results"
        : "Your past trips will appear here once you complete some journeys",
      icon: Ticket,
    },
  }

  const message = messages[category]

  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-100 rounded-full">
          {hasFilters ? (
            <Filter className="h-8 w-8 text-gray-400" />
          ) : (
            <message.icon className="h-8 w-8 text-gray-400" />
          )}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {message.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {message.description}
      </p>
      {hasFilters && onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          Clear Filters
        </Button>
      )}
      {!hasFilters && category === "upcoming" && (
        <Button className="bg-orange-600 hover:bg-orange-700">
          Book a Trip
        </Button>
      )}
    </div>
  )
}
