// app/tickets/share/[bookingId]/page.tsx
"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShareHeader } from "@/components/user-dashboard/trip/ShareHeader"
import { TicketPreview } from "@/components/user-dashboard/trip/TicketPreview"
import { ShareFlow } from "@/components/user-dashboard/trip/ShareFlow"
import { ShareConfirmationDialog } from "@/components/user-dashboard/trip/ShareConfirmationDialog"
import { StepProgress } from "@/components/user-dashboard/trip/StepProgress"
import { mockTicketData, mockUsers } from "@/data/mock-audit-logs"
import { getUserByPhoneNumber } from "@/services/user.api"
import { toast } from "sonner"
import { useAppSelector } from "@/store/store"

export default function TicketSharePage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string
  const { user } = useAppSelector((store) => store.user)

  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState("+251 ")
  const [searchResults, setSearchResults] = useState<typeof mockUsers>([])
  const [selectedUser, setSelectedUser] = useState<
    (typeof mockUsers)[0] | null
  >(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Handle search with proper phone number validation
  const handleSearch = async (phone: string) => {
    setSearchError(null)
    setSearchResults([])

    const cleanedPhone = phone.replace(/\s/g, "")

    if (!cleanedPhone.trim()) {
      setSearchError("Please enter a phone number")
      return
    }

    // Validate Ethiopian phone number format
    const ethiopianPhoneRegex = /^\+251(9[0-9]|7[1-9]|7[0-5])[0-9]{7}$/
    if (!ethiopianPhoneRegex.test(cleanedPhone)) {
      setSearchError(
        "Please enter a valid Ethiopian phone number (+251 followed by 9 digits)",
      )
      return
    }

    // Remove + for API call
    const phoneForApi = cleanedPhone.slice(1)

    setIsSearching(true)

    try {
      // Call API to search for recipient
      const result = await getUserByPhoneNumber(phoneForApi)

      if (result.success && result.data) {
        // Convert API response to match your user type
        const user = {
          id: result.data.id,
          name: result.data.name,
          phone: result.data.phone,
          email: result.data.email,
          isVerified: result.data.isVerified || false,
          avatar: result.data.avatar,
          friends: result.data.friends || false,
        }

        setSearchResults([user])
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
    }
  }

  // Handle user selection
  const handleSelectUser = (user: (typeof mockUsers)[0]) => {
    setSelectedUser(user)
    setStep(2)
  }

  // Handle continue to share
  const handleContinueToShare = () => {
    setStep(3)
  }

  // Handle share
  const handleShare = async () => {
    setIsSharing(true)
    setShowShareDialog(false)

    // Simulate API call for sharing
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setShareSuccess(true)

      // Auto redirect after success
      setTimeout(() => {
        router.push("/user/trips")
      }, 3000)
    } catch (error) {
      console.error("Share error:", error)
      toast.error("Share failed", {
        description: "Unable to share ticket. Please try again.",
      })
    } finally {
      setIsSharing(false)
    }
  }

  // Handle go back
  const handleGoBack = () => {
    if (step > 1) {
      setStep(1)
      if (step === 3) {
        setSelectedUser(null)
        setStep(1)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-950 dark:to-gray-900">
      <ShareHeader />

      <div className="container mx-auto px-4 py-8">
        <StepProgress currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Ticket Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TicketPreview ticket={mockTicketData} />
          </motion.div>

          {/* Right Column - Share Flow */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ShareFlow
              step={step}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              searchResults={searchResults}
              selectedUser={selectedUser}
              isSearching={isSearching}
              searchError={searchError}
              shareSuccess={shareSuccess}
              ticketData={mockTicketData}
              onSearch={handleSearch}
              onSelectUser={handleSelectUser}
              onContinueToShare={handleContinueToShare}
              onGoBack={handleGoBack}
              onOpenShareDialog={() => setShowShareDialog(true)}
              currentUserId={user ? user?.id : ""} // Pass the actual user ID here
            />
          </motion.div>
        </div>
      </div>

      <ShareConfirmationDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        selectedUser={selectedUser}
        ticketData={mockTicketData}
        isSharing={isSharing}
        onConfirm={handleShare}
      />
    </div>
  )
}
