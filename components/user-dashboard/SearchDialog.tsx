// components/SearchDialog.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Users,
  CreditCard,
  Receipt,
  Filter,
  Calendar,
  ArrowRight,
  Loader2,
  History,
  Star,
  Command,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch?: (query: string) => void
}

// Mock data types
interface SearchResult {
  id: string
  type: "payment" | "transaction" | "user" | "trip" | "bus"
  title: string
  subtitle: string
  icon?: React.ReactNode
  amount?: number
  currency?: string
  date?: string
  status?: "completed" | "pending" | "failed"
  image?: string
  category?: string
  popularity?: number
}

// Mock search data
const mockData: SearchResult[] = [
  {
    id: "1",
    type: "payment",
    title: "Payment to ABC Company",
    subtitle: "Invoice #INV-2024-001",
    amount: 1250.0,
    currency: "ETB",
    date: "2024-01-15",
    status: "completed",
    category: "Business",
    popularity: 85,
  },
  {
    id: "2",
    type: "transaction",
    title: "Bus Ticket Purchase",
    subtitle: "Addis Ababa to Bahir Dar",
    amount: 450.0,
    currency: "ETB",
    date: "2024-01-14",
    status: "completed",
    category: "Travel",
    popularity: 92,
  },
  {
    id: "3",
    type: "user",
    title: "Abebe Kebede",
    subtitle: "abebe.k@example.com",
    image: "https://i.pravatar.cc/150?u=1",
    date: "2024-01-10",
    popularity: 78,
  },
  {
    id: "4",
    type: "trip",
    title: "Addis Ababa to Hawassa",
    subtitle: "Departure: Feb 15, 2024 • 8:00 AM",
    amount: 350.0,
    currency: "ETB",
    date: "2024-02-15",
    status: "pending",
    category: "Upcoming Trip",
    popularity: 88,
  },
  {
    id: "5",
    type: "bus",
    title: "Sky Bus 237",
    subtitle: "Route: Addis - Jimma • 45 seats",
    amount: 280.0,
    currency: "ETB",
    date: "2024-01-12",
    status: "completed",
    category: "Transport",
    popularity: 76,
  },
  {
    id: "6",
    type: "payment",
    title: "Wallet Top-up",
    subtitle: "Via Bank Transfer",
    amount: 2000.0,
    currency: "ETB",
    date: "2024-01-13",
    status: "completed",
    category: "Finance",
    popularity: 94,
  },
  {
    id: "7",
    type: "transaction",
    title: "Coffee Shop Purchase",
    subtitle: "Tomoca Coffee",
    amount: 85.0,
    currency: "ETB",
    date: "2024-01-14",
    status: "completed",
    category: "Food & Drink",
    popularity: 82,
  },
  {
    id: "8",
    type: "user",
    title: "Tigist Mengistu",
    subtitle: "tigist.m@example.com",
    image: "https://i.pravatar.cc/150?u=2",
    date: "2024-01-09",
    popularity: 71,
  },
]

// Recent searches (mock)
const recentSearches = [
  "Bus ticket Addis",
  "Payment to ABC",
  "Abebe Kebede",
  "Wallet top-up",
]

// Popular searches (mock)
const popularSearches = [
  "Addis Ababa",
  "Bus tickets",
  "Payment history",
  "Profile settings",
]

export default function SearchDialog({
  open,
  onOpenChange,
  onSearch,
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    const timer = setTimeout(() => {
      const filtered = mockData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setResults(filtered)
      setIsLoading(false)
    }, 500) // Simulate network delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch?.(searchQuery)
      // In a real app, you might save to recent searches here
    }
  }

  const handleResultClick = (result: SearchResult) => {
    console.log("Selected:", result)
    onOpenChange(false)
    setSearchQuery("")
    // Navigate or handle selection
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700"
      case "pending":
        return "bg-amber-100 text-amber-700"
      case "failed":
        return "bg-rose-100 text-rose-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="w-4 h-4" />
      case "transaction":
        return <Receipt className="w-4 h-4" />
      case "user":
        return <Users className="w-4 h-4" />
      case "trip":
        return <Calendar className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const filteredResults = results.filter((result) =>
    activeTab === "all" ? true : result.type === activeTab,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-500" />
              Search
            </DialogTitle>
            <Badge variant="outline" className="gap-1 bg-white mt-7">
              <Command className="w-3 h-3" /> + K
            </Badge>
          </div>
        </DialogHeader>

        {/* Search Input */}
        <div className="p-4 border-b">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search payments, transactions, users, trips..."
                className="w-full pl-10 pr-10 py-6 text-base bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-orange-500"
                autoFocus
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-gray-200"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px] max-h-[500px] overflow-hidden">
          {!searchQuery ? (
            // Initial state - recent & popular searches
            <div className="p-6 space-y-6">
              {/* Recent Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">
                    Recent Searches
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3 py-1.5 cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors"
                      onClick={() => setSearchQuery(search)}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Popular Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">
                    Popular Searches
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-3 py-1.5 cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors"
                      onClick={() => setSearchQuery(search)}
                    >
                      <Star className="w-3 h-3 mr-1 text-amber-500" />
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Categories */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Browse by Category
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Payments", "Transactions", "Users", "Trips"].map(
                    (category) => (
                      <Button
                        key={category}
                        variant="outline"
                        className="justify-start gap-2 h-auto py-2 px-3"
                        onClick={() => setSearchQuery(category.toLowerCase())}
                      >
                        {category === "Payments" && (
                          <CreditCard className="w-4 h-4" />
                        )}
                        {category === "Transactions" && (
                          <Receipt className="w-4 h-4" />
                        )}
                        {category === "Users" && <Users className="w-4 h-4" />}
                        {category === "Trips" && (
                          <Calendar className="w-4 h-4" />
                        )}
                        {category}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Search results
            <div className="h-full flex flex-col">
              {/* Filters */}
              <div className="px-4 py-2 border-b flex items-center gap-2 overflow-x-auto">
                <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="bg-transparent h-9">
                    <TabsTrigger value="all" className="px-3 py-1.5 text-xs">
                      All ({results.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="payment"
                      className="px-3 py-1.5 text-xs"
                    >
                      Payments (
                      {results.filter((r) => r.type === "payment").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="transaction"
                      className="px-3 py-1.5 text-xs"
                    >
                      Transactions (
                      {results.filter((r) => r.type === "transaction").length})
                    </TabsTrigger>
                    <TabsTrigger value="user" className="px-3 py-1.5 text-xs">
                      Users ({results.filter((r) => r.type === "user").length})
                    </TabsTrigger>
                    <TabsTrigger value="trip" className="px-3 py-1.5 text-xs">
                      Trips ({results.filter((r) => r.type === "trip").length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Results */}
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12"
                      >
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
                        <p className="text-sm text-gray-500">Searching...</p>
                      </motion.div>
                    ) : filteredResults.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        {filteredResults.map((result, index) => (
                          <motion.div
                            key={result.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "p-3 rounded-xl cursor-pointer transition-all",
                              "hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50",
                              "border border-transparent hover:border-orange-200",
                            )}
                            onClick={() => handleResultClick(result)}
                          >
                            <div className="flex items-center gap-3">
                              {result.type === "user" ? (
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                  <AvatarImage src={result.image} />
                                  <AvatarFallback className="bg-orange-100 text-orange-700">
                                    {result.title.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div
                                  className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center",
                                    result.type === "payment"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : result.type === "transaction"
                                        ? "bg-blue-100 text-blue-700"
                                        : result.type === "trip"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-purple-100 text-purple-700",
                                  )}
                                >
                                  {getTypeIcon(result.type)}
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900 truncate">
                                    {result.title}
                                  </p>
                                  {result.status && (
                                    <Badge
                                      className={cn(
                                        "text-xs px-1.5 py-0",
                                        getStatusColor(result.status),
                                      )}
                                    >
                                      {result.status}
                                    </Badge>
                                  )}
                                  {result.popularity &&
                                    result.popularity > 80 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs border-amber-200 bg-amber-50"
                                      >
                                        <Star className="w-3 h-3 mr-1 text-amber-500" />
                                        Popular
                                      </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                  {result.subtitle}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                  {result.amount && (
                                    <span className="font-medium text-gray-700">
                                      {result.currency}{" "}
                                      {result.amount.toLocaleString()}
                                    </span>
                                  )}
                                  {result.date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(
                                        result.date,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                  {result.category && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-gray-50"
                                    >
                                      {result.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12"
                      >
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          No results found
                        </h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm">
                          We couldn't find any matches for "{searchQuery}". Try
                          adjusting your search or filters.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-white rounded border text-xs">
                ↑
              </span>
              <span className="px-1.5 py-0.5 bg-white rounded border text-xs">
                ↓
              </span>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-white rounded border text-xs">
                ↵
              </span>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-white rounded border text-xs">
              ESC
            </span>
            <span>to close</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
