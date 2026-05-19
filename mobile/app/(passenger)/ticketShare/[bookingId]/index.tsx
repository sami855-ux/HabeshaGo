// TicketSharePage.tsx
import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  StatusBar,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, Headset, Shield, Loader2 } from "lucide-react-native"
import { useAppSelector } from "@/store"
import { getUserByPhoneNumber } from "@/service/user.api"
import { getBooking, shareBookingRequest } from "@/service/booking.api"

// import { ShareHeader } from './ShareHeader'
// import { TicketPreview } from './TicketPreview'
// import { ShareFlow } from './ShareFlow'
// import { ShareConfirmationDialog } from './ShareConfirmationDialog'
// import { StepProgress } from './StepProgress'
import { ShareHeader } from "@/components/passenger/ShareHeader"
import { StepProgress } from "@/components/passenger/StepProgress"
import { TicketPreview } from "@/components/passenger/TicketPreview"
import { ShareFlow } from "@/components/passenger/ShareFlow"
import { ShareConfirmationDialog } from "@/components/passenger/ShareConfirmationDialog"

export default function TicketSharePage() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const bookingId = params.bookingId as string
  const { user } = useAppSelector((store) => store.user)
  const queryClient = useQueryClient()

  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("+251 ")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedTickets, setSelectedTickets] = useState<number[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [ticketData, setTicketData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [])

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      setIsLoading(true)
      try {
        const data = await getBooking(bookingId)
        if (data && Object.keys(data).length > 0) {
          setTicketData(data)
        } else {
          Alert.alert("Error", "Booking not found")
          router.push("/my-booking")
        }
      } catch (error) {
        console.error("Error fetching booking:", error)
        Alert.alert("Error", "Failed to load booking details")
        router.push("/my-booking")
      } finally {
        setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId, router])

  // Handle search with proper phone number validation
  const handleSearch = async (phone: string) => {
    setSearchError(null)
    setSearchResults([])

    const cleanedPhone = phone.replace(/\s/g, "")

    if (!cleanedPhone.trim()) {
      setSearchError("Please enter a phone number")
      return
    }

    const ethiopianPhoneRegex = /^\+251(9[0-9]|7[1-9]|7[0-5])[0-9]{7}$/
    if (!ethiopianPhoneRegex.test(cleanedPhone)) {
      setSearchError(
        "Please enter a valid Ethiopian phone number (+251 followed by 9 digits)",
      )
      return
    }

    const phoneForApi = cleanedPhone.slice(1)
    setIsSearching(true)

    try {
      const result = await getUserByPhoneNumber(phoneForApi)

      if (result.success && result.data) {
        const foundUser = {
          id: result.data.id,
          name: result.data.name,
          phone: result.data.phone,
          email: result.data.email,
          isVerified: result.data.isVerified || false,
          avatar: result.data.avatar,
          friends: result.data.friends || false,
        }
        setSearchResults([foundUser])
      } else {
        setSearchError(result.message || "No user found with this phone number")
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchError("Unable to search for user. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setStep(2)
  }

  const handleContinueToShare = () => {
    setStep(3)
  }

  const handleShare = async () => {
    setIsSharing(true)
    setShowSuccess(false)

    try {
      const res = await shareBookingRequest(
        bookingId,
        selectedUser.id,
        selectedTickets,
      )

      if (res.success) {
        setShareSuccess(true)
        setShowSuccess(true)

        setTimeout(() => {
          router.push("/my-booking")
        }, 3000)

        queryClient.invalidateQueries({ queryKey: ["user_bookings"] })
      } else {
        Alert.alert("Share Failed", res.message || "Failed to share the ticket")
      }

      setTimeout(() => {
        setIsSharing(false)
        setShowShareDialog(false)
        setShowSuccess(false)
      }, 1500)
    } catch (error) {
      console.error("Share error:", error)
      setIsSharing(false)
      Alert.alert("Share Failed", "Unable to share ticket. Please try again.")
    }
  }

  const handleGoBack = () => {
    if (step > 1) {
      setStep(1)
      if (step === 3) {
        setSelectedUser(null)
        setStep(1)
      }
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-sm text-gray-500">
          Loading booking details...
        </Text>
      </SafeAreaView>
    )
  }

  if (!ticketData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-base text-gray-500">Booking not found</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50  pt-10">
      <StatusBar barStyle={"dark-content"} />
      <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
        <ShareHeader onBack={() => router.back()} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="px-4 py-6">
            <StepProgress currentStep={step} />

            <View className="flex-row flex-wrap gap-5">
              {/* Left Column - Ticket Preview */}
              <View className="flex-1 min-w-[350px]">
                <TicketPreview ticket={ticketData} />
              </View>

              {/* Right Column - Share Flow */}
              <View className="flex-1 min-w-[350px]">
                <ShareFlow
                  step={step}
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  searchResults={searchResults}
                  selectedUser={selectedUser}
                  isSearching={isSearching}
                  searchError={searchError}
                  shareSuccess={shareSuccess}
                  ticketData={ticketData}
                  onSearch={handleSearch}
                  onSelectUser={handleSelectUser}
                  onContinueToShare={handleContinueToShare}
                  onGoBack={handleGoBack}
                  onOpenShareDialog={() => setShowShareDialog(true)}
                  currentUserId={user?.id || ""}
                  selectedTickets={selectedTickets}
                  setSelectedTickets={setSelectedTickets}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      <ShareConfirmationDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        selectedUser={selectedUser}
        ticketData={ticketData}
        isSharing={isSharing}
        onConfirm={handleShare}
        showSuccess={showSuccess}
        selectedTickets={selectedTickets}
      />
    </SafeAreaView>
  )
}
