"use client"

import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion"
import { ParkingLot, ParkingSlot } from "@/types/parking"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Camera,
  Zap,
  Car,
  Navigation,
  Calendar,
  Star,
  Wifi,
  Coffee,
  ShoppingBag,
  GripHorizontal,
  ChevronDown,
  AlertCircle,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ParkingLotDetailsSheetProps {
  parkingLot: ParkingLot
  onClose: () => void
}

export function ParkingLotDetailsSheet({
  parkingLot,
  onClose,
}: ParkingLotDetailsSheetProps) {
  const router = useRouter()

  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [dragProgress, setDragProgress] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Drag handling
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 200], [1, 0])

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 100) {
      onClose()
    } else {
      y.set(0)
    }
  }

  const availabilityPercentage =
    (parkingLot.availableSlots / parkingLot.totalSlots) * 100

  const getAvailabilityColor = () => {
    if (availabilityPercentage > 50)
      return "text-green-600 bg-green-50 border-green-200"
    if (availabilityPercentage > 20)
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getAvailabilityStatus = () => {
    if (availabilityPercentage > 50) return "Good Availability"
    if (availabilityPercentage > 20) return "Limited Availability"
    return "Almost Full"
  }

  const handleReserve = (slot: ParkingSlot) => {
    setSelectedSlot(slot)
    // Implement reservation logic
    console.log("Reserving slot:", slot)
  }

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${parkingLot.latitude},${parkingLot.longitude}`
    window.open(url, "_blank")
  }

  // Prevent body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Draggable Sheet */}
      <motion.div
        ref={sheetRef}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
        style={{ y, opacity }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] flex flex-col"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
        </div>

        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b px-4 py-3 flex justify-between items-start z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                {parkingLot.name}
              </h2>
              <Badge className={cn("gap-1", getAvailabilityColor())}>
                <AlertCircle className="w-3 h-3" />
                {getAvailabilityStatus()}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">
                  {parkingLot.rating?.toFixed(1) || "4.5"}
                </span>
              </div>
              <span className="text-gray-300 text-xs">•</span>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{parkingLot.city}</span>
              </div>
              {parkingLot.distance && (
                <>
                  <span className="text-gray-300 text-xs">•</span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{parkingLot.distance.toFixed(1)} km away</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 transition-colors -mt-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-5">
          {/* Address Section */}
          <div className="bg-gray-50 rounded-xl p-3 mt-2">
            <div className="flex items-start gap-3">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <MapPin className="w-4 h-4 text-gray-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {parkingLot.address}
                </p>
              </div>
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <Car className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">
                  Available
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {parkingLot.availableSlots}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                of {parkingLot.totalSlots} total spots
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">
                  Rate
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ETB {(parkingLot.pricePerMinute * 60).toFixed(2)}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                per hour (ETB {parkingLot.pricePerMinute.toFixed(2)}/min)
              </div>
            </div>
          </div>

          {/* Availability Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Availability</span>
              <span
                className={cn(
                  "font-medium px-2 py-0.5 rounded-full text-xs",
                  getAvailabilityColor(),
                )}
              >
                {availabilityPercentage.toFixed(0)}% available
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${availabilityPercentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  "h-full rounded-full transition-all",
                  availabilityPercentage > 50
                    ? "bg-gradient-to-r from-green-500 to-green-400"
                    : availabilityPercentage > 20
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                      : "bg-gradient-to-r from-red-500 to-red-400",
                )}
                style={{ width: `${availabilityPercentage}%` }}
              />
            </div>
          </div>

          {/* Operating Hours */}
          {parkingLot.openingTime && parkingLot.closingTime && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                Operating Hours
              </h3>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <Clock className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(parkingLot.openingTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(parkingLot.closingTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Open today</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Parking Slots Preview */}
          {parkingLot.slots &&
            parkingLot.slots.filter((s) => s.status === "AVAILABLE").length >
              0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    Available Parking Slots
                  </h3>
                  <span className="text-xs text-gray-500">
                    {
                      parkingLot.slots.filter((s) => s.status === "AVAILABLE")
                        .length
                    }{" "}
                    spots
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {parkingLot.slots
                    .filter((slot) => slot.status === "AVAILABLE")
                    .slice(0, 4)
                    .map((slot, idx) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-2 border-gray-100 rounded-xl p-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => handleReserve(slot)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              Slot {slot.slotNumber}
                            </div>
                            {slot.floor && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                Floor {slot.floor}
                              </div>
                            )}
                            {slot.isEV && slot.hasCharger && (
                              <Badge
                                variant="outline"
                                className="text-xs mt-1.5 bg-purple-50 border-purple-200"
                              >
                                <Zap className="w-2.5 h-2.5 mr-1" />
                                EV Ready
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Select
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

          {/* Action Buttons - Sticky Bottom */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 pb-2 mt-2 border-t">
            <div className="flex gap-3">
              <Button
                onClick={handleGetDirections}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 border-2 hover:bg-gray-50"
                onClick={() => router.push(`/user/booking/parking`)}
              >
                <Calendar className="w-4 h-4" />
                Reserve Spot
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
