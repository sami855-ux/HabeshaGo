"use client"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import { Checkout } from "@/components/user-parking/Checkout"
import {
  fetchMySessions,
  fetchSessionCost,
} from "@/store/slices/parkingUserSlice"

// ✅ Inner component that uses useSearchParams
function CheckoutContent() {
  const router = useRouter()
  const dispatch = useDispatch<any>()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("sessionId")
  const { sessions, cost } = useSelector((state: any) => state.parkingUser)

  useEffect(() => {
    if (sessionId) {
      dispatch(fetchMySessions())
      dispatch(fetchSessionCost(sessionId))
    }
  }, [dispatch, sessionId])

  const session = sessions.find((s: any) => s.id === sessionId)

  if (!session || !cost) {
    return <p className="p-4">Loading checkout...</p>
  }

  // ✅ FORMAT DURATION FROM BACKEND
  const durationMinutes = cost.duration
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  const duration = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`

  const totalCost = cost.cost
  const walletBalance = 100 // 🔥 replace later with real wallet

  const handleProceedToPayment = () => {
    router.push(
      `/user/parking/payment?sessionId=${sessionId}&cost=${totalCost}`,
    )
  }

  return (
    <Checkout
      lotName={session.slot.parkingLot.name}
      slotNumber={session.slot.slotNumber}
      duration={duration}
      totalCost={totalCost}
      walletBalance={walletBalance}
      onBack={() => router.back()}
      onProceedToPayment={handleProceedToPayment}
    />
  )
}

// ✅ Default export wraps the inner component in Suspense
export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading checkout...</p>}>
      <CheckoutContent />
    </Suspense>
  )
}
