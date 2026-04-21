"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
  Loader2,
  MapPin,
  Building,
  Plus,
  Trash2,
  Copy,
  GripVertical,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { axiosInstance } from "@/services/axiosInstance"
import { cn } from "@/lib/utils"

// Types
enum ConnectorType {
  CCS = "CCS",
  TYPE2 = "TYPE2",
  CHADEMO = "CHADEMO",
  TESLA = "TESLA",
  GBT = "GBT",
}

enum ChargingSpeed {
  SLOW = "SLOW",
  FAST = "FAST",
  SUPER_FAST = "SUPER_FAST",
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

type ChargingPointFormData = {
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

type FormValues = {
  stationId: string
  chargingPoints: ChargingPointFormData[]
}

type BulkCreateResponse = {
  success: boolean
  message: string
  data: {
    created: number
    failed: number
    errors?: Array<{ index: number; error: string }>
  }
}

// API Functions
const fetchStations = async (): Promise<Station[]> => {
  try {
    const response = await axiosInstance.get("/ev/station")
    return response.data?.data || response.data
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to fetch stations",
    )
  }
}

const bulkCreateChargingPoints = async (
  data: FormValues,
): Promise<BulkCreateResponse> => {
  try {
    const payload = {
      stationId: parseInt(data.stationId),
      chargingPoints: data.chargingPoints.map((point, index) => ({
        ...point,
        stationId: parseInt(data.stationId),
        powerKw: Number(point.powerKw),
        maxVoltage: point.maxVoltage ? Number(point.maxVoltage) : null,
        maxCurrent: point.maxCurrent ? Number(point.maxCurrent) : null,
        averageSessionDuration: point.averageSessionDuration
          ? Number(point.averageSessionDuration)
          : null,
        slotNumber: point.slotNumber || null,
        notes: point.notes || null,
        status: ChargingPointStatus.AVAILABLE,
      })),
    }

    const response = await axiosInstance.post("/ev/station/bulk", payload)
    return response.data
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || "Failed to create charging points",
    )
  }
}

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
    default:
      return "secondary"
  }
}

// Individual Charging Point Form Component
const ChargingPointForm = ({
  index,
  control,
  register,
  errors,
  remove,
  onCopy,
  isRemoving,
  watchChargingSpeed,
  watchPowerKw,
  watchConnectorType,
  onPowerChange,
  onVoltageChange,
  onCurrentChange,
  onDurationChange,
}: {
  index: number
  control: any
  register: any
  errors: any
  remove: (index: number) => void
  onCopy: (index: number) => void
  isRemoving: boolean
  watchChargingSpeed: (index: number) => string
  watchPowerKw: (index: number) => number
  watchConnectorType: (index: number) => string
  onPowerChange: (index: number, value: number) => void
  onVoltageChange: (index: number, value: number) => void
  onCurrentChange: (index: number, value: number) => void
  onDurationChange: (index: number, value: number) => void
}) => {
  const [activeTab, setActiveTab] = useState("basic")
  const powerKw = watchPowerKw(index)
  const chargingSpeed = watchChargingSpeed(index)
  const connectorType = watchConnectorType(index)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-slate-400 cursor-move" />
                <CardTitle className="text-slate-900 dark:text-slate-100 text-lg">
                  Charging Point #{index + 1}
                </CardTitle>
              </div>
              {connectorType && powerKw > 0 && (
                <Badge variant="outline" className="gap-1">
                  <span>{getConnectorIcon(connectorType)}</span>
                  <span>{powerKw} kW</span>
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onCopy(index)}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={isRemoving}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Configure the specifications for this charging point
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
                      register(
                        `chargingPoints.${index}.connectorType`,
                      ).onChange({
                        target: {
                          value,
                          name: `chargingPoints.${index}.connectorType`,
                        },
                      })
                    }}
                  >
                    <SelectTrigger
                      className={cn(
                        errors?.chargingPoints?.[index]?.connectorType &&
                          "border-red-500 ring-red-500",
                      )}
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
                  {errors?.chargingPoints?.[index]?.connectorType && (
                    <p className="text-sm text-red-500">
                      {errors.chargingPoints[index].connectorType.message}
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
                    {...register(`chargingPoints.${index}.powerKw`, {
                      valueAsNumber: true,
                      required: "Power rating is required",
                      min: { value: 1, message: "Power must be at least 1 kW" },
                      max: {
                        value: 500,
                        message: "Power cannot exceed 500 kW",
                      },
                    })}
                    onChange={(e) =>
                      onPowerChange(index, parseInt(e.target.value) || 0)
                    }
                    className={cn(
                      errors?.chargingPoints?.[index]?.powerKw &&
                        "border-red-500 ring-red-500",
                    )}
                  />
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: `${Math.min((powerKw / 500) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  {errors?.chargingPoints?.[index]?.powerKw && (
                    <p className="text-sm text-red-500">
                      {errors.chargingPoints[index].powerKw.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Charging Speed
                  </label>
                  <Input
                    value={chargingSpeed?.replace("_", " ") || ""}
                    disabled
                    className="bg-slate-50"
                  />
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
                    {...register(`chargingPoints.${index}.slotNumber`)}
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
                    {...register(`chargingPoints.${index}.maxVoltage`, {
                      valueAsNumber: true,
                      min: {
                        value: 100,
                        message: "Voltage must be between 100V and 1000V",
                      },
                      max: {
                        value: 1000,
                        message: "Voltage must be between 100V and 1000V",
                      },
                    })}
                    onChange={(e) =>
                      onVoltageChange(index, parseInt(e.target.value) || 0)
                    }
                    className={cn(
                      errors?.chargingPoints?.[index]?.maxVoltage &&
                        "border-red-500 ring-red-500",
                    )}
                  />
                  {errors?.chargingPoints?.[index]?.maxVoltage && (
                    <p className="text-sm text-red-500">
                      {errors.chargingPoints[index].maxVoltage.message}
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
                    {...register(`chargingPoints.${index}.maxCurrent`, {
                      valueAsNumber: true,
                      min: {
                        value: 10,
                        message: "Current must be between 10A and 500A",
                      },
                      max: {
                        value: 500,
                        message: "Current must be between 10A and 500A",
                      },
                    })}
                    onChange={(e) =>
                      onCurrentChange(index, parseInt(e.target.value) || 0)
                    }
                    className={cn(
                      errors?.chargingPoints?.[index]?.maxCurrent &&
                        "border-red-500 ring-red-500",
                    )}
                  />
                  {errors?.chargingPoints?.[index]?.maxCurrent && (
                    <p className="text-sm text-red-500">
                      {errors.chargingPoints[index].maxCurrent.message}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Average Session Duration (minutes)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 60"
                  {...register(
                    `chargingPoints.${index}.averageSessionDuration`,
                    {
                      valueAsNumber: true,
                      min: {
                        value: 15,
                        message: "Duration must be between 15 and 480 minutes",
                      },
                      max: {
                        value: 480,
                        message: "Duration must be between 15 and 480 minutes",
                      },
                    },
                  )}
                  onChange={(e) =>
                    onDurationChange(index, parseInt(e.target.value) || 0)
                  }
                  className={cn(
                    errors?.chargingPoints?.[index]?.averageSessionDuration &&
                      "border-red-500 ring-red-500",
                  )}
                />
                {errors?.chargingPoints?.[index]?.averageSessionDuration && (
                  <p className="text-sm text-red-500">
                    {
                      errors.chargingPoints[index].averageSessionDuration
                        .message
                    }
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Additional Notes
                </label>
                <Textarea
                  placeholder="Any additional information about this charging point..."
                  {...register(`chargingPoints.${index}.notes`)}
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AddChargingPointPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [submitResult, setSubmitResult] = useState<BulkCreateResponse | null>(
    null,
  )

  // Fetch stations
  const {
    data: stations = [],
    isLoading: isLoadingStations,
    error: stationsError,
  } = useQuery({
    queryKey: ["stations"],
    queryFn: fetchStations,
    staleTime: 30000,
  })

  // Bulk create mutation
  const createMutation = useMutation({
    mutationFn: bulkCreateChargingPoints,
    onSuccess: (data) => {
      setSubmitResult(data)
      setShowSuccessDialog(true)
      // Invalidate both chargers and stations queries
      queryClient.invalidateQueries({ queryKey: ["chargers"] })
      queryClient.invalidateQueries({ queryKey: ["stations"] })

      // Redirect after 3 seconds if successful
      if (data.success && data.data.created > 0) {
        setTimeout(() => {
          router.push("/ev-charge-manager/chargers?success=true")
        }, 3000)
      }
    },
    onError: (error: Error) => {
      setSubmitResult({
        success: false,
        message: error.message,
        data: { created: 0, failed: 0 },
      })
      setShowSuccessDialog(true)
    },
  })

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      stationId: "",
      chargingPoints: [
        {
          connectorType: "",
          powerKw: 22,
          chargingSpeed: ChargingSpeed.FAST,
          slotNumber: "",
          maxVoltage: 240,
          maxCurrent: 32,
          averageSessionDuration: 60,
          notes: "",
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "chargingPoints",
  })

  const selectedStationId = watch("stationId")
  const selectedStation = stations.find(
    (s: Station) => s.id === parseInt(selectedStationId),
  )

  // Auto-select charging speed based on power for each point
  const updateChargingSpeed = (index: number, powerKw: number) => {
    let speed = ChargingSpeed.SLOW
    if (powerKw >= 50) {
      speed = ChargingSpeed.SUPER_FAST
    } else if (powerKw >= 22) {
      speed = ChargingSpeed.FAST
    }
    setValue(`chargingPoints.${index}.chargingSpeed`, speed)
  }

  const handlePowerChange = (index: number, value: number) => {
    setValue(`chargingPoints.${index}.powerKw`, value)
    updateChargingSpeed(index, value)
  }

  const handleCopyPoint = (index: number) => {
    const point = watch(`chargingPoints.${index}`)
    append({ ...point })
  }

  const addNewPoint = () => {
    append({
      connectorType: "",
      powerKw: 22,
      chargingSpeed: ChargingSpeed.FAST,
      slotNumber: "",
      maxVoltage: 240,
      maxCurrent: 32,
      averageSessionDuration: 60,
      notes: "",
    })
  }

  const onSubmit = async (data: FormValues) => {
    if (!data.stationId) {
      return
    }
    createMutation.mutate(data)
  }

  const isFormValid = () => {
    return (
      selectedStationId &&
      fields.length > 0 &&
      fields.every((_, index) => {
        const connectorType = watch(`chargingPoints.${index}.connectorType`)
        const powerKw = watch(`chargingPoints.${index}.powerKw`)
        return connectorType && powerKw > 0
      })
    )
  }

  const completedPoints = fields.filter((_, index) => {
    const connectorType = watch(`chargingPoints.${index}.connectorType`)
    const powerKw = watch(`chargingPoints.${index}.powerKw`)
    return connectorType && powerKw > 0
  }).length

  if (isLoadingStations) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">Loading stations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (stationsError) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {stationsError instanceof Error
              ? stationsError.message
              : "Failed to load stations"}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-slate-900 hover:bg-slate-800"
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
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
                Add New Chargers
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Add Multiple Charging Points
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Add one or more charging points to an existing station
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  Select the station where these charging points will be
                  installed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Select Station *
                  </label>
                  <Select
                    onValueChange={(value) => setValue("stationId", value)}
                    value={selectedStationId}
                  >
                    <SelectTrigger
                      className={cn(
                        errors.stationId && "border-red-500 ring-red-500",
                      )}
                    >
                      <SelectValue placeholder="Choose a station..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station: Station) => (
                        <SelectItem
                          key={station.id}
                          value={station.id.toString()}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{station.name}</span>
                            <span className="text-xs text-slate-500">
                              {station.location}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stationId && (
                    <p className="text-sm text-red-500">
                      {errors.stationId.message}
                    </p>
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

          {/* Charging Points List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Charging Points
                </h2>
                <p className="text-sm text-slate-500">
                  {completedPoints} of {fields.length} points completed
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addNewPoint}
                disabled={!selectedStationId}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Point
              </Button>
            </div>

            <AnimatePresence>
              {fields.map((field, index) => (
                <ChargingPointForm
                  key={field.id}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  remove={remove}
                  onCopy={handleCopyPoint}
                  isRemoving={createMutation.isPending}
                  watchChargingSpeed={(idx) =>
                    watch(`chargingPoints.${idx}.chargingSpeed`)
                  }
                  watchPowerKw={(idx) => watch(`chargingPoints.${idx}.powerKw`)}
                  watchConnectorType={(idx) =>
                    watch(`chargingPoints.${idx}.connectorType`)
                  }
                  onPowerChange={handlePowerChange}
                  onVoltageChange={(idx, value) =>
                    setValue(`chargingPoints.${idx}.maxVoltage`, value)
                  }
                  onCurrentChange={(idx, value) =>
                    setValue(`chargingPoints.${idx}.maxCurrent`, value)
                  }
                  onDurationChange={(idx, value) =>
                    setValue(
                      `chargingPoints.${idx}.averageSessionDuration`,
                      value,
                    )
                  }
                />
              ))}
            </AnimatePresence>

            {fields.length === 0 && (
              <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800">
                <CardContent className="py-12 text-center">
                  <Zap className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">
                    No charging points added yet
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addNewPoint}
                    disabled={!selectedStationId}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Charging Point
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Submit Button Section */}
          {fields.length > 0 && (
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
                        <p className="text-xs text-slate-500">Ready to add</p>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {completedPoints} of {fields.length} points completed
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCancelDialog(true)}
                        className="flex-1 sm:flex-none"
                        disabled={createMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          !isFormValid() ||
                          createMutation.isPending
                        }
                        className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
                        size="lg"
                      >
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding {completedPoints} Points...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Add {completedPoints} Charging Point
                            {completedPoints !== 1 ? "s" : ""}
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
                              width: `${(completedPoints / fields.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs">
                          {completedPoints}/{fields.length} points ready
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </form>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Cancel Charging Points Addition
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel? Any unsaved changes will be
                lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={createMutation.isPending}>
                Continue Editing
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.back()}
                disabled={createMutation.isPending}
              >
                Yes, Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Success/Error Dialog */}
        <AlertDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                {submitResult?.success ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
                <AlertDialogTitle>
                  {submitResult?.success ? "Success!" : "Error"}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="pt-4">
                <div className="space-y-3">
                  <p>{submitResult?.message}</p>
                  {submitResult?.data && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-sm">
                        Successfully created:{" "}
                        <span className="font-semibold text-green-600">
                          {submitResult.data.created}
                        </span>
                      </p>
                      {submitResult.data.failed > 0 && (
                        <p className="text-sm mt-1">
                          Failed:{" "}
                          <span className="font-semibold text-red-600">
                            {submitResult.data.failed}
                          </span>
                        </p>
                      )}
                      {submitResult.data.errors && (
                        <div className="mt-2 text-xs text-slate-500">
                          {submitResult.data.errors.map((err, idx) => (
                            <p key={idx}>
                              Point {err.index + 1}: {err.error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setShowSuccessDialog(false)
                  if (submitResult?.success && submitResult.data.created > 0) {
                    router.push("/ev-charge-manager/chargers?success=true")
                  }
                }}
              >
                {submitResult?.success ? "View Chargers" : "Try Again"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
