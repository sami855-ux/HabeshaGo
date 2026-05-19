// ShareFlow.tsx
import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Modal,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
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
  Star,
  XCircle,
  Trash2,
  ChevronRight,
  Users,
  Heart,
  Sparkles,
} from "lucide-react-native"
import { Checkbox } from "expo-checkbox"

interface Ticket {
  id: number
  seatNumber: number
  boardingStop: string
  alightingStop: string
  checkedIn: boolean
  sharedToId: string | null
}

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
  ticketData: {
    id: number
    tickets: Ticket[]
    bus?: { busNumber: string }
    date: string
    boardingStop: string
    alightingStop: string
  }
  onSearch: (phone: string) => Promise<void>
  onSelectUser: (user: any) => void
  onContinueToShare: () => void
  onGoBack: () => void
  onOpenShareDialog: () => void
  currentUserId?: string
  selectedTickets: number[]
  setSelectedTickets: React.Dispatch<React.SetStateAction<number[]>>
}

const STORAGE_KEY = "@favorite_contacts"

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
  selectedTickets,
  setSelectedTickets,
}: ShareFlowProps) {
  const [favoriteContacts, setFavoriteContacts] = useState<FavoriteContact[]>(
    [],
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  )
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState("")
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current
  const phoneInputRef = useRef<TextInput>(null)

  const availableTickets =
    ticketData.tickets?.filter(
      (ticket) => !ticket.sharedToId && !ticket.checkedIn,
    ) || []

  const sharedTickets =
    ticketData.tickets?.filter((ticket) => ticket.sharedToId) || []
  const checkedInTickets =
    ticketData.tickets?.filter((ticket) => ticket.checkedIn) || []

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
    loadFavoriteContacts()
  }, [currentUserId])

  useEffect(() => {
    setLocalPhoneNumber(phoneNumber)
  }, [phoneNumber])

  const loadFavoriteContacts = async () => {
    setIsLoadingFavorites(true)
    try {
      const key = `${STORAGE_KEY}_${currentUserId}`
      const stored = await AsyncStorage.getItem(key)
      if (stored) {
        setFavoriteContacts(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading favorite contacts:", error)
    } finally {
      setIsLoadingFavorites(false)
    }
  }

  const saveFavoriteContacts = useCallback(
    async (contacts: FavoriteContact[]) => {
      try {
        const key = `${STORAGE_KEY}_${currentUserId}`
        await AsyncStorage.setItem(key, JSON.stringify(contacts))
        setFavoriteContacts(contacts)
      } catch (error) {
        console.error("Error saving favorite contacts:", error)
        Alert.alert("Error", "Failed to save favorite contacts")
      }
    },
    [currentUserId],
  )

  const addToFavorites = async (user: any) => {
    if (favoriteContacts.some((fav) => fav.id === user.id)) {
      Alert.alert(
        "Already in favorites",
        "This contact is already in your favorites",
      )
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

    await saveFavoriteContacts([...favoriteContacts, newFavorite])
    Alert.alert(
      "Added to favorites",
      `${user.name} has been added to your favorites`,
    )
  }

  const removeFromFavorites = async (id: string) => {
    await saveFavoriteContacts(favoriteContacts.filter((fav) => fav.id !== id))
    setShowDeleteConfirm(null)
    Alert.alert(
      "Contact removed",
      "Contact has been removed from your favorites.",
    )
  }

  const isInFavorites = (userId: string) =>
    favoriteContacts.some((fav) => fav.id === userId)

  const handlePhoneChange = (value: string) => {
    let digits = value.replace(/[^\d+]/g, "")

    if (!digits.startsWith("+251")) {
      if (digits.startsWith("251")) {
        digits = "+" + digits
      } else if (digits.startsWith("0")) {
        digits = "+251" + digits.slice(1)
      } else if (digits.length > 0 && !digits.startsWith("+")) {
        digits = "+251" + digits
      } else if (digits === "") {
        digits = "+251"
      }
    }

    let phoneDigits = digits.slice(4).replace(/\D/g, "")
    if (phoneDigits.length > 9) {
      phoneDigits = phoneDigits.slice(0, 9)
    }

    let formatted = "+251"
    if (phoneDigits.length > 0) {
      formatted += " " + phoneDigits.slice(0, 2)
    }
    if (phoneDigits.length > 2) {
      formatted += " " + phoneDigits.slice(2, 5)
    }
    if (phoneDigits.length > 5) {
      formatted += " " + phoneDigits.slice(5, 9)
    }

    setLocalPhoneNumber(formatted.trim())
    setPhoneNumber(formatted.trim())
  }

  const handleSearchPress = () => {
    Keyboard.dismiss()
    onSearch(localPhoneNumber)
  }

  const handleToggleTicket = (ticketId: number) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId],
    )
  }

  const handleSelectAll = () => {
    if (selectedTickets.length === availableTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(availableTickets.map((t) => t.id))
    }
  }

  const filteredFavorites = favoriteContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(favoritesSearchQuery.toLowerCase()) ||
      contact.phone.includes(favoritesSearchQuery),
  )

  const isSearchDisabled =
    isSearching ||
    !localPhoneNumber.replace(/\s/g, "") ||
    localPhoneNumber === "+251"

  const Step1Content = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* Header with gradient */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center">
              <Ticket size={16} color="#f97316" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              Select Tickets
            </Text>
          </View>
          <Text className="text-sm text-gray-500 ml-10">
            Choose which tickets you want to share
          </Text>
        </View>

        {/* Ticket Summary Cards */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <Text className="text-xs text-green-600 font-medium mb-1">
              Available
            </Text>
            <Text className="text-2xl font-bold text-green-700">
              {availableTickets.length}
            </Text>
          </View>
          <View className="flex-1 p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl border border-purple-100">
            <Text className="text-xs text-purple-600 font-medium mb-1">
              Shared
            </Text>
            <Text className="text-2xl font-bold text-purple-700">
              {sharedTickets.length}
            </Text>
          </View>
          <View className="flex-1 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
            <Text className="text-xs text-blue-600 font-medium mb-1">
              Checked In
            </Text>
            <Text className="text-2xl font-bold text-blue-700">
              {checkedInTickets.length}
            </Text>
          </View>
        </View>

        {/* Ticket List */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3 px-1">
            <Text className="text-sm font-semibold text-gray-700">
              Your Tickets
            </Text>
            {availableTickets.length > 0 && (
              <TouchableOpacity onPress={handleSelectAll}>
                <Text className="text-sm font-medium text-orange-500">
                  {selectedTickets.length === availableTickets.length
                    ? "Deselect All"
                    : "Select All"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
            <View className="space-y-3">
              {availableTickets.length === 0 ? (
                <View className="py-12 bg-gray-50 rounded-2xl items-center border border-gray-100">
                  <Ticket size={48} color="#d1d5db" />
                  <Text className="text-base font-medium text-gray-500 mt-3">
                    No tickets available
                  </Text>
                  <Text className="text-sm text-gray-400 mt-1">
                    All tickets have been shared or checked in
                  </Text>
                </View>
              ) : (
                availableTickets.map((ticket, index) => (
                  <TouchableOpacity
                    key={ticket.id}
                    activeOpacity={0.7}
                    onPress={() => handleToggleTicket(ticket.id)}
                    className={`rounded-2xl p-4 border-2 transition-all ${
                      selectedTickets.includes(ticket.id)
                        ? "border-orange-400 bg-orange-50 shadow-md"
                        : "border-gray-100 bg-white shadow-sm"
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <Checkbox
                        value={selectedTickets.includes(ticket.id)}
                        onValueChange={() => handleToggleTicket(ticket.id)}
                        color={
                          selectedTickets.includes(ticket.id)
                            ? "#f97316"
                            : undefined
                        }
                      />
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <Text className="font-semibold text-gray-900">
                            Ticket #{index + 1}
                          </Text>
                          <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-xs font-medium text-green-700">
                              Available
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center gap-3 mt-2">
                          <Text className="text-sm text-gray-600">
                            Seat {ticket.seatNumber}
                          </Text>
                          <View className="w-1 h-1 rounded-full bg-gray-300" />
                          <Text className="text-sm text-gray-600">
                            ID: #{String(ticket.id).padStart(4, "0")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        </View>

        {sharedTickets.length > 0 && (
          <View className="flex-row items-center gap-2 p-3 bg-purple-50 rounded-xl mb-6 border border-purple-100">
            <Share2 size={16} color="#9333ea" />
            <Text className="text-sm text-purple-700 flex-1">
              {sharedTickets.length} ticket(s) have already been shared
            </Text>
          </View>
        )}

        {/* Divider */}
        <View className="flex-row items-center gap-3 my-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-xs font-medium text-gray-400">
            RECIPIENT DETAILS
          </Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Phone Number Input */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Phone size={18} color="#f97316" />
            <Text className="text-sm font-semibold text-gray-700">
              Phone Number
            </Text>
            <View className="bg-gray-100 px-2 py-1 rounded-full">
              <Text className="text-xs text-gray-500">+251 Required</Text>
            </View>
          </View>

          <View className="relative">
            <View className="absolute left-4 top-4 z-10">
              <Phone size={20} color="#9ca3af" />
            </View>
            <TextInput
              ref={phoneInputRef}
              placeholder="+251 91 234 5678"
              value={localPhoneNumber}
              onChangeText={handlePhoneChange}
              className="pl-12 pr-12 py-4 text-base rounded-2xl border-2 border-gray-200 bg-white"
              keyboardType="phone-pad"
              returnKeyType="search"
              onSubmitEditing={handleSearchPress}
              placeholderTextColor="#9ca3af"
            />
            {localPhoneNumber &&
              localPhoneNumber !== "+251" &&
              !isSearching && (
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => {
                    setLocalPhoneNumber("+251")
                    setPhoneNumber("+251")
                  }}
                >
                  <XCircle size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            {isSearching && (
              <View className="absolute right-4 top-4">
                <ActivityIndicator size="small" color="#f97316" />
              </View>
            )}
          </View>

          {selectedTickets.length === 0 && (
            <View className="flex-row items-center gap-2 mt-3 px-1">
              <AlertCircle size={14} color="#f59e0b" />
              <Text className="text-xs text-amber-600">
                You can search for a recipient before selecting tickets
              </Text>
            </View>
          )}
        </View>

        {searchError && (
          <View className="flex-row items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200 mb-6">
            <AlertCircle size={20} color="#dc2626" />
            <Text className="flex-1 text-red-600 text-sm">{searchError}</Text>
          </View>
        )}

        {/* Search Button */}
        <TouchableOpacity
          onPress={handleSearchPress}
          disabled={isSearchDisabled}
          className={`py-4 rounded-2xl flex-row items-center justify-center mb-6 ${
            isSearchDisabled
              ? "bg-gray-200"
              : "bg-gradient-to-r from-orange-500 to-amber-500"
          }`}
          style={{
            shadowColor: "#f97316",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {isSearching ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white font-semibold ml-2">
                Searching...
              </Text>
            </>
          ) : (
            <>
              <Search size={20} color="#fff" />
              <Text className="text-black font-semibold ml-2">
                Search Recipient
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Users size={16} color="#f97316" />
              <Text className="text-sm font-semibold text-gray-700">
                Search Results ({searchResults.length})
              </Text>
            </View>
            {searchResults.map((user) => {
              const isFavorite = isInFavorites(user.id)
              return (
                <View
                  key={user.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 shadow-sm"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 items-center justify-center shadow-md">
                      <Text className="text-white font-bold text-lg">
                        {user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Text className="font-semibold text-gray-900 text-base">
                          {user.name}
                        </Text>
                        {user.isVerified && (
                          <View className="bg-emerald-50 px-2 py-1 rounded-full flex-row items-center">
                            <CheckCircle size={12} color="#10b981" />
                            <Text className="text-xs text-emerald-700 ml-1">
                              Verified
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-gray-500 mt-1">
                        {user.phone}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        className="w-10 h-10 rounded-full items-center justify-center bg-gray-50"
                        onPress={() => addToFavorites(user)}
                        disabled={isFavorite}
                      >
                        <Heart
                          size={18}
                          color={isFavorite ? "#f97316" : "#9ca3af"}
                          fill={isFavorite ? "#f97316" : "none"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onSelectUser(user)}
                        className="bg-orange-500 px-4 py-2 rounded-xl"
                      >
                        <Text className="text-white text-sm font-medium">
                          Select
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* Favorite Contacts */}
        <View>
          <View className="flex-row items-center gap-2 mb-3">
            <Heart size={16} color="#f97316" fill="#f97316" />
            <Text className="text-sm font-semibold text-gray-700">
              Favorite Contacts ({favoriteContacts.length})
            </Text>
          </View>

          <View className="relative mb-4">
            <Search
              size={16}
              color="#9ca3af"
              style={{ position: "absolute", left: 12, top: 12, zIndex: 1 }}
            />
            <TextInput
              placeholder="Search favorites..."
              value={favoritesSearchQuery}
              onChangeText={setFavoritesSearchQuery}
              className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {isLoadingFavorites ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#f97316" />
              <Text className="text-sm text-gray-500 mt-3">
                Loading contacts...
              </Text>
            </View>
          ) : filteredFavorites.length === 0 ? (
            <View className="py-12 items-center bg-gray-50 rounded-2xl">
              <Sparkles size={48} color="#d1d5db" />
              <Text className="font-medium text-gray-700 mt-3">
                {favoritesSearchQuery
                  ? "No matching contacts"
                  : "No favorites yet"}
              </Text>
              <Text className="text-sm text-gray-400 mt-1 text-center px-6">
                {favoritesSearchQuery
                  ? "Try a different search term"
                  : "Search for someone and tap the heart icon to add them"}
              </Text>
            </View>
          ) : (
            <ScrollView
              className="max-h-96"
              showsVerticalScrollIndicator={false}
            >
              <View className="space-y-3">
                {filteredFavorites.map((contact) => (
                  <View
                    key={contact.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between">
                      <TouchableOpacity
                        className="flex-row items-center gap-3 flex-1"
                        onPress={() => onSelectUser(contact)}
                      >
                        <View className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 items-center justify-center">
                          <Text className="text-white font-bold text-base">
                            {contact.name.charAt(0)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2 flex-wrap">
                            <Text className="font-semibold text-gray-900">
                              {contact.name}
                            </Text>
                            <View className="bg-yellow-50 px-2 py-0.5 rounded-full flex-row items-center">
                              <Star size={10} color="#fbbf24" fill="#fbbf24" />
                              <Text className="text-xs text-yellow-700 ml-1">
                                Favorite
                              </Text>
                            </View>
                            {contact.isVerified && (
                              <View className="bg-emerald-50 px-2 py-0.5 rounded-full flex-row items-center">
                                <CheckCircle size={10} color="#10b981" />
                                <Text className="text-xs text-emerald-700 ml-1">
                                  Verified
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-sm text-gray-500 mt-1">
                            {contact.phone}
                          </Text>
                          {contact.email && (
                            <Text className="text-xs text-gray-400 mt-0.5">
                              {contact.email}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="w-10 h-10 rounded-full items-center justify-center bg-red-50"
                        onPress={() => setShowDeleteConfirm(contact.id)}
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Delete Confirmation Modal */}
        <Modal visible={!!showDeleteConfirm} transparent animationType="fade">
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-3">
                  <Trash2 size={32} color="#ef4444" />
                </View>
                <Text className="text-xl font-bold text-gray-900 text-center">
                  Remove Contact
                </Text>
                <Text className="text-center text-gray-500 mt-2">
                  Are you sure you want to remove this contact from your
                  favorites?
                </Text>
              </View>
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl border border-gray-300"
                  onPress={() => setShowDeleteConfirm(null)}
                >
                  <Text className="text-center text-gray-700 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-red-500"
                  onPress={() =>
                    showDeleteConfirm && removeFromFavorites(showDeleteConfirm)
                  }
                >
                  <Text className="text-center text-white font-medium">
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </TouchableWithoutFeedback>
  )

  const Step2Content = () => (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <View className="items-center mb-6">
        <View className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 items-center justify-center mb-4 shadow-lg">
          <CheckCircle size={48} color="#fff" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">User Found!</Text>
        <Text className="text-sm text-gray-500 mt-2 text-center">
          Is this the person you want to share your ticket with?
        </Text>
      </View>

      <View className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-orange-100 p-6 mb-6 shadow-md">
        <View className="flex-row items-center gap-4">
          <View className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 items-center justify-center shadow-md">
            <Text className="text-2xl text-white font-bold">
              {selectedUser?.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2 flex-wrap mb-1">
              <Text className="text-xl font-bold text-gray-900">
                {selectedUser?.name}
              </Text>
              {selectedUser?.isVerified && (
                <View className="bg-emerald-50 px-2 py-1 rounded-full flex-row items-center">
                  <CheckCircle size={12} color="#10b981" />
                  <Text className="text-xs text-emerald-700 ml-1">
                    Verified
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-2 mt-1">
              <Phone size={14} color="#9ca3af" />
              <Text className="text-sm text-gray-600">
                {selectedUser?.phone}
              </Text>
            </View>
            {selectedUser?.email && (
              <View className="flex-row items-center gap-2 mt-1">
                <Mail size={14} color="#9ca3af" />
                <Text className="text-sm text-gray-500">
                  {selectedUser?.email}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center bg-orange-50"
            onPress={() => addToFavorites(selectedUser)}
            disabled={isInFavorites(selectedUser?.id)}
          >
            <Heart
              size={20}
              color={isInFavorites(selectedUser?.id) ? "#f97316" : "#9ca3af"}
              fill={isInFavorites(selectedUser?.id) ? "#f97316" : "none"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onGoBack}
          className="flex-1 py-4 rounded-xl border-2 border-gray-200 items-center bg-white"
        >
          <Text className="text-gray-700 font-semibold">No, Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onContinueToShare}
          className="flex-1 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 items-center shadow-md"
        >
          <Text className="text-white font-semibold">Yes, Continue</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  const Step3Content = () => {
    const allTickets = ticketData.tickets || []
    const boardingStop = allTickets[0]?.boardingStop || "Unknown"
    const alightingStop = allTickets[0]?.alightingStop || "Unknown"
    const selectedTicketsDetails = availableTickets.filter((ticket) =>
      selectedTickets.includes(ticket.id),
    )

    return (
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <View className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-6 border-2 border-orange-200">
          <Text className="font-bold text-xl text-gray-900 mb-4">
            Sharing Summary
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-center gap-3 p-3 bg-white rounded-xl">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
                <Ticket size={20} color="#ea580c" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 font-medium">Route</Text>
                <Text className="font-semibold text-gray-900">
                  {boardingStop} → {alightingStop}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {ticketData.date}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 p-3 bg-white rounded-xl">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
                <User size={20} color="#ea580c" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 font-medium">
                  Recipient
                </Text>
                <Text className="font-semibold text-gray-900">
                  {selectedUser?.name}
                </Text>
                <Text className="text-xs text-gray-500">
                  {selectedUser?.phone}
                </Text>
              </View>
            </View>

            <View className="p-3 bg-white rounded-xl">
              <Text className="text-xs text-gray-500 font-medium mb-2">
                Tickets ({selectedTickets.length})
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedTicketsDetails.map((ticket) => (
                  <View
                    key={ticket.id}
                    className="bg-orange-100 px-3 py-1 rounded-full"
                  >
                    <Text className="text-xs font-medium text-orange-700">
                      Seat {ticket.seatNumber}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
          <AlertCircle size={20} color="#d97706" />
          <Text className="flex-1 text-sm text-amber-800">
            <Text className="font-bold">Important:</Text> Once shared, the
            selected ticket
            {selectedTickets.length > 1 ? "s" : ""} will be transferred to{" "}
            {selectedUser?.name}. You will no longer be able to use or modify
            these tickets.
          </Text>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onGoBack}
            className="flex-1 py-4 rounded-xl border-2 border-gray-200 items-center bg-white"
          >
            <Text className="text-gray-700 font-semibold">Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onOpenShareDialog}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 items-center shadow-md flex-row justify-center gap-2"
          >
            <Share2 size={18} color="#fff" />
            <Text className="text-white font-semibold">
              Share {selectedTickets.length} Ticket
              {selectedTickets.length > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    )
  }

  return (
    <View className="flex-1 bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <View className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
        <Text className="text-xl font-bold text-white">Share with Friend</Text>
        <Text className="text-sm text-orange-100 mt-1">
          {step === 1 && "Select tickets and search for a recipient"}
          {step === 2 && "Confirm the person to share with"}
          {step === 3 && "Review and complete the share"}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && <Step1Content />}
        {step === 2 && selectedUser && <Step2Content />}
        {step === 3 && selectedUser && <Step3Content />}
      </ScrollView>

      {/* Success Overlay */}
      {shareSuccess && (
        <View className="absolute inset-0 bg-white/95 items-center justify-center p-6">
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6 shadow-lg">
              <CheckCircle size={48} color="#10b981" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              Shared Successfully! 🎉
            </Text>
            <Text className="text-gray-600 text-center mb-2">
              {selectedTickets.length} ticket
              {selectedTickets.length > 1 ? "s have" : " has"} been shared with{" "}
              {selectedUser?.name}
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-6">
              They'll receive a notification and can access it immediately
            </Text>
            <View className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full" />
            <Text className="text-sm text-gray-500 mt-4">
              Redirecting to your trips...
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
