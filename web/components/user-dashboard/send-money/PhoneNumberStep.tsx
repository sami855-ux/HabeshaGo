"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Search,
  User,
  Phone,
  CheckCircle,
  XCircle,
  ChevronRight,
  Star,
  Trash2,
  Loader2,
  AlertCircle,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getUserByPhoneNumber } from "@/services/user.api"
import { UserByPhoneResponse } from "@/types/user"

interface FavoriteContact {
  id: string
  name: string
  phone: string
  isVerified: boolean
  isFavorite: boolean
  createdAt: number
  userId: string
  avatar?: string
}

interface PhoneNumberStepProps {
  onSelectContact: (contact: UserByPhoneResponse) => void
  currentUserId: string
}

export default function PhoneNumberStep({
  onSelectContact,
  currentUserId,
}: PhoneNumberStepProps) {
  const [phone, setPhone] = useState("+251 ")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const [favoriteContacts, setFavoriteContacts] = useState<FavoriteContact[]>(
    [],
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  )
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchResult, setSearchResult] = useState<UserByPhoneResponse | null>(
    null,
  )

  const phoneInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Load favorite contacts from localStorage on component mount
  useEffect(() => {
    loadFavoriteContacts()
  }, [currentUserId])

  const loadFavoriteContacts = () => {
    try {
      const stored = localStorage.getItem(`favoriteContacts_${currentUserId}`)
      if (stored) {
        const favorites: FavoriteContact[] = JSON.parse(stored)
        const userFavorites = favorites.filter(
          (fav) => fav.userId === currentUserId,
        )
        setFavoriteContacts(userFavorites)
      }
    } catch (error) {
      console.error("Error loading favorite contacts:", error)
      toast.error("Failed to load contacts", {
        description: "Could not load your favorite contacts",
      })
    }
  }

  const saveFavoriteContacts = useCallback(
    (contacts: FavoriteContact[]) => {
      try {
        const stored = localStorage.getItem(`favoriteContacts_${currentUserId}`)
        let allContacts: FavoriteContact[] = []

        if (stored) {
          allContacts = JSON.parse(stored)
          allContacts = allContacts.filter(
            (contact) => contact.userId !== currentUserId,
          )
        }

        allContacts = [...allContacts, ...contacts]

        localStorage.setItem(
          `favoriteContacts_${currentUserId}`,
          JSON.stringify(allContacts),
        )
      } catch (error) {
        console.error("Error saving favorite contacts:", error)
        toast.error("Failed to save contacts", {
          description: "Could not save your favorite contacts",
        })
      }
    },
    [currentUserId],
  )

  // Check if current search result is already in favorites
  const isSearchResultInFavorites = useCallback(() => {
    if (!searchResult) return false
    return favoriteContacts.some((fav) => fav.phone === searchResult.phone)
  }, [searchResult, favoriteContacts])

  // Debounced search for favorites
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Search logic is handled in filteredContacts
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSearchResult(null)

    const cleanedPhone = phone.replace(/\s/g, "")

    if (!cleanedPhone.trim()) {
      setError("Please enter a phone number")
      return
    }

    // Validate Ethiopian phone number format
    const ethiopianPhoneRegex = /^\+251(9[0-9]|7[1-9]|7[0-5])[0-9]{7}$/
    if (!ethiopianPhoneRegex.test(cleanedPhone)) {
      setError(
        "Please enter a valid Ethiopian phone number (+251 followed by 9 digits)",
      )
      return
    }

    // Remove + for API call
    const phoneForApi = cleanedPhone.slice(1)

    setIsLoading(true)
    setIsSearching(true)

    try {
      // Call API to search for recipient
      const result = await getUserByPhoneNumber(phoneForApi)

      if (result.success && result.data) {
        setSearchResult(result.data)
        toast.success("User found!", {
          description: `Found: ${result.data.name}`,
        })
      } else {
        toast.error("User not found", {
          description: result.message || "No user found with this phone number",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Search failed", {
        description: "Unable to search for user. Please try again.",
      })
    } finally {
      setIsSearching(false)
      setIsLoading(false)
    }
  }

  const addSearchResultToFavorites = () => {
    if (!searchResult) return

    // Check if already in favorites
    if (isSearchResultInFavorites()) {
      toast.info("Already in favorites", {
        description: "This contact is already in your favorites",
      })
      return
    }

    const newFavorite: FavoriteContact = {
      id: searchResult.id,
      name: searchResult.name,
      phone: searchResult.phone,
      isVerified: searchResult.isVerified,
      isFavorite: true,
      createdAt: Date.now(),
      userId: currentUserId,
    }

    const updatedFavorites = [...favoriteContacts, newFavorite]
    setFavoriteContacts(updatedFavorites)
    saveFavoriteContacts(updatedFavorites)

    toast.success("Added to favorites", {
      description: `${searchResult.name} has been added to your favorites`,
    })
  }

  const removeFromFavorites = (id: string) => {
    const updatedFavorites = favoriteContacts.filter((fav) => fav.id !== id)
    setFavoriteContacts(updatedFavorites)
    saveFavoriteContacts(updatedFavorites)
    setShowDeleteConfirm(null)

    toast.success("Contact removed", {
      description: `Contact has been removed from your favorites.`,
    })
  }

  const handlePhoneChange = (value: string) => {
    // Ensure the number starts with +251
    if (!value.startsWith("+251")) {
      setPhone("+251 ")
      return
    }

    // Remove all non-digit characters except +
    const digits = value.replace(/[^\d+]/g, "")

    // Format the phone number
    if (digits.startsWith("+251")) {
      let formatted = "+251 "
      const rest = digits.slice(4)

      if (rest.length > 0) {
        formatted += rest.slice(0, 2)
      }
      if (rest.length > 2) {
        formatted += " " + rest.slice(2, 5)
      }
      if (rest.length > 5) {
        formatted += " " + rest.slice(5, 9)
      }

      setPhone(formatted)
    }
  }

  // Filter contacts based on search
  const filteredContacts = favoriteContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery),
  )

  // Sort contacts by name
  const sortedContacts = [...filteredContacts].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  // Get unique categories from contacts
  const categories = [
    "all",
    ...new Set(
      favoriteContacts.map((fav) =>
        fav.isVerified ? "verified" : "unverified",
      ),
    ),
  ]

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Ethiopian Phone Number</span>
            <Badge variant="outline" className="text-xs">
              +251 Required
            </Badge>
          </div>
          <Phone className="absolute left-3 top-10 size-5 text-gray-400" />
          <Input
            ref={phoneInputRef}
            type="tel"
            placeholder="+251 91 234 5678"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="pl-12 py-6 text-lg"
            autoFocus
            disabled={isLoading || isSearching}
          />
          {phone && !isLoading && !isSearching && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-10"
              onClick={() => setPhone("+251 ")}
            >
              <XCircle className="size-5" />
            </Button>
          )}
          {(isLoading || isSearching) && (
            <div className="absolute right-3 top-10">
              <Loader2 className="size-5 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
          >
            <AlertCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Search Results */}
        <AnimatePresence>
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          {searchResult.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {searchResult.name}
                          {searchResult.isVerified && (
                            <Badge
                              variant="outline"
                              className="h-5 text-xs border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                            >
                              <CheckCircle className="size-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {searchResult.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={addSearchResultToFavorites}
                        disabled={isSearchResultInFavorites()}
                        className={
                          isSearchResultInFavorites()
                            ? "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100"
                            : "hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                        }
                        title={
                          isSearchResultInFavorites()
                            ? "Already in favorites"
                            : "Add to favorites"
                        }
                      >
                        <Star
                          className={`size-4 ${isSearchResultInFavorites() ? "fill-yellow-400" : ""}`}
                        />
                      </Button>
                      <Button
                        onClick={() => onSelectContact(searchResult)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Select
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          disabled={isLoading || isSearching || !phone.replace(/\s/g, "")}
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Searching...
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Search className="mr-2 size-5" />
              Search Recipient
            </>
          )}
        </Button>
      </form>

      {/* Favorite Contacts Section */}
      <div className="pt-6 border-t">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            Favorite Contacts ({favoriteContacts.length})
          </h4>

          {categories.length > 1 && (
            <div className="flex items-center gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="h-8 w-[120px]">
                  <Filter className="size-3 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all"
                        ? "All"
                        : category === "verified"
                          ? "Verified"
                          : "Unverified"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Search Bar for Favorites */}
        <div className="relative mb-4">
          <Input
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled={isLoading || isSearching}
          />
          <Search className="absolute left-3 top-3 size-4 text-gray-400" />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={() => setSearchQuery("")}
            >
              <XCircle className="size-3" />
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {(isLoading || isSearching) && favoriteContacts.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <Star className="size-16 mx-auto text-gray-300 mb-4" />
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                {searchQuery
                  ? "No matching contacts"
                  : "No favorite contacts yet"}
              </h4>
              <p className="text-gray-500 text-sm mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : "Search for a recipient and add them to favorites"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 max-h-[400px] overflow-y-auto pr-2"
            >
              {sortedContacts
                .filter(
                  (contact) =>
                    selectedCategory === "all" ||
                    (selectedCategory === "verified" && contact.isVerified) ||
                    (selectedCategory === "unverified" && !contact.isVerified),
                )
                .map((contact) => (
                  <motion.div
                    key={contact.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center gap-3 flex-1"
                            onClick={() => {
                              const userContact: UserByPhoneResponse = {
                                id: contact.id,
                                name: contact.name,
                                phone: contact.phone,
                                isVerified: contact.isVerified,
                                avatar: contact.avatar,
                              }
                              onSelectContact(userContact)
                            }}
                          >
                            <Avatar>
                              {contact.avatar ? (
                                <img src={contact.avatar} alt={contact.name} />
                              ) : (
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                  {contact.name.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium flex items-center gap-2">
                                  {contact.name}
                                  <Badge
                                    variant="outline"
                                    className="h-5 text-xs border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300"
                                  >
                                    <Star className="size-3 mr-1 fill-yellow-400" />
                                    Favorite
                                  </Badge>
                                  {contact.isVerified && (
                                    <Badge
                                      variant="outline"
                                      className="h-5 text-xs border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                                    >
                                      <CheckCircle className="size-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {contact.phone}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDeleteConfirm(contact.id)
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              disabled={isLoading || isSearching}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const userContact: UserByPhoneResponse = {
                                  id: contact.id,
                                  name: contact.name,
                                  phone: contact.phone,
                                  isVerified: contact.isVerified,
                                }
                                onSelectContact(userContact)
                              }}
                              disabled={isLoading || isSearching}
                            >
                              <ChevronRight className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!showDeleteConfirm}
        onOpenChange={() => setShowDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove from Favorites</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this contact from your favorites?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Avatar>
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {favoriteContacts
                    .find((f) => f.id === showDeleteConfirm)
                    ?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {
                    favoriteContacts.find((f) => f.id === showDeleteConfirm)
                      ?.name
                  }
                </div>
                <div className="text-sm text-gray-500">
                  {
                    favoriteContacts.find((f) => f.id === showDeleteConfirm)
                      ?.phone
                  }
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
              disabled={isLoading || isSearching}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                showDeleteConfirm && removeFromFavorites(showDeleteConfirm)
              }
              disabled={isLoading || isSearching}
            >
              {isLoading || isSearching ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
