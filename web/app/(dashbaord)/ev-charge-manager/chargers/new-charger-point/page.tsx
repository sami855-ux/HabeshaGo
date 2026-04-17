"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ChevronLeft,
  Zap,
  Battery,
  Clock,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
  MapPin,
  Building,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

// Types
enum ConnectorType {
  CCS = "CCS",
  TYPE2 = "TYPE2",
  CHADEMO = "CHADEMO",
  TESLA = "TESLA",
  GB_T = "GB_T",
}

enum ChargingSpeed {
  SLOW = "SLOW",
  FAST = "FAST",
  SUPER_FAST = "SUPER_FAST",
  ULTRA_FAST = "ULTRA_FAST",
}

enum ChargingPointStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  FAULTED = "FAULTED",
  OFFLINE = "OFFLINE",
  MAINTENANCE = "MAINTENANCE",
}

type Station = {
  id: number
  name: string
  location: string
  operator: string
  totalPoints: number
}

type FormValues = {
  stationId: string
  connectorType: string
  powerKw: number
  chargingSpeed: string
  slotNumber: string
  maxVoltage: number
  maxCurrent: number
  averageSessionDuration: number
  notes: string
}

// Mock stations data
const MOCK_STATIONS: Station[] = [
  {
    id: 1,
    name: "Green Valley EV Hub",
    location: "123 Green Street, Downtown",
    operator: "EcoCharge",
    totalPoints: 3,
  },
  {
    id: 2,
    name: "Emerald Charge Point",
    location: "456 Park Avenue",
    operator: "GreenEnergy",
    totalPoints: 4,
  },
  {
    id: 3,
    name: "Sustainable Energy Station",
    location: "789 Eco Boulevard",
    operator: "EcoCharge",
    totalPoints: 3,
  },
  {
    id: 4,
    name: "Solaris Charging Plaza",
    location: "101 Solar Way",
    operator: "SolarCharge",
    totalPoints: 6,
  },
  {
    id: 5,
    name: "EcoPoint Downtown",
    location: "202 Green Avenue",
    operator: "EcoCharge",
    totalPoints: 2,
  },
]

// Helper functions
const getConnectorIcon = (type: string) => {
  switch (type) {
    case ConnectorType.CCS:
      return "🔌"
    case ConnectorType.TYPE2:
      return "⚡"
    case ConnectorType.CHADEMO:
      return "🔋"
    default:
      return "🔌"
  }
}

const getSpeedBadgeVariant = (speed: string) => {
  switch (speed) {
    case ChargingSpeed.SLOW:
      return "secondary"
    case ChargingSpeed.FAST:
      return "default"
    case ChargingSpeed.SUPER_FAST:
      return "default"
    case ChargingSpeed.ULTRA_FAST:
      return "default"
    default:
      return "secondary"
  }
}

export default function AddChargingPointPage() {
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("basic")
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      stationId: "",
      connectorType: "",
      powerKw: 22,
      chargingSpeed: ChargingSpeed.FAST,
      slotNumber: "",
      maxVoltage: 240,
      maxCurrent: 32,
      averageSessionDuration: 60,
      notes: "",
    },
  })

  const watchConnectorType = form.watch("connectorType")
  const watchChargingSpeed = form.watch("chargingSpeed")
  const watchPowerKw = form.watch("powerKw")
  const watchMaxVoltage = form.watch("maxVoltage")
  const watchMaxCurrent = form.watch("maxCurrent")

  // Auto-select charging speed based on power
  useEffect(() => {
    const power = watchPowerKw
    if (power) {
      if (power >= 150) {
        form.setValue("chargingSpeed", ChargingSpeed.ULTRA_FAST)
      } else if (power >= 50) {
        form.setValue("chargingSpeed", ChargingSpeed.SUPER_FAST)
      } else if (power >= 22) {
        form.setValue("chargingSpeed", ChargingSpeed.FAST)
      } else {
        form.setValue("chargingSpeed", ChargingSpeed.SLOW)
      }
    }
  }, [watchPowerKw, form])

  const validateForm = (data: FormValues): boolean => {
    const newErrors: Record<string, string> = {}

    if (!data.stationId) newErrors.stationId = "Please select a station"
    if (!data.connectorType)
      newErrors.connectorType = "Please select connector type"
    if (!data.powerKw || data.powerKw < 1) {
      newErrors.powerKw = "Power must be at least 1 kW"
    } else if (data.powerKw > 500) {
      newErrors.powerKw = "Power cannot exceed 500 kW"
    }
    if (data.maxVoltage && (data.maxVoltage < 100 || data.maxVoltage > 1000)) {
      newErrors.maxVoltage = "Voltage must be between 100V and 1000V"
    }
    if (data.maxCurrent && (data.maxCurrent < 10 || data.maxCurrent > 500)) {
      newErrors.maxCurrent = "Current must be between 10A and 500A"
    }
    if (
      data.averageSessionDuration &&
      (data.averageSessionDuration < 15 || data.averageSessionDuration > 480)
    ) {
      newErrors.averageSessionDuration =
        "Duration must be between 15 and 480 minutes"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (data: FormValues) => {
    if (!validateForm(data)) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const element = document.getElementById(`field-${firstError}`)
        element?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const chargingPointData = {
        stationId: parseInt(data.stationId),
        connectorType: data.connectorType,
        powerKw: data.powerKw,
        chargingSpeed: data.chargingSpeed,
        slotNumber: data.slotNumber || null,
        maxVoltage: data.maxVoltage || null,
        maxCurrent: data.maxCurrent || null,
        averageSessionDuration: data.averageSessionDuration || null,
        status: ChargingPointStatus.AVAILABLE,
        notes: data.notes || null,
      }

      console.log("Submitting charging point:", chargingPointData)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/ev-charge-manager/chargers?success=true")
      }, 1500)
    } catch (error) {
      setSubmitError("Failed to add charging point. Please try again.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStationSelect = (stationId: string) => {
    const station = MOCK_STATIONS.find((s) => s.id === parseInt(stationId))
    setSelectedStation(station || null)
    form.setValue("stationId", stationId)
    if (errors.stationId) {
      const newErrors = { ...errors }
      delete newErrors.stationId
      setErrors(newErrors)
    }
  }

  const isFormValid = () => {
    return (
      form.getValues("stationId") &&
      form.getValues("connectorType") &&
      form.getValues("powerKw") > 0
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCancelDialog(true)}
              className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Add New Charger
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Add Charging Point
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Add a new charging point to an existing station
              </p>
            </div>
          </div>
        </motion.div>

        {/* Success Alert */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900 dark:text-green-300">
                  Charging point created successfully! Redirecting...
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Station Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2 text-lg">
                  <Battery className="h-5 w-5" />
                  Station Selection
                </CardTitle>
                <CardDescription>
                  Select the station where this charging point will be installed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Select Station *
                  </label>
                  <Select onValueChange={handleStationSelect}>
                    <SelectTrigger
                      id="field-stationId"
                      className={`w-full ${errors.stationId ? "border-red-500 ring-red-500" : "border-slate-200 dark:border-slate-800"}`}
                    >
                      <SelectValue placeholder="Choose a station..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_STATIONS.map((station) => (
                        <SelectItem
                          key={station.id}
                          value={station.id.toString()}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{station.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stationId && (
                    <p className="text-sm text-red-500">{errors.stationId}</p>
                  )}
                </div>

                {/* Selected Station Info */}
                {selectedStation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {selectedStation.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin className="h-3 w-3" />
                          <span>{selectedStation.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Building className="h-3 w-3" />
                          <span>{selectedStation.operator}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {selectedStation.totalPoints} Existing Points
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Charging Point Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5" />
                  Charging Point Specifications
                </CardTitle>
                <CardDescription>
                  Enter the technical specifications for the new charging point
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="electrical">Electrical</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Connector Type *
                        </label>
                        <Select
                          onValueChange={(value) => {
                            form.setValue("connectorType", value)
                            if (errors.connectorType) {
                              const newErrors = { ...errors }
                              delete newErrors.connectorType
                              setErrors(newErrors)
                            }
                          }}
                        >
                          <SelectTrigger
                            id="field-connectorType"
                            className={
                              errors.connectorType
                                ? "border-red-500 ring-red-500"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select connector type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ConnectorType).map((type) => (
                              <SelectItem key={type} value={type}>
                                <span className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {getConnectorIcon(type)}
                                  </span>
                                  <span>{type}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.connectorType && (
                          <p className="text-sm text-red-500">
                            {errors.connectorType}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Power Rating (kW) *
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 22, 50, 150"
                          {...form.register("powerKw", { valueAsNumber: true })}
                          onChange={(e) => {
                            form.setValue(
                              "powerKw",
                              parseInt(e.target.value) || 0,
                            )
                            if (errors.powerKw) {
                              const newErrors = { ...errors }
                              delete newErrors.powerKw
                              setErrors(newErrors)
                            }
                          }}
                          className={
                            errors.powerKw ? "border-red-500 ring-red-500" : ""
                          }
                        />
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-600 transition-all duration-300"
                            style={{
                              width: `${Math.min((watchPowerKw / 500) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        {errors.powerKw && (
                          <p className="text-sm text-red-500">
                            {errors.powerKw}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Charging Speed
                        </label>
                        <Select
                          value={watchChargingSpeed}
                          onValueChange={(value) =>
                            form.setValue("chargingSpeed", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ChargingSpeed).map((speed) => (
                              <SelectItem key={speed} value={speed}>
                                <div className="flex items-center gap-2">
                                  {speed.replace("_", " ")}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500">
                          Auto-selected based on power rating
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Slot Number
                        </label>
                        <Input
                          placeholder="e.g., A-01, B-02"
                          {...form.register("slotNumber")}
                        />
                        <p className="text-xs text-slate-500">
                          Physical location identifier at the station
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="electrical" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Max Voltage (V)
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 240, 400"
                          {...form.register("maxVoltage", {
                            valueAsNumber: true,
                          })}
                          onChange={(e) => {
                            form.setValue(
                              "maxVoltage",
                              parseInt(e.target.value) || 0,
                            )
                            if (errors.maxVoltage) {
                              const newErrors = { ...errors }
                              delete newErrors.maxVoltage
                              setErrors(newErrors)
                            }
                          }}
                          className={
                            errors.maxVoltage
                              ? "border-red-500 ring-red-500"
                              : ""
                          }
                        />
                        {errors.maxVoltage && (
                          <p className="text-sm text-red-500">
                            {errors.maxVoltage}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Max Current (A)
                        </label>
                        <Input
                          type="number"
                          placeholder="e.g., 32, 125"
                          {...form.register("maxCurrent", {
                            valueAsNumber: true,
                          })}
                          onChange={(e) => {
                            form.setValue(
                              "maxCurrent",
                              parseInt(e.target.value) || 0,
                            )
                            if (errors.maxCurrent) {
                              const newErrors = { ...errors }
                              delete newErrors.maxCurrent
                              setErrors(newErrors)
                            }
                          }}
                          className={
                            errors.maxCurrent
                              ? "border-red-500 ring-red-500"
                              : ""
                          }
                        />
                        {errors.maxCurrent && (
                          <p className="text-sm text-red-500">
                            {errors.maxCurrent}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Power Calculation Display */}
                    {watchMaxVoltage > 0 && watchMaxCurrent > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-500">
                              Calculated Power
                            </p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                              {(
                                (watchMaxVoltage * watchMaxCurrent) /
                                1000
                              ).toFixed(1)}{" "}
                              kW
                            </p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            {watchMaxVoltage}V × {watchMaxCurrent}A
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Average Session Duration (minutes)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 60"
                        {...form.register("averageSessionDuration", {
                          valueAsNumber: true,
                        })}
                        onChange={(e) => {
                          form.setValue(
                            "averageSessionDuration",
                            parseInt(e.target.value) || 0,
                          )
                          if (errors.averageSessionDuration) {
                            const newErrors = { ...errors }
                            delete newErrors.averageSessionDuration
                            setErrors(newErrors)
                          }
                        }}
                        className={
                          errors.averageSessionDuration
                            ? "border-red-500 ring-red-500"
                            : ""
                        }
                      />
                      {errors.averageSessionDuration && (
                        <p className="text-sm text-red-500">
                          {errors.averageSessionDuration}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Additional Notes
                      </label>
                      <Textarea
                        placeholder="Any additional information about this charging point..."
                        {...form.register("notes")}
                        rows={4}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="sticky bottom-6 z-10"
          >
            <Card className="border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                      {watchConnectorType && watchPowerKw > 0 ? (
                        <div>
                          <p className="text-xs text-slate-500">Ready to add</p>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {watchConnectorType || "?"} • {watchPowerKw || "?"}{" "}
                            kW • {watchChargingSpeed?.replace("_", " ") || "?"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          Complete the form to add a charging point
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCancelDialog(true)}
                      className="flex-1 sm:flex-none border-slate-300 dark:border-slate-700"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !isFormValid()}
                      className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Add Charging Point
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Progress indicator for form completion */}
                {!isFormValid() && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-600 transition-all duration-300"
                          style={{
                            width: `${
                              [
                                !!form.getValues("stationId"),
                                !!form.getValues("connectorType"),
                                form.getValues("powerKw") > 0,
                              ].filter(Boolean).length * 33.33
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs">
                        {
                          [
                            !!form.getValues("stationId"),
                            !!form.getValues("connectorType"),
                            form.getValues("powerKw") > 0,
                          ].filter(Boolean).length
                        }
                        /3 completed
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Alert */}
          <AnimatePresence>
            {submitError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Cancel Charging Point Addition
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel? Any unsaved changes will be
                lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Editing</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.back()}>
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
