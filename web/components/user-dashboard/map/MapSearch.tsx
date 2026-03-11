"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQueryParams } from "@/hooks/useQueryParams"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Loader2, MapPin } from "lucide-react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Define known locations and their coordinates
const KNOWN_LOCATIONS = {
  bole: {
    name: "Bole, Addis Ababa",
    redirect: "/map?lat=8.9806&lng=38.7578&zoom=15",
    description: "Bole Sub-city, Addis Ababa",
    type: "subcity",
  },
  mexico: {
    name: "Mexico Square, Addis Ababa",
    redirect: "/map?lat=9.0108&lng=38.7567&zoom=16",
    description: "Mexico Square, Addis Ababa",
    type: "landmark",
  },
  piassa: {
    name: "Piassa, Addis Ababa",
    redirect: "/map?lat=9.0437&lng=38.7536&zoom=16",
    description: "Piassa, Addis Ababa",
    type: "landmark",
  },
  "bole airport": {
    name: "Bole International Airport",
    redirect: "/map?lat=8.9779&lng=38.7993&zoom=16",
    description: "Addis Ababa Bole International Airport",
    type: "airport",
  },
  "addis ababa": {
    name: "Addis Ababa",
    redirect: "/map?lat=9.0322&lng=38.7469&zoom=12",
    description: "Addis Ababa, Ethiopia",
    type: "city",
  },
  // Add more locations as needed
}

interface Suggestion {
  name: string
  redirect: string
  description: string
  type: string
}

export default function MapSearch() {
  const router = useRouter()
  const { getParam, setParam, deleteParam } = useQueryParams()
  const [searchValue, setSearchValue] = useState(getParam("search") || "")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setSearchValue(getParam("search") || "")
  }, [getParam])

  // Dynamic search suggestions
  useEffect(() => {
    if (searchValue.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      const searchLower = searchValue.toLowerCase()

      // Filter known locations
      const matchedLocations = Object.entries(KNOWN_LOCATIONS)
        .filter(
          ([key, location]) =>
            key.includes(searchLower) ||
            location.name.toLowerCase().includes(searchLower),
        )
        .map(([_, location]) => location)

      setSuggestions(matchedLocations)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue])

  const handleSearch = () => {
    if (!searchValue.trim()) {
      deleteParam("search")
      return
    }

    const searchLower = searchValue.toLowerCase().trim()

    // Check if search matches a known location
    const matchedLocation =
      KNOWN_LOCATIONS[searchLower as keyof typeof KNOWN_LOCATIONS]

    if (matchedLocation) {
      // Redirect to the specific location
      router.push(matchedLocation.redirect)
    } else {
      // Normal search with query param
      setParam("search", searchValue.trim())
    }

    setOpen(false)
  }

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    router.push(suggestion.redirect)
    setSearchValue("")
    setSuggestions([])
    setOpen(false)
  }

  const handleClear = () => {
    setSearchValue("")
    deleteParam("search")
    setSuggestions([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Get location type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "city":
        return "bg-purple-100 text-purple-700"
      case "subcity":
        return "bg-blue-100 text-blue-700"
      case "landmark":
        return "bg-green-100 text-green-700"
      case "airport":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search locations or type 'bole' to redirect..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  setOpen(true)
                }}
                onKeyPress={handleKeyPress}
                className="pr-8 h-11 bg-white/90 backdrop-blur-sm border-2 focus:border-primary"
              />
              {searchValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              size="icon"
              className="h-11 w-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandList>
              <CommandEmpty className="py-6 text-center text-sm">
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="h-8 w-8 text-gray-300" />
                  <p className="text-gray-500">No locations found</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleSearch}
                    className="text-primary"
                  >
                    Search for "{searchValue}"
                  </Button>
                </div>
              </CommandEmpty>

              {suggestions.length > 0 && (
                <CommandGroup heading="Suggested Locations">
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            getTypeColor(suggestion.type),
                          )}
                        >
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{suggestion.name}</span>
                          <span className="text-xs text-gray-500">
                            {suggestion.description}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={cn("ml-2", getTypeColor(suggestion.type))}
                      >
                        {suggestion.type}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {searchValue.length >= 2 && suggestions.length === 0 && (
                <CommandGroup heading="Search">
                  <CommandItem
                    onSelect={handleSearch}
                    className="flex items-center gap-2 py-3"
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                    <span>
                      Search for "
                      <span className="font-medium">{searchValue}</span>"
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Quick redirect hint */}
      {!searchValue && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-400">
          Try:{" "}
          <button
            onClick={() => {
              setSearchValue("bole")
              handleSearch()
            }}
            className="text-primary hover:underline"
          >
            bole
          </button>
          ,
          <button
            onClick={() => {
              setSearchValue("mexico")
              handleSearch()
            }}
            className="text-primary hover:underline ml-1"
          >
            mexico
          </button>
        </div>
      )}
    </div>
  )
}

// Helper Badge component
function Badge({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn("px-2 py-1 text-xs font-medium rounded-full", className)}
    >
      {children}
    </span>
  )
}
