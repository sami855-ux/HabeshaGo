"use client"

import { useState } from "react"
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Clock,
  Star,
  X,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const cities = [
  { value: "new-york", label: "New York", state: "NY" },
  { value: "boston", label: "Boston", state: "MA" },
  { value: "philadelphia", label: "Philadelphia", state: "PA" },
  { value: "washington-dc", label: "Washington DC", state: "DC" },
  { value: "chicago", label: "Chicago", state: "IL" },
  { value: "los-angeles", label: "Los Angeles", state: "CA" },
  { value: "miami", label: "Miami", state: "FL" },
  { value: "atlanta", label: "Atlanta", state: "GA" },
  { value: "seattle", label: "Seattle", state: "WA" },
  { value: "denver", label: "Denver", state: "CO" },
]

const popularStations = [
  { city: "New York", station: "Port Authority Bus Terminal", code: "PABT" },
  { city: "Boston", station: "South Station Bus Terminal", code: "SSBT" },
  { city: "Philadelphia", station: "30th Street Station", code: "30TH" },
  { city: "Washington DC", station: "Union Station", code: "UNION" },
]

export function SearchRoute() {
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const [fromValue, setFromValue] = useState("new-york")
  const [toValue, setToValue] = useState("boston")
  const [fromSearch, setFromSearch] = useState("")
  const [toSearch, setToSearch] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [passengers, setPassengers] = useState(1)

  const selectedFrom = cities.find((city) => city.value === fromValue)
  const selectedTo = cities.find((city) => city.value === toValue)

  const trendingRoutes = [
    { from: "NYC", to: "Boston", price: "$25", rating: 4.5, duration: "5h" },
    {
      from: "NYC",
      to: "Philly",
      price: "$18",
      rating: 4.2,
      duration: "2h 30m",
    },
    { from: "NYC", to: "DC", price: "$35", rating: 4.7, duration: "4h" },
    {
      from: "Boston",
      to: "NYC",
      price: "$28",
      rating: 4.4,
      duration: "5h 15m",
    },
  ]

  const handleSwapLocations = () => {
    const temp = fromValue
    setFromValue(toValue)
    setToValue(temp)
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Hero Search Card */}
      <Card className="overflow-hidden border-none shadow-2xl rounded-2xl bg-gradient-to-br from-background via-background to-secondary/5">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-3">
              Where would you like to go?
            </h1>
            <p className="text-lg text-muted-foreground">
              Search across 5,000+ bus routes with real-time availability
            </p>
          </div>

          {/* Search Form */}
          <div className="space-y-6">
            {/* Route Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* From Combobox */}
              <div className="lg:col-span-5">
                <Label className="text-sm font-medium mb-2 block">From</Label>
                <Popover open={fromOpen} onOpenChange={setFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={fromOpen}
                      className="w-full h-14 justify-between text-base rounded-xl border-2 hover:border-primary/50 px-4"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="size-5 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-semibold">
                            {selectedFrom ? selectedFrom.label : "Select city"}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-0 rounded-xl"
                    align="start"
                  >
                    <Command className="rounded-xl">
                      <CommandInput
                        placeholder="Search cities or stations..."
                        value={fromSearch}
                        onValueChange={setFromSearch}
                        className="h-12"
                      />
                      <CommandList>
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup heading="Popular Cities">
                          {cities.map((city) => (
                            <CommandItem
                              key={city.value}
                              value={city.value}
                              onSelect={(currentValue) => {
                                setFromValue(
                                  currentValue === fromValue ? "" : currentValue
                                )
                                setFromOpen(false)
                              }}
                              className="flex items-center justify-between py-3 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <MapPin className="size-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">
                                    {city.label}
                                  </div>
                                </div>
                              </div>
                              {fromValue === city.value && (
                                <Check className="size-4 text-primary" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandGroup heading="Popular Stations">
                          {popularStations.map((station) => (
                            <CommandItem
                              key={station.code}
                              value={station.station}
                              onSelect={() => {
                                // Handle station selection
                                setFromOpen(false)
                              }}
                              className="py-3 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <MapPin className="size-3 text-primary" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {station.station}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {station.city}
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Arrow Divider */}
              <div className="lg:col-span-2 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-8" />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10 rounded-full bg-background border-2 hover:bg-primary/10 hover:border-primary/30 relative z-10"
                    onClick={handleSwapLocations}
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* To Combobox */}
              <div className="lg:col-span-5">
                <Label className="text-sm font-medium mb-2 block">To</Label>
                <Popover open={toOpen} onOpenChange={setToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={toOpen}
                      className="w-full h-14 justify-between text-base rounded-xl border-2 hover:border-primary/50 px-4"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="size-5 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-semibold">
                            {selectedTo
                              ? selectedTo.label
                              : "Select destination"}
                          </div>
                          {selectedTo && (
                            <div className="text-xs text-muted-foreground">
                              {selectedTo.state}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-0 rounded-xl"
                    align="start"
                  >
                    <Command className="rounded-xl">
                      <CommandInput
                        placeholder="Search destinations..."
                        value={toSearch}
                        onValueChange={setToSearch}
                        className="h-12"
                      />
                      <CommandList>
                        <CommandEmpty>No destination found.</CommandEmpty>
                        <CommandGroup heading="Popular Destinations">
                          {cities
                            .filter((city) => city.value !== fromValue) // Don't show current from city
                            .map((city) => (
                              <CommandItem
                                key={city.value}
                                value={city.value}
                                onSelect={(currentValue) => {
                                  setToValue(
                                    currentValue === toValue ? "" : currentValue
                                  )
                                  setToOpen(false)
                                }}
                                className="flex items-center justify-between py-3 cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <MapPin className="size-4 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">
                                      {city.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {city.state}
                                    </div>
                                  </div>
                                </div>
                                {toValue === city.value && (
                                  <Check className="size-4 text-primary" />
                                )}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandGroup heading="Recommended for You">
                          {cities
                            .filter(
                              (city) =>
                                city.value !== fromValue &&
                                city.value !== toValue
                            )
                            .slice(0, 3)
                            .map((city) => (
                              <CommandItem
                                key={city.value}
                                value={city.value}
                                onSelect={(currentValue) => {
                                  setToValue(
                                    currentValue === toValue ? "" : currentValue
                                  )
                                  setToOpen(false)
                                }}
                                className="py-3 cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Star className="size-3 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {city.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {city.state} • Popular destination
                                    </div>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Date and Passengers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <Calendar className="inline size-4 mr-2" />
                  Travel Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-start text-left text-base rounded-xl border-2 hover:border-primary/50"
                    >
                      <Calendar className="mr-3 size-5" />
                      <span className="font-semibold">
                        {date
                          ? date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Select date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-xl"
                    align="start"
                  >
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="rounded-xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Passengers */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  <Users className="inline size-4 mr-2" />
                  Passengers
                </Label>
                <div className="flex items-center gap-2 h-14 px-4 rounded-xl border-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-primary/10"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  >
                    -
                  </Button>
                  <span className="flex-1 text-center text-lg font-semibold">
                    {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full hover:bg-primary/10"
                    onClick={() => setPassengers(passengers + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-bold rounded-xl cursor-pointer bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary hover:via-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Search className="mr-3 size-5" />
                    Search Buses
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Selected Route Preview */}
            <AnimatePresence>
              {selectedFrom && selectedTo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="size-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {selectedFrom.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Departure
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="size-5 text-muted-foreground" />
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="size-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {selectedTo.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Destination
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-2">
                      <Clock className="size-3" />
                      4-6 hours
                    </Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Trending Routes */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Previous Routes</h2>
            <p className="text-muted-foreground">
              Popular bus routes people are booking right now
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            Most Booked
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingRoutes.map((route, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              onClick={() => {
                // Set the route when clicked
                const fromCity = cities.find((c) =>
                  c.label.includes(route.from)
                )
                const toCity = cities.find((c) => c.label.includes(route.to))
                if (fromCity) setFromValue(fromCity.value)
                if (toCity) setToValue(toCity.value)
              }}
            >
              <Card className="h-full border hover:border-primary/50 hover:shadow-lg transition-all duration-200 group overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <MapPin className="size-4 text-primary" />
                        </div>
                        <div className="font-semibold text-lg">
                          {route.from} → {route.to}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-3" />
                        {route.duration}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      {route.rating}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      Book now
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
