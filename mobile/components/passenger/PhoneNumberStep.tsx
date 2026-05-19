import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  Search,
  User,
  Phone,
  CheckCircle,
  XCircle,
  ChevronRight,
  Star,
  Trash2,
  AlertCircle,
  Filter,
} from "lucide-react-native"

import { getUserByPhoneNumber } from "@/service/user.api"
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
  const [favoriteContacts, setFavoriteContacts] = useState<FavoriteContact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchResult, setSearchResult] = useState<UserByPhoneResponse | null>(null)
  const [showFilterModal, setShowFilterModal] = useState(false)

  const phoneInputRef = useRef<TextInput>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Load favorite contacts from AsyncStorage on component mount
  useEffect(() => {
    loadFavoriteContacts()
  }, [currentUserId])

  const loadFavoriteContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(`favoriteContacts_${currentUserId}`)
      if (stored) {
        const favorites: FavoriteContact[] = JSON.parse(stored)
        const userFavorites = favorites.filter(
          (fav) => fav.userId === currentUserId
        )
        setFavoriteContacts(userFavorites)
      }
    } catch (error) {
      console.error("Error loading favorite contacts:", error)
      Alert.alert("Error", "Failed to load contacts")
    }
  }

  const saveFavoriteContacts = useCallback(
    async (contacts: FavoriteContact[]) => {
      try {
        const stored = await AsyncStorage.getItem(`favoriteContacts_${currentUserId}`)
        let allContacts: FavoriteContact[] = []

        if (stored) {
          allContacts = JSON.parse(stored)
          allContacts = allContacts.filter(
            (contact) => contact.userId !== currentUserId
          )
        }

        allContacts = [...allContacts, ...contacts]

        await AsyncStorage.setItem(
          `favoriteContacts_${currentUserId}`,
          JSON.stringify(allContacts)
        )
      } catch (error) {
        console.error("Error saving favorite contacts:", error)
        Alert.alert("Error", "Failed to save contacts")
      }
    },
    [currentUserId]
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

  const handleSubmit = async () => {
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
        "Please enter a valid Ethiopian phone number (+251 followed by 9 digits)"
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
        Alert.alert("Success", `User found: ${result.data.name}`)
      } else {
        Alert.alert("Not Found", result.message || "No user found with this phone number")
      }
    } catch (error) {
      console.error("Search error:", error)
      Alert.alert("Error", "Unable to search for user. Please try again.")
    } finally {
      setIsSearching(false)
      setIsLoading(false)
    }
  }

  const addSearchResultToFavorites = () => {
    if (!searchResult) return

    // Check if already in favorites
    if (isSearchResultInFavorites()) {
      Alert.alert("Info", "This contact is already in your favorites")
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

    Alert.alert("Success", `${searchResult.name} has been added to your favorites`)
  }

  const removeFromFavorites = (id: string) => {
    const updatedFavorites = favoriteContacts.filter((fav) => fav.id !== id)
    setFavoriteContacts(updatedFavorites)
    saveFavoriteContacts(updatedFavorites)
    setShowDeleteConfirm(null)

    Alert.alert("Success", "Contact has been removed from your favorites")
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
      contact.phone.includes(searchQuery)
  )

  // Sort contacts by name
  const sortedContacts = [...filteredContacts].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  // Get unique categories from contacts
  const categories = [
    "all",
    ...new Set(
      favoriteContacts.map((fav) =>
        fav.isVerified ? "verified" : "unverified"
      )
    ),
  ]

  const getFilteredByCategory = () => {
    if (selectedCategory === "all") return sortedContacts
    if (selectedCategory === "verified") {
      return sortedContacts.filter((c) => c.isVerified)
    }
    return sortedContacts.filter((c) => !c.isVerified)
  }

  return (
    <View style={{ gap: 20 }}>
      {/* Search Form */}
      <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>
            Ethiopian Phone Number
          </Text>
          <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "#f3f4f6", borderRadius: 12 }}>
            <Text style={{ fontSize: 10, color: "#6b7280" }}>+251 Required</Text>
          </View>
        </View>

        <View style={{ position: "relative" }}>
          <View style={{ position: "absolute", left: 12, top: 12, zIndex: 1 }}>
            <Phone size={20} color="#9ca3af" />
          </View>
          <TextInput
            ref={phoneInputRef}
            style={{
              borderWidth: 1,
              borderColor: error ? "#dc2626" : "#d1d5db",
              borderRadius: 8,
              padding: 12,
              paddingLeft: 40,
              fontSize: 16,
            }}
            placeholder="+251 91 234 5678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={handlePhoneChange}
            editable={!isLoading && !isSearching}
          />
          {phone !== "+251 " && !isLoading && !isSearching && (
            <TouchableOpacity
              style={{ position: "absolute", right: 12, top: 12 }}
              onPress={() => setPhone("+251 ")}
            >
              <XCircle size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
          {(isLoading || isSearching) && (
            <View style={{ position: "absolute", right: 12, top: 12 }}>
              <ActivityIndicator size="small" color="#9ca3af" />
            </View>
          )}
        </View>

        {error ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <AlertCircle size={16} color="#dc2626" />
            <Text style={{ fontSize: 13, color: "#dc2626" }}>{error}</Text>
          </View>
        ) : null}

        {/* Search Results */}
        {searchResult && (
          <View style={{ marginTop: 16, backgroundColor: "#ecfdf5", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#a7f3d0" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#a7f3d0", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#047857" }}>
                    {searchResult.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontWeight: "500", color: "#111827" }}>{searchResult.name}</Text>
                    {searchResult.isVerified && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#d1fae5", borderRadius: 12 }}>
                        <CheckCircle size={10} color="#059669" />
                        <Text style={{ fontSize: 10, color: "#059669" }}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>{searchResult.phone}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={addSearchResultToFavorites}
                  style={{ padding: 8, borderRadius: 8, backgroundColor: isSearchResultInFavorites() ? "#fef3c7" : "#f3f4f6" }}
                >
                  <Star size={16} color={isSearchResultInFavorites() ? "#eab308" : "#6b7280"} fill={isSearchResultInFavorites() ? "#eab308" : "none"} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onSelectContact(searchResult)}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: "#059669" }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading || isSearching || !phone.replace(/\s/g, "")}
          style={{
            backgroundColor: (!isLoading && !isSearching && phone.replace(/\s/g, "")) ? "#059669" : "#9ca3af",
            padding: 16,
            borderRadius: 8,
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {isSearching || isLoading ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {isSearching ? "Searching..." : "Processing..."}
              </Text>
            </>
          ) : (
            <>
              <Search size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600" }}>Search Recipient</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Favorite Contacts Section */}
      <View style={{ paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e5e7eb" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Star size={16} color="#eab308" fill="#eab308" />
            <Text style={{ fontWeight: "500", color: "#374151" }}>
              Favorite Contacts ({favoriteContacts.length})
            </Text>
          </View>

          {categories.length > 1 && (
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#f3f4f6", borderRadius: 8 }}
            >
              <Filter size={12} color="#6b7280" />
              <Text style={{ fontSize: 12, color: "#6b7280" }}>
                {selectedCategory === "all" ? "All" : selectedCategory === "verified" ? "Verified" : "Unverified"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar for Favorites */}
        <View style={{ position: "relative", marginBottom: 16 }}>
          <View style={{ position: "absolute", left: 12, top: 12, zIndex: 1 }}>
            <Search size={16} color="#9ca3af" />
          </View>
          <TextInput
            placeholder="Search favorites..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 8,
              padding: 12,
              paddingLeft: 36,
              fontSize: 14,
            }}
          />
          {searchQuery && (
            <TouchableOpacity
              style={{ position: "absolute", right: 12, top: 12 }}
              onPress={() => setSearchQuery("")}
            >
              <XCircle size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Favorite Contacts List */}
        {favoriteContacts.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Star size={64} color="#d1d5db" strokeWidth={1} />
            <Text style={{ fontWeight: "500", color: "#374151", marginTop: 16, marginBottom: 8 }}>
              {searchQuery ? "No matching contacts" : "No favorite contacts yet"}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
              {searchQuery
                ? "Try a different search term"
                : "Search for a recipient and add them to favorites"}
            </Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 400 }}>
            <View style={{ gap: 12 }}>
              {getFilteredByCategory().map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  onPress={() => {
                    const userContact: UserByPhoneResponse = {
                      id: contact.id,
                      name: contact.name,
                      phone: contact.phone,
                      isVerified: contact.isVerified,
                      avatar: contact.avatar,
                    }
                    onSelectContact(userContact)
                  }}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#a7f3d0", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#047857" }}>
                          {contact.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                          <Text style={{ fontWeight: "500", color: "#111827" }}>{contact.name}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#fef3c7", borderRadius: 12 }}>
                            <Star size={10} color="#eab308" fill="#eab308" />
                            <Text style={{ fontSize: 10, color: "#d97706" }}>Favorite</Text>
                          </View>
                          {contact.isVerified && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#d1fae5", borderRadius: 12 }}>
                              <CheckCircle size={10} color="#059669" />
                              <Text style={{ fontSize: 10, color: "#059669" }}>Verified</Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{contact.phone}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => setShowDeleteConfirm(contact.id)}
                        style={{ padding: 8 }}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          const userContact: UserByPhoneResponse = {
                            id: contact.id,
                            name: contact.name,
                            phone: contact.phone,
                            isVerified: contact.isVerified,
                          }
                          onSelectContact(userContact)
                        }}
                        style={{ padding: 8 }}
                      >
                        <ChevronRight size={16} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>Filter Contacts</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => {
                  setSelectedCategory(category)
                  setShowFilterModal(false)
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: selectedCategory === category ? "#ecfdf5" : "transparent",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: selectedCategory === category ? "#059669" : "#374151" }}>
                  {category === "all" ? "All Contacts" : category === "verified" ? "Verified Only" : "Unverified Only"}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: "#f3f4f6" }}
            >
              <Text style={{ textAlign: "center", color: "#6b7280" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(null)}
      >
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "80%", maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Remove from Favorites</Text>
            <Text style={{ color: "#6b7280", marginBottom: 16 }}>
              Are you sure you want to remove this contact from your favorites?
            </Text>
            <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end" }}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(null)}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
              >
                <Text style={{ color: "#6b7280" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => showDeleteConfirm && removeFromFavorites(showDeleteConfirm)}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: "#dc2626" }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}