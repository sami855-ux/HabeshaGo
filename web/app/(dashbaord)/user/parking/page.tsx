"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Map, List, Wallet, User, Menu } from "lucide-react"

import MapSection from "@/components/MapSection"
import FindParking from "@/components/user-parking/ParkingLotCard"

export default function HomePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"map" | "list">("map")

  const handleSelectLot = (lotId: string) => {
    router.push(`/user/parking/${lotId}`)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          <div>
            <h1 className="font-bold text-lg">ParkEasy</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Find & Book Parking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-lg">
            <Wallet className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">$0.00</span>
          </div>

          <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </div>
      </div>

      {/* TOGGLE */}
      <div className="flex gap-2 p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setViewMode("map")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            viewMode === "map"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200"
          }`}
        >
          <Map className="w-4 h-4" />
          Map View
        </button>

        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200"
          }`}
        >
          <List className="w-4 h-4" />
          List View
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "map" ? (
          <div className="h-full w-full">
            <MapSection lots={[]} />
          </div>
        ) : (
          <div className="h-full overflow-auto p-4">
            <FindParking onSelectLot={handleSelectLot} />
          </div>
        )}
      </div>
    </div>
  )
}
