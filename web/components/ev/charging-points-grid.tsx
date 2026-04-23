"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Zap,
  Timer,
  CheckCircle,
  Flame,
  Clock,
  AlertCircle,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ChargingPoint {
  id: number
  stationId: number
  connectorType: string
  powerKw: number
  status: string
  averageSessionDuration: number
  slotNumber: string
  chargingSpeed: string
  createdAt: string
  updatedAt: string
}

interface Vehicle {
  id: number
  manufacturer: string
  model: string
  connectorType: string
  capacity: number
  plateNumber: string
  year: number
}

const getSpeedBadge = (speed: string) => {
  switch (speed) {
    case "ULTRA_FAST":
      return {
        label: "Ultra-Fast",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: Flame,
      }
    case "FAST":
      return {
        label: "Fast",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: Zap,
      }
    default:
      return {
        label: "Standard",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: Clock,
      }
  }
}

interface ChargingPointsGridProps {
  chargingPoints: ChargingPoint[]
  selectedPointId: number | null
  onSelectPoint: (pointId: number) => void
  selectedVehicle?: Vehicle | null
  handleChangeVehicle: () => void
}

export function ChargingPointsGrid({
  chargingPoints,
  selectedPointId,
  onSelectPoint,
  selectedVehicle,
  handleChangeVehicle,
}: ChargingPointsGridProps) {
  const router = useRouter()

  const [showMismatchDialog, setShowMismatchDialog] = useState(false)
  const [showChangeVehicleDialog, setShowChangeVehicleDialog] = useState(false)

  // Filter points that match the selected vehicle's connector type
  const matchingPoints = selectedVehicle
    ? chargingPoints.filter(
        (p) =>
          p.connectorType === selectedVehicle.connectorType &&
          p.status === "AVAILABLE",
      )
    : []

  const availablePoints = chargingPoints.filter((p) => p.status === "AVAILABLE")
  const hasMatchingPoints = matchingPoints.length > 0
  const hasAnyAvailablePoints = availablePoints.length > 0

  // Handle point selection with validation
  const handlePointSelection = (
    pointId: number,
    pointConnectorType: string,
  ) => {
    if (
      selectedVehicle &&
      pointConnectorType !== selectedVehicle.connectorType
    ) {
      setShowMismatchDialog(true)
      return
    }
    onSelectPoint(pointId)
  }

  const handleChangeStation = () => {
    setShowChangeVehicleDialog(false)
    // Navigate back to station selection
    router.back()
  }

  // If no matching points found for the selected vehicle
  if (selectedVehicle && !hasMatchingPoints) {
    return (
      <>
        <Card className="border-0 shadow-none rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-50 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <CardHeader className="pb-3 relative">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              No Compatible Charging Points
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your {selectedVehicle.manufacturer} {selectedVehicle.model}{" "}
              requires {selectedVehicle.connectorType} connector
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Zap className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No {selectedVehicle.connectorType} Charging Points Available
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                This station doesn't have any available charging points
                compatible with your vehicle's connector type. Please try
                another station or add a vehicle with a compatible connector.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleChangeStation}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                >
                  Browse Other Stations
                </Button>
                <Button
                  onClick={handleChangeVehicle}
                  variant="outline"
                  className="border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  Add/Change Vehicle
                </Button>
              </div>

              {/* Show all available points but disabled */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  Available charging points at this station:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {chargingPoints.map((point) => {
                    const isCompatible =
                      point.connectorType === selectedVehicle.connectorType
                    return (
                      <div
                        key={point.id}
                        className={`relative rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60 p-4 ${
                          !isCompatible ? "cursor-not-allowed" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-lg text-gray-600">
                              {point.slotNumber}
                            </span>
                            <Badge className="ml-2 bg-gray-200 text-gray-600">
                              {point.connectorType}
                            </Badge>
                          </div>
                          {!isCompatible && (
                            <Badge
                              variant="destructive"
                              className="bg-red-100 text-red-700"
                            >
                              Incompatible
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {point.powerKw} kW • {point.chargingSpeed}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Vehicle/Station Dialog */}
        <Dialog
          open={showChangeVehicleDialog}
          onOpenChange={setShowChangeVehicleDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>No Compatible Charging Points</DialogTitle>
              <DialogDescription>
                Your vehicle requires {selectedVehicle.connectorType} connector,
                but this station doesn't have any available points with that
                connector type.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Current Vehicle:</strong>{" "}
                  {selectedVehicle.manufacturer} {selectedVehicle.model} (
                  {selectedVehicle.connectorType})
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleChangeStation} className="w-full">
                  Find Another Station
                </Button>
                <Button
                  onClick={handleChangeVehicle}
                  variant="outline"
                  className="w-full"
                >
                  Add/Change Vehicle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <>
      <Card className="border-0 shadow-none rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-green-50 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <CardHeader className="pb-3 relative">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            Select Your Charging Point
          </CardTitle>
          <CardDescription className="text-gray-600">
            {selectedVehicle && (
              <span className="block mt-1 text-emerald-600">
                Compatible with your {selectedVehicle.manufacturer}{" "}
                {selectedVehicle.model} ({selectedVehicle.connectorType})
              </span>
            )}
            {hasMatchingPoints
              ? `${matchingPoints.length} compatible point${matchingPoints.length !== 1 ? "s" : ""} available`
              : `Choose from ${availablePoints.length} available charging spots`}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {chargingPoints.map((point) => {
              const isSelected = selectedPointId === point.id
              const isOccupied = point.status === "OCCUPIED"
              const isCompatible = selectedVehicle
                ? point.connectorType === selectedVehicle.connectorType
                : true
              const isDisabled =
                isOccupied || (selectedVehicle && !isCompatible)
              const speedInfo = getSpeedBadge(point.chargingSpeed)
              const SpeedIcon = speedInfo.icon

              // If vehicle is selected and point is not compatible, disable it
              if (selectedVehicle && !isCompatible) {
                return (
                  <div
                    key={point.id}
                    className="relative rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute top- right-3 z-10">
                      <Badge className="bg-gray-300 text-gray-600">
                        Incompatible
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xl text-gray-500">
                              {point.slotNumber}
                            </span>
                            <Badge
                              className={`${speedInfo.color} border-0 opacity-50`}
                            >
                              <SpeedIcon className="h-3 w-3 mr-1" />
                              {speedInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Connector</span>
                          <span className="font-semibold text-gray-500">
                            {point.connectorType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Required:</span>
                          <span className="font-semibold text-emerald-600">
                            {selectedVehicle.connectorType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={point.id}
                  className={`relative rounded-lg border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? "border-emerald-400 ring-2 ring-emerald-500/20 bg-gradient-to-br from-emerald-50/50 to-green-50/30"
                      : "border-gray-200 hover:border-emerald-300 hover:shadow-md"
                  } ${isDisabled ? "opacity-60 cursor-not-allowed bg-gray-50" : "bg-white"}`}
                  onClick={() =>
                    !isDisabled &&
                    handlePointSelection(point.id, point.connectorType)
                  }
                >
                  {isOccupied && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="destructive" className="bg-red-500">
                        Occupied
                      </Badge>
                    </div>
                  )}
                  {selectedVehicle && isCompatible && !isOccupied && (
                    <div className="absolute top- right-3 z-10">
                      <Badge className="bg-emerald-500 text-white">
                        Compatible
                      </Badge>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xl text-gray-800">
                            {point.slotNumber}
                          </span>
                          <Badge className={`${speedInfo.color} border-0`}>
                            <SpeedIcon className="h-3 w-3 mr-1" />
                            {speedInfo.label}
                          </Badge>
                        </div>
                      </div>
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          point.chargingSpeed === "ULTRA_FAST"
                            ? "bg-emerald-100"
                            : point.chargingSpeed === "FAST"
                              ? "bg-green-100"
                              : "bg-gray-100"
                        }`}
                      >
                        <Zap
                          className={`h-5 w-5 ${
                            point.chargingSpeed === "ULTRA_FAST"
                              ? "text-emerald-600"
                              : point.chargingSpeed === "FAST"
                                ? "text-green-600"
                                : "text-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Connector</span>
                        <span className="font-semibold text-gray-700">
                          {point.connectorType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Max Power</span>
                        <span className="font-semibold text-emerald-600">
                          {point.powerKw} kW
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Est. Time (100%)</span>
                        <span className="flex items-center gap-1 text-gray-700">
                          <Timer className="h-3 w-3 text-emerald-500" />
                          {point.averageSessionDuration} min
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-3 pt-2 border-t border-emerald-200">
                        <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Ready for charging
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mismatch Dialog when trying to select incompatible point */}
      <Dialog open={showMismatchDialog} onOpenChange={setShowMismatchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Incompatible Connector
            </DialogTitle>
            <DialogDescription>
              This charging point is not compatible with your vehicle.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-2">
              <p className="text-sm">
                <strong className="text-amber-800">Your Vehicle:</strong>{" "}
                <span className="text-gray-700">
                  {selectedVehicle?.manufacturer} {selectedVehicle?.model}
                </span>
              </p>
              <p className="text-sm">
                <strong className="text-amber-800">Requires Connector:</strong>{" "}
                <Badge className="bg-amber-200 text-amber-800 ml-2">
                  {selectedVehicle?.connectorType}
                </Badge>
              </p>
              <p className="text-sm">
                <strong className="text-amber-800">
                  Selected Point Connector:
                </strong>{" "}
                <Badge variant="outline" className="ml-2">
                  {
                    chargingPoints.find((p) => p.id === selectedPointId)
                      ?.connectorType
                  }
                </Badge>
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Please select a charging point with{" "}
              {selectedVehicle?.connectorType} connector or add a different
              vehicle.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowMismatchDialog(false)}>
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
