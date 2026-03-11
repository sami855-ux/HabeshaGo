// components/user-dashboard/trip/ShareFlow.tsx
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  Share2,
  Ticket,
  User,
  Users,
  Star,
  XCircle,
  Filter,
  Trash2,
  ChevronRight,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface FavoriteContact {
  id: string
  name: string
  phone: string
  isVerified: boolean
  isFavorite: boolean
  createdAt: number
  userId: string
  avatar?: string
  email?: string
  friends?: boolean
}

interface ShareFlowProps {
  step: number
  phoneNumber: string
  setPhoneNumber: (phone: string) => void
  searchResults: any[]
  selectedUser: any | null
  isSearching: boolean
  searchError: string | null
  shareSuccess: boolean
  ticketData: any
  onSearch: (phone: string) => Promise<void>
  onSelectUser: (user: any) => void
  onContinueToShare: () => void
  onGoBack: () => void
  onOpenShareDialog: () => void
  currentUserId?: string
}

export function ShareFlow({
  step,
  phoneNumber,
  setPhoneNumber,
  searchResults,
  selectedUser,
  isSearching,
  searchError,
  shareSuccess,
  ticketData,
  onSearch,
  onSelectUser,
  onContinueToShare,
  onGoBack,
  onOpenShareDialog,
  currentUserId = "default",
}: ShareFlowProps) {
  const [favoriteContacts, setFavoriteContacts] = useState<FavoriteContact[]>(
    [],
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  )
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState("")
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)

  const phoneInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Load favorite contacts from localStorage
  useEffect(() => {
    loadFavoriteContacts()
  }, [currentUserId])

  const loadFavoriteContacts = () => {
    setIsLoadingFavorites(true)
    try {
      const stored = localStorage.getItem(`favoriteContacts_${currentUserId}`)
      if (stored) {
        const favorites: FavoriteContact[] = JSON.parse(stored)
        setFavoriteContacts(favorites)
      }
    } catch (error) {
      console.error("Error loading favorite contacts:", error)
      toast.error("Failed to load contacts")
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  const saveFavoriteContacts = useCallback(
    (contacts: FavoriteContact[]) => {
      try {
        localStorage.setItem(
          `favoriteContacts_${currentUserId}`,
          JSON.stringify(contacts),
        )
        setFavoriteContacts(contacts)
      } catch (error) {
        console.error("Error saving favorite contacts:", error)
        toast.error("Failed to save contacts")
      }
    },
    [currentUserId],
  )

  const addToFavorites = (user: any) => {
    // Check if already in favorites
    if (favoriteContacts.some((fav) => fav.id === user.id)) {
      toast.info("Already in favorites", {
        description: "This contact is already in your favorites",
      })
      return
    }

    const newFavorite: FavoriteContact = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      isVerified: user.isVerified || false,
      isFavorite: true,
      createdAt: Date.now(),
      userId: currentUserId,
      email: user.email,
      friends: user.friends,
    }

    const updatedFavorites = [...favoriteContacts, newFavorite]
    saveFavoriteContacts(updatedFavorites)

    toast.success("Added to favorites", {
      description: `${user.name} has been added to your favorites`,
    })
  }

  const removeFromFavorites = (id: string) => {
    const updatedFavorites = favoriteContacts.filter((fav) => fav.id !== id)
    saveFavoriteContacts(updatedFavorites)
    setShowDeleteConfirm(null)

    toast.success("Contact removed", {
      description: "Contact has been removed from your favorites.",
    })
  }

  const isInFavorites = (userId: string) => {
    return favoriteContacts.some((fav) => fav.id === userId)
  }

  const handlePhoneChange = (value: string) => {
    // Ensure the number starts with +251
    if (!value.startsWith("+251")) {
      setPhoneNumber("+251 ")
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

      setPhoneNumber(formatted)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(phoneNumber)
  }

  // Debounced search for favorites
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Filtering is handled in filteredFavorites
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [favoritesSearchQuery])

  // Filter favorites based on search
  const filteredFavorites = favoriteContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(favoritesSearchQuery.toLowerCase()) ||
      contact.phone.includes(favoritesSearchQuery),
  )

  // Sort favorites by name
  const sortedFavorites = [...filteredFavorites].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  // Get unique categories
  const categories = [
    "all",
    ...new Set(
      favoriteContacts.map((fav) =>
        fav.isVerified ? "verified" : "unverified",
      ),
    ),
  ]

  return (
    <Card className="rounded-3xl shadow-xl border-0 overflow-hidden sticky top-24">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-b">
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="h-5 w-5 text-orange-500" />
          Share with Friend
        </CardTitle>
        <CardDescription>
          {step === 1 &&
            "Search for a user by phone number or select from favorites"}
          {step === 2 && "Confirm the user you want to share with"}
          {step === 3 && "Review and confirm sharing details"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Search User */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Phone Number Search Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">
                      Ethiopian Phone Number
                    </span>
                    <Badge variant="outline" className="text-xs">
                      +251 Required
                    </Badge>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 size-5 text-gray-400" />
                    <Input
                      ref={phoneInputRef}
                      type="tel"
                      placeholder="+251 91 234 5678"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="pl-12 py-6 text-lg rounded-xl border-2 focus:border-orange-300"
                      disabled={isSearching}
                    />
                    {phoneNumber && phoneNumber !== "+251 " && !isSearching && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-3"
                        onClick={() => setPhoneNumber("+251 ")}
                      >
                        <XCircle className="size-5 text-gray-400" />
                      </Button>
                    )}
                    {isSearching && (
                      <div className="absolute right-3 top-3">
                        <Loader2 className="size-5 animate-spin text-orange-500" />
                      </div>
                    )}
                  </div>
                </div>

                {searchError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle className="size-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {searchError}
                    </p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={isSearching || !phoneNumber.replace(/\s/g, "")}
                  className="w-full py-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 size-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 size-5" />
                      Search Recipient
                    </>
                  )}
                </Button>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <p className="text-sm font-medium text-gray-500">
                    Search Results ({searchResults.length})
                  </p>
                  {searchResults.map((user: any) => {
                    const isFavorite = isInFavorites(user.id)
                    return (
                      <motion.div
                        key={user.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
                      >
                        <div
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => onSelectUser(user)}
                        >
                          <Avatar className="h-12 w-12 border-2 border-orange-200">
                            <AvatarFallback className="bg-orange-100 text-orange-600">
                              {user.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.name}</p>
                              {user.isVerified && (
                                <Badge
                                  variant="outline"
                                  className="h-5 text-xs border-emerald-200 text-emerald-700 bg-emerald-50"
                                >
                                  <CheckCircle className="size-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {user.phone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full hover:bg-yellow-50 hover:text-yellow-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToFavorites(user)
                            }}
                            disabled={isFavorite}
                          >
                            <Star
                              className={cn(
                                "size-5",
                                isFavorite
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "",
                              )}
                            />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onSelectUser(user)}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            Select
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* Favorite Contacts Section */}
              <div className="pt-4 border-t">
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
                        <SelectTrigger className="h-8 w-[120px] rounded-lg">
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

                {/* Search Favorites */}
                <div className="relative mb-4">
                  <Input
                    placeholder="Search favorites..."
                    value={favoritesSearchQuery}
                    onChange={(e) => setFavoritesSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl border-2 focus:border-orange-300"
                    disabled={isSearching || isLoadingFavorites}
                  />
                  <Search className="absolute left-3 top-3.5 size-4 text-gray-400" />
                  {favoritesSearchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2.5 h-6 w-6"
                      onClick={() => setFavoritesSearchQuery("")}
                    >
                      <XCircle className="size-4" />
                    </Button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {isLoadingFavorites ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4"
                        >
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[150px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : sortedFavorites.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <Star className="size-12 mx-auto text-gray-300 mb-3" />
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {favoritesSearchQuery
                          ? "No matching contacts"
                          : "No favorite contacts yet"}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {favoritesSearchQuery
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
                      {sortedFavorites
                        .filter(
                          (contact) =>
                            selectedCategory === "all" ||
                            (selectedCategory === "verified" &&
                              contact.isVerified) ||
                            (selectedCategory === "unverified" &&
                              !contact.isVerified),
                        )
                        .map((contact) => (
                          <motion.div
                            key={contact.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                          >
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <div
                                  className="flex items-center gap-3 flex-1 cursor-pointer"
                                  onClick={() => onSelectUser(contact)}
                                >
                                  <Avatar className="h-12 w-12 border-2 border-orange-200">
                                    {contact.avatar ? (
                                      <img
                                        src={contact.avatar}
                                        alt={contact.name}
                                      />
                                    ) : (
                                      <AvatarFallback className="bg-orange-100 text-orange-600">
                                        {contact.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-medium">
                                        {contact.name}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="h-5 text-xs border-yellow-200 text-yellow-700 bg-yellow-50"
                                      >
                                        <Star className="size-3 mr-1 fill-yellow-400" />
                                        Favorite
                                      </Badge>
                                      {contact.isVerified && (
                                        <Badge
                                          variant="outline"
                                          className="h-5 text-xs border-emerald-200 text-emerald-700 bg-emerald-50"
                                        >
                                          <CheckCircle className="size-3 mr-1" />
                                          Verified
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      {contact.phone}
                                    </p>
                                    {contact.email && (
                                      <p className="text-xs text-gray-400">
                                        {contact.email}
                                      </p>
                                    )}
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
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onSelectUser(contact)}
                                    className="hover:bg-orange-50 hover:text-orange-600"
                                  >
                                    <ChevronRight className="size-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select User */}
          {step === 2 && selectedUser && (
            <Step2Confirm
              key="step2"
              selectedUser={selectedUser}
              onGoBack={onGoBack}
              onContinue={onContinueToShare}
              onAddToFavorites={addToFavorites}
              isInFavorites={isInFavorites(selectedUser.id)}
            />
          )}

          {/* Step 3: Confirm Share */}
          {step === 3 && selectedUser && (
            <Step3Confirm
              key="step3"
              selectedUser={selectedUser}
              ticketData={ticketData}
              onGoBack={onGoBack}
              onOpenShareDialog={onOpenShareDialog}
            />
          )}
        </AnimatePresence>
      </CardContent>

      {/* Success State */}
      {shareSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              Ticket Shared Successfully!
            </h3>
            <p className="text-gray-600 mb-2">
              The ticket has been shared with {selectedUser?.name}.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              They'll receive a notification and can access it immediately.
            </p>
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to your trips...
            </p>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!showDeleteConfirm}
        onOpenChange={() => setShowDeleteConfirm(null)}
      >
        <DialogContent className="rounded-3xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              Remove from Favorites
            </DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to remove this contact from your favorites?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Avatar>
                <AvatarFallback className="bg-orange-100 text-orange-600">
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
          <DialogFooter className="flex gap-3 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                showDeleteConfirm && removeFromFavorites(showDeleteConfirm)
              }
              className="rounded-full px-6"
            >
              <Trash2 className="mr-2 size-4" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Step 2: Confirm User Component
function Step2Confirm({
  selectedUser,
  onGoBack,
  onContinue,
  onAddToFavorites,
  isInFavorites,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">User Found</h3>
        <p className="text-sm text-gray-500 mt-1">
          Is this the person you want to share your ticket with?
        </p>
      </div>

      <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-orange-100">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-3 border-orange-200">
            <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">
              {selectedUser.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{selectedUser.name}</p>
              {selectedUser.isVerified && (
                <Badge
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 bg-emerald-50"
                >
                  <CheckCircle className="size-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="h-4 w-4 text-gray-400" />
              <p className="text-gray-600">{selectedUser.phone}</p>
            </div>
            {selectedUser.email && (
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-yellow-50 hover:text-yellow-600"
            onClick={() => onAddToFavorites(selectedUser)}
            disabled={isInFavorites}
          >
            <Star
              className={cn(
                "size-6",
                isInFavorites ? "fill-yellow-400 text-yellow-400" : "",
              )}
            />
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onGoBack}
          className="flex-1 rounded-xl h-12 border-2"
        >
          No, Go Back
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 rounded-xl h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
        >
          Yes, Continue
        </Button>
      </div>
    </motion.div>
  )
}

// Step 3: Confirm Share Component
function Step3Confirm({
  selectedUser,
  ticketData,
  onGoBack,
  onOpenShareDialog,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-2xl border-2 border-orange-200">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
          <Share2 className="h-5 w-5 text-orange-500" />
          Sharing Summary
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Ticket className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Ticket</p>
              <p className="font-medium">
                {ticketData.route.origin} → {ticketData.route.destination}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {ticketData.date} • {ticketData.departureTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Sharing with</p>
              <p className="font-medium">{selectedUser.name}</p>
              <p className="text-xs text-gray-500">{selectedUser.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200">
        <p className="text-sm text-amber-800 dark:text-amber-400 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <span>
            <span className="font-semibold">Important:</span> Once shared, the
            ticket will be transferred to {selectedUser.name}. You will no
            longer be able to use or modify this ticket.
          </span>
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onGoBack}
          className="flex-1 rounded-xl h-12 border-2"
        >
          Back
        </Button>
        <Button
          onClick={onOpenShareDialog}
          className="flex-1 rounded-xl h-12 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/30"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Ticket
        </Button>
      </div>
    </motion.div>
  )
}

// Helper function for classnames
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
