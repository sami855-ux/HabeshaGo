"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"
import { PaymentSuccess } from "@/components/user-parking/PaymentSuccess"

// ✅ Inner component that uses useSearchParams
function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sessionId = searchParams.get("sessionId")
  const cost = searchParams.get("cost")
  const duration = searchParams.get("duration") || "00:00:00"
  const txnId = searchParams.get("txnId") || ""

  const { sessions } = useSelector((state: any) => state.parkingUser)
  const session = sessions.find((s: any) => s.id === sessionId)

  if (!session || !cost) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <p className="text-gray-600 dark:text-gray-400">
          Invalid payment confirmation
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
      <PaymentSuccess
        amount={parseFloat(cost)}
        lotName={session.slot.parkingLot.name}
        slotNumber={session.slot.slotNumber}
        duration={duration}
        transactionId={txnId}
        onBackToHome={() => router.push("/user/parking")}
      />
    </div>
  )
}

// ✅ Default export wraps inner component in Suspense
export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
