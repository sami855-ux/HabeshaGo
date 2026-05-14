"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

import { fetchAvailableSlots } from "@/store/slices/parkingUserSlice"

// ✅ Inner component with all the logic
function ParkingLotContent() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useDispatch<any>()

  const { slots, loading } = useSelector((s: any) => s.parkingUser)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)

  const lotId = params?.id as string

  /* ================= LOAD SLOTS ================= */
  useEffect(() => {
    if (lotId) {
      dispatch(fetchAvailableSlots(lotId))
    }
  }, [lotId, dispatch])

  /* ================= STATUS UI ================= */
  const getStatusBadge = (status: string) => {
    const map: any = {
      AVAILABLE:
        "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400",
      OCCUPIED: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400",
      RESERVED:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400",
    }
    return <Badge className={map[status]}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const map: any = {
      CAR: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
      BIKE: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
      TRUCK:
        "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
    }
    return <Badge className={map[type]}>{type}</Badge>
  }

  /* ================= CONTINUE ================= */
  const handleContinue = () => {
    if (!selectedSlot) return
    router.push(
      `/user/parking/booking/confirm?lotId=${lotId}&slotId=${selectedSlot.id}`,
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-zinc-950 min-h-screen text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Select Parking Slot</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Choose your preferred slot
        </p>
      </div>

      {/* GRID */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading...
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {slots.map((slot: any) => {
            const isSelected = selectedSlot?.id === slot.id
            const isDisabled =
              slot.status === "OCCUPIED" || slot.status === "RESERVED"

            return (
              <Card
                key={slot.id}
                onClick={() => !isDisabled && setSelectedSlot(slot)}
                className={`p-4 space-y-3 border transition cursor-pointer hover:shadow-xl
                  bg-white dark:bg-zinc-900
                  border-gray-200 dark:border-zinc-800
                  ${isSelected ? "border-blue-500 shadow-lg" : ""}
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                  ${slot.isEV ? "border-green-400" : ""}
                `}
              >
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-lg">{slot.slotNumber}</h2>
                  {getStatusBadge(slot.status)}
                </div>

                <div>{getTypeBadge(slot.slotType)}</div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>📍 Floor {slot.floor}</p>
                  <p>🏷 Section {slot.section}</p>
                </div>

                <div className="flex gap-2 text-xs">
                  {slot.isEV && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Zap className="w-3 h-3" /> EV
                    </span>
                  )}
                  {slot.hasCharger && (
                    <span className="text-blue-600 dark:text-blue-400">
                      ⚡ Charger
                    </span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* CONTINUE BUTTON */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 p-4">
          <Button className="w-full" onClick={handleContinue}>
            Continue with {selectedSlot.slotNumber}
          </Button>
        </div>
      )}
    </div>
  )
}

// ✅ Default export wraps inner component in Suspense
export default function ParkingLotPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          Loading parking lot...
        </div>
      }
    >
      <ParkingLotContent />
    </Suspense>
  )
}
