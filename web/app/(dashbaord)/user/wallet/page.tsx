"use client"

import { useState, useEffect } from "react"
import { WalletBalanceCard } from "@/components/user-dashboard/BalanceCard"
import DepositAction from "@/components/user-dashboard/DepositAction"
import RecentTransactions from "@/components/user-dashboard/RecentTransactions"
import { ProfileCompletionModal } from "@/components/user-dashboard/ProfileCompletation"
import { WalletPinSetupModal } from "@/components/user-dashboard/PinSetUpModal"
import {
  Wallet,
  Lock,
  CreditCard,
  AlertTriangle,
  Settings,
  RefreshCcw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/store/store"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { createUserWallet } from "@/services/wallet.api"
import { fetchUserWallet, setWallet } from "@/store/slices/walletSlice"
import { fetchCurrentUser } from "@/store/slices/userSlice"

export default function WalletPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Separate wallet state
  const {
    wallet,
    loading: walletLoading,
    hasWallet,
  } = useAppSelector((state) => state.wallet)

  // User state
  const {
    user,
    loading: userLoading,
    error: userError,
  } = useAppSelector((state) => state.user)

  const [showPinModal, setShowPinModal] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pinLoading, setPinLoading] = useState(false)

  // Check if profile is complete (email and phone verified)
  const isProfileComplete = user?.emailVerified && user?.phoneVerified

  // Check if PIN is set (has pinHash) - now from wallet state
  const hasPinSet = wallet?.pinHash && wallet.pinHash.trim() !== ""

  // Prepare wallet data for the WalletBalanceCard
  const walletData = wallet
    ? {
        balance:
          typeof wallet.balance === "string"
            ? parseFloat(wallet.balance) || 0
            : Number(wallet.balance) || 0,
        currency: wallet.currency || "ETB",
        isActive: wallet.isActive ?? true,
        isLocked: wallet.isLocked ?? false,
        habeshaPoints: wallet.points || 0,
        biometricEnabled: wallet.biometricEnabled ?? false,
        wallet: wallet,
      }
    : null

  // Handle initialization
  useEffect(() => {
    const initialize = async () => {
      try {
        // Wait for both wallet and user data to load
        if (!walletLoading && !userLoading) {
          if (userError) {
            setError(userError)
            toast.error("Failed to load user data", {
              description: userError,
            })
          } else if (!user) {
            setError("No user data available")
          } else {
            // Don't show profile completion modal if both email and phone are verified
            if (!isProfileComplete) {
              console.warn("Profile needs completion")
            }

            // Show PIN modal if no wallet or no PIN set
            if (!hasWallet || !hasPinSet) {
              // Delay slightly for better UX
              const timer = setTimeout(() => {
                setShowPinModal(true)
              }, 1500)
              return () => clearTimeout(timer)
            }
          }
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error("Wallet page initialization error:", err)
        toast.error("Initialization failed", {
          description: "Please refresh the page or try again later",
        })
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [
    user,
    userLoading,
    walletLoading,
    userError,
    isProfileComplete,
    hasWallet,
    hasPinSet,
  ])

  const handlePinComplete = async (pin: string) => {
    try {
      setPinLoading(true)
      // In real app, save to backend API
      const res = await createUserWallet(pin)

      toast.success("Wallet creatd successfully", {
        description: "Your wallet is now secured",
      })

      setShowPinModal(false)

      // Refresh wallet data or update state
      dispatch(setWallet(res))
    } catch (err) {
      toast.error("Failed to set PIN", {
        description: "Please try again",
      })
      console.error("PIN setup error:", err)
    } finally {
      setPinLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    setIsInitializing(true)

    // In real app, you might want to dispatch retry actions here
    dispatch(fetchCurrentUser())
    dispatch(fetchUserWallet())
  }

  const handleRefreshWallet = () => {
    dispatch(fetchUserWallet())

    toast.info("Refreshing wallet data...")
  }

  // Combined loading state
  const isLoading = walletLoading || userLoading || isInitializing

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Balance Card Skeleton */}
        <Card className="border-none shadow-none bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-3 w-32 mb-2" />
                <Skeleton className="h-10 w-48" />
              </div>
              <Skeleton className="h-12 w-32 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Deposit Action Skeleton */}
        <Card className="border-none shadow-none bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions Skeleton */}
        <Card className="border-none shadow-none bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert
          variant="destructive"
          className="border-red-200 dark:border-red-800"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Wallet</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push("/user/dashboard")}
                variant="ghost"
              >
                Go to Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // If no user data
  if (!user) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full mb-4">
          <Wallet className="h-10 w-10 text-orange-500" />
        </div>
        <h3 className="text-xl font-semibold">User Not Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Please log in to access your wallet or contact support if the issue
          persists.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Button onClick={() => router.push("/login")}>Log In</Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground">
              Payments
            </p>
            <h1 className="text-3xl font-bold">My Wallet</h1>
            <p className="text-sm text-muted-foreground">
              Manage your balance, review transactions, and pay for trips
              seamlessly.
            </p>
          </div>
        </header>
        {hasWallet && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer"
              onClick={handleRefreshWallet}
            >
              <RefreshCcw size={20} />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="cursor-pointer"
              onClick={() => router.push("/user/wallet/settings")}
            >
              <Settings size={20} color="white" />
            </Button>
          </div>
        )}
      </div>

      {/* Show wallet warning banner if no wallet */}
      {!hasWallet && (
        <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
          <CreditCard className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle>Wallet Setup Required</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span>
              You need to set up your wallet PIN to start using wallet features.
            </span>
            <Button
              onClick={() => setShowPinModal(true)}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 sm:ml-2 sm:mt-0 mt-2"
            >
              Set Up Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Show PIN setup reminder if no PIN set but wallet exists */}
      {hasWallet && !hasPinSet && !showPinModal && (
        <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
          <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>Wallet Security Required</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span>
              Set up your wallet PIN to secure your transactions and enable
              biometric authentication.
            </span>
            <Button
              onClick={() => setShowPinModal(true)}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 sm:ml-2 sm:mt-0 mt-2"
            >
              Set PIN Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Show wallet balance card only if wallet exists */}
      {hasWallet && walletData ? (
        <WalletBalanceCard
          {...walletData}
          onFundWallet={() => {
            toast.info("Deposit feature coming soon", {
              description: "We're working on adding deposit functionality",
            })
          }}
          onViewTransactions={() => {
            toast.info("Transaction history", {
              description: "Viewing your transaction history",
            })
          }}
        />
      ) : (
        // Placeholder for when wallet doesn't exist
        <Card className="border-none shadow-none bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-gray-800/50 overflow-hidden">
          <CardContent className="text-center py-12 px-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6 shadow-lg">
              <Wallet className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No Wallet Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Set up your wallet PIN to create your digital wallet and start
              making secure transactions
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setShowPinModal(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md"
                size="lg"
              >
                <Lock className="mr-2 h-4 w-4" />
                Set Up Wallet
              </Button>
              <Button
                onClick={() => router.push("/user/help/wallet")}
                variant="outline"
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Only show deposit and transactions if wallet exists */}
      {hasWallet && (
        <>
          <DepositAction />
          <RecentTransactions />
        </>
      )}

      {/* Profile completion modal - Only show if profile is incomplete */}
      {!isProfileComplete && (
        <ProfileCompletionModal
          isOpen={!isProfileComplete}
          onClose={() => {
            toast.warning("Profile completion required", {
              description: "Please complete your profile to continue",
            })

            router.back()
          }}
        />
      )}

      {/* PIN setup modal */}
      <WalletPinSetupModal
        isOpen={showPinModal}
        onComplete={handlePinComplete}
        pinLoading={pinLoading}
        onClose={() => {
          toast.warning("PIN setup required", {
            description: "You must set up a PIN to use wallet features",
          })

          setShowPinModal(false)
        }}
        canClose={hasPinSet}
        onSetupLater={() => {
          if (!hasPinSet) {
            toast.warning("Limited functionality", {
              description:
                "Some wallet features will be unavailable without PIN",
            })
          }
          setShowPinModal(false)
        }}
      />
    </div>
  )
}
