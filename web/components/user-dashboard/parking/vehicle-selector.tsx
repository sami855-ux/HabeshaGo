"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChevronLeft, Car } from "lucide-react"

interface Vehicle {
  id: number
  type: string
  vin: string
  model: string
  plateNumber: string
  manufacturer: string
  year: number
  color?: string
}

interface VehicleSelectorProps {
  vehicles: Vehicle[]
  onSelectVehicle: (id: number) => void
  isLoading: boolean
  onBack: () => void
}

export function VehicleSelector({
  vehicles,
  onSelectVehicle,
  isLoading,
  onBack,
}: VehicleSelectorProps) {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-all duration-300 rounded-xl hover:bg-white/50 backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Select Your Vehicle
                </h1>
                <p className="text-xs text-gray-500">
                  Choose which vehicle you want to park
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-blue-300 group overflow-hidden"
                  onClick={() => onSelectVehicle(vehicle.id)}
                >
                  <div className="flex p-4 gap-4">
                    <div className="relative h-24 w-24 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Car className="h-10 w-10 text-blue-600" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {vehicle.manufacturer} {vehicle.model}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {vehicle.year} • {vehicle.plateNumber} •{" "}
                            {vehicle.color}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {vehicle.type}
                        </Badge>
                      </div>

                      <Button
                        className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                        onClick={() => onSelectVehicle(vehicle.id)}
                      >
                        Select This Vehicle
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && vehicles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Vehicles Found
              </h3>
              <p className="text-gray-600 mb-4">
                You don&apos;t have any vehicles added to your account yet.
              </p>
              <Button
                onClick={() => (window.location.href = "/user/vehicles")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Add a Vehicle First
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
