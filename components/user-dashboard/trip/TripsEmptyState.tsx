import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Search } from "lucide-react"

interface TripsEmptyStateProps {
  category: "upcoming" | "past"
}

export default function TripsEmptyState({ category }: TripsEmptyStateProps) {
  const messages = {
    upcoming: {
      title: "No upcoming journeys",
      description:
        "Your next adventure awaits! Explore available bus routes and plan your trip.",
      icon: (
        <div className="relative">
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="h-3 w-3 text-blue-600" />
          </div>
          <MapPin className="h-16 w-16 text-blue-200" />
        </div>
      ),
      buttonText: "Discover Routes",
      buttonIcon: <MapPin className="h-4 w-4 mr-2" />,
    },
    past: {
      title: "No travel history yet",
      description:
        "Your completed trips will appear here. Start your first journey with HabeshaGo!",
      icon: (
        <div className="relative">
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Search className="h-3 w-3 text-green-600" />
          </div>
          <Calendar className="h-16 w-16 text-green-200" />
        </div>
      ),
      buttonText: "Book First Trip",
      buttonIcon: <Calendar className="h-4 w-4 mr-2" />,
    },
  }

  const message = messages[category]

  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center p-6 mb-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-100">
        {message.icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{message.title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
        {message.description}
      </p>
      <Button size="lg" className="gap-2 px-8 h-12">
        {message.buttonIcon}
        {message.buttonText}
      </Button>
    </div>
  )
}
