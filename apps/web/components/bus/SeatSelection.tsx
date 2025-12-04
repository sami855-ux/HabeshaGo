"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Users, Armchair, Shield, Crown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Seat {
  id: string
  number: string
  type: "standard" | "premium" | "disabled"
  status: "available" | "booked" | "selected" | "disabled"
  price: number
  recommended?: boolean
}

export function SeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)

  const seats: Seat[] = Array.from({ length: 40 }, (_, i) => {
    const row = Math.floor(i / 4) + 1
    const col = String.fromCharCode(65 + (i % 4))
    const number = `${row}${col}`

    const types: Array<Seat["type"]> = ["standard", "premium", "disabled"]
    const type = types[Math.floor(Math.random() * 3)]

    const statuses: Array<Seat["status"]> = ["available", "booked", "disabled"]
    const status =
      i % 5 === 0 ? "booked" : statuses[Math.floor(Math.random() * 2)]

    const price = type === "premium" ? 200 : type === "standard" ? 100 : 0
    const recommended = i === 12 || i === 13 || i === 20 || i === 21

    return {
      id: number,
      number,
      type,
      status: status as Seat["status"],
      price,
      recommended,
    }
  })

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "available") {
      setSelectedSeats((prev) => {
        if (prev.includes(seat.id)) {
          return prev.filter((id) => id !== seat.id)
        } else {
          return [...prev, seat.id]
        }
      })
    }
  }

  const selectedSeatsData = seats.filter((seat) =>
    selectedSeats.includes(seat.id)
  )
  const totalPrice = selectedSeatsData.reduce(
    (sum, seat) => sum + seat.price,
    0
  )
  const serviceFee = 49
  const discount = selectedSeatsData.length * 20
  const finalPrice = totalPrice + serviceFee - discount

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
      >
        Open Seat Selection
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-screen max-w-screen-2xl max-h-[95vh] overflow-y-auto px-6">
          <DialogHeader>
            <DialogTitle>Select Your Seats</DialogTitle>
          </DialogHeader>
          <div className="grid lg:grid-cols-3 gap-8 ">
            {/* Left Column - Seat Grid */}
            <div className="lg:col-span-2">
              {/* Driver Area */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Shield className="size-4" />
                  <span>Driver's Cabin</span>
                </div>
                <div className="w-32 h-4 bg-gray-800 mx-auto mt-2 rounded-t-lg"></div>
              </div>

              {/* Seat Grid */}
              <div className="grid grid-cols-4 gap-4">
                {seats.map((seat, index) => (
                  <motion.div
                    key={seat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.01 }}
                  >
                    <button
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.status !== "available"}
                      className={`relative w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200
                        ${
                          seat.status === "booked"
                            ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                            : seat.status === "selected"
                              ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white"
                              : seat.status === "disabled"
                                ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50"
                                : seat.type === "premium"
                                  ? "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700"
                                  : "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-800"
                        }`}
                    >
                      {/* Seat Icon */}
                      <Armchair className="size-6" />

                      {/* Seat Number */}
                      <span className="absolute bottom-1 text-xs font-medium">
                        {seat.number}
                      </span>

                      {/* Recommended Badge */}
                      {seat.recommended && seat.status === "available" && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-xs px-2 py-1">
                            <Zap className="size-3 mr-1" />
                            Best
                          </Badge>
                        </div>
                      )}

                      {/* Price Badge */}
                      {seat.status === "available" && (
                        <div className="absolute -bottom-2 text-xs font-bold">
                          ETB {seat.price}
                        </div>
                      )}

                      {/* Booked Indicator */}
                      {seat.status === "booked" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <User className="size-8 text-gray-400" />
                        </div>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Aisle */}
              <div className="mt-8 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

              {/* Seat Legend */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300"></div>
                  <span className="text-sm">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded bg-gray-300"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded bg-gradient-to-br from-orange-500 to-amber-500"></div>
                  <span className="text-sm">Selected</span>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1 w-[40vw]">
              <div className="sticky top-4 space-y-6">
                {/* Selected Seats */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Users className="size-4" />
                    Selected Seats ({selectedSeats.length})
                  </h4>
                  {selectedSeats.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSeatsData.map((seat) => (
                        <div
                          key={seat.id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <Armchair className="size-4" />
                            <span>Seat {seat.number}</span>
                            {seat.type === "premium" && (
                              <Crown className="size-3 text-yellow-500" />
                            )}
                          </div>
                          <span className="font-bold">ETB {seat.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No seats selected
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <h4 className="font-bold mb-4">Fare Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base Fare</span>
                      <span>ETB {totalPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>ETB {serviceFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600">-ETB {discount}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount</span>
                        <span>ETB {finalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    disabled={selectedSeats.length === 0}
                  >
                    Confirm Selection
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                </div>

                {/* AI Recommendation */}
                {selectedSeats.length === 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Zap className="size-5 text-blue-500 mt-1" />
                      <div>
                        <h5 className="font-semibold">AI Recommendation</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Seats 12A-13D have extra legroom and are near
                          emergency exits. Recommended for comfort and safety.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
