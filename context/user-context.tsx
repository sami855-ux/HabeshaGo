// context/user-context.tsx
"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

interface UserProfile {
  id?: string
  fullName?: string
  phone?: string
  email?: string
  address?: string
  dateOfBirth?: string
  gender?: string
  profileImage?: string
  isProfileComplete: boolean
}

interface UserContextType {
  userProfile: UserProfile
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  isProfileComplete: boolean
  showProfileModal: boolean
  setShowProfileModal: (show: boolean) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    isProfileComplete: false,
  })
  const [showProfileModal, setShowProfileModal] = useState(true)

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem("userProfile")
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        setUserProfile(parsedProfile)

        // Check if profile is complete
        const isComplete = checkProfileCompletion(parsedProfile)
        if (!isComplete) {
          setShowProfileModal(true)
        }
      } else {
        // No profile found, show modal
        setShowProfileModal(true)
      }
    } catch (error) {
      console.error("Failed to load user profile:", error)
      setShowProfileModal(true)
    }
  }

  const checkProfileCompletion = (profile: UserProfile): boolean => {
    return !!(
      profile.fullName &&
      profile.phone &&
      profile.email &&
      profile.dateOfBirth &&
      profile.gender &&
      profile.address
    )
  }

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updatedProfile = { ...userProfile, ...updates }
      const isComplete = checkProfileCompletion(updatedProfile)

      const finalProfile = {
        ...updatedProfile,
        isProfileComplete: isComplete,
      }

      setUserProfile(finalProfile)
      await AsyncStorage.setItem("userProfile", JSON.stringify(finalProfile))

      if (isComplete && showProfileModal) {
        setShowProfileModal(false)
      }

      return finalProfile
    } catch (error) {
      console.error("Failed to update user profile:", error)
      throw error
    }
  }

  return (
    <UserContext.Provider
      value={{
        userProfile,
        updateUserProfile,
        isProfileComplete: userProfile.isProfileComplete,
        showProfileModal,
        setShowProfileModal,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
