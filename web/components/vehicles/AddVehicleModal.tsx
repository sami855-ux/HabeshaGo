"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Car,
  Fingerprint,
  Battery,
  AlertCircle,
  CheckCircle2,
  Zap,
  User,
  Phone,
  MapPin,
  X,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/store"

interface AddVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: VehicleUserFormData) => void
  isSubmitting: boolean
}

export interface VehicleUserFormData {
  type: string
  vin: string
  model: string
  plateNumber: string
  capacity: number
  manufacturer: string
  year: number
  connectorType: string
  gpsDeviceId?: string
  mileage?: number
  ownerName?: string
  ownerPhone?: string
  image?: File
}

export const vehicleTypes = [
  { value: "BUS", label: "Bus", icon: "🚌" },
  { value: "MINIBUS", label: "Minibus", icon: "🚐" },
  { value: "TAXI", label: "Taxi", icon: "🚕" },
  { value: "VAN", label: "Van", icon: "🚐" },
  { value: "TRUCK", label: "Truck", icon: "🚛" },
]

const connectorTypes = [
  { value: "TYPE2", label: "Type 2 (IEC 62196)", icon: "🔌" },
  { value: "CCS", label: "CCS (Combined Charging System)", icon: "⚡" },
  { value: "CHADEMO", label: "CHAdeMO", icon: "🔋" },
]

export function AddVehicleModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddVehicleModalProps) {
  const { user, loading } = useAppSelector((store) => store.user)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const isManualSubmitRef = useRef(false) // Use ref instead of state to avoid closure issues
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
    setValue,
    watch,
    trigger,
  } = useForm<VehicleUserFormData>({
    defaultValues: {
      type: "VAN",
      manufacturer: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      plateNumber: "",
      capacity: 0,
      connectorType: "",
      gpsDeviceId: "",
      mileage: 0,
      ownerName: "",
      ownerPhone: "",
    },
    mode: "onChange",
  })

  const formValues = watch()

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset()
      setImagePreview(null)
      setCurrentStep(1)
      isManualSubmitRef.current = false
    }
  }, [open, reset])

  // Prevent any automatic form submission
  useEffect(() => {
    const preventAutoSubmit = (e: Event) => {
      // Only allow submission if it's a manual button click on step 4
      if (currentStep !== 4) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    const form = formRef.current
    if (form) {
      form.addEventListener("submit", preventAutoSubmit, true)
      return () => form.removeEventListener("submit", preventAutoSubmit, true)
    }
  }, [currentStep])

  useEffect(() => {
    if (!loading && user) {
      setValue("ownerName", user.name || "")
      setValue("ownerPhone", user.phone || "")
    }
  }, [user, loading, setValue])

  // Prevent Enter key from submitting on any step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"

      // Prevent Enter key from submitting the form on any step
      if (e.key === "Enter" && isInputField) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const onFormSubmit = (data: VehicleUserFormData) => {
    console.log("onFormSubmit called", {
      isManualSubmit: isManualSubmitRef.current,
      currentStep,
    })

    // Only submit if manually triggered and on step 4
    if (!isManualSubmitRef.current || currentStep !== 4) {
      console.log("Submission blocked - not manual or wrong step")
      isManualSubmitRef.current = false
      return
    }

    console.log("Submitting form data:", data)
    onSubmit({
      ...data,
      year: Number(data.year),
      capacity: Number(data.capacity),
      mileage: data.mileage ? Number(data.mileage) : 0,
    })

    isManualSubmitRef.current = false
  }

  const handleManualSubmit = () => {
    console.log("Manual submit triggered")
    if (currentStep === 4) {
      isManualSubmitRef.current = true
      // Directly call handleSubmit
      handleSubmit(onFormSubmit)()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }

      setValue("image", file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const removeImage = () => {
    setValue("image", undefined)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
  }

  const getFieldError = (fieldName: keyof VehicleUserFormData) => {
    return errors[fieldName] && touchedFields[fieldName]
      ? errors[fieldName].message
      : null
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return (
          formValues.type &&
          formValues.manufacturer &&
          formValues.model &&
          formValues.year &&
          formValues.year > 1900 &&
          formValues.year <= new Date().getFullYear() + 1
        )
      case 2:
        return formValues.vin?.length === 17 && formValues.plateNumber
      case 3:
        return formValues.capacity > 0 && formValues.connectorType
      case 4:
        return true // Always true for owner info step
      default:
        return true
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof VehicleUserFormData)[] = []

    if (currentStep === 1) {
      fieldsToValidate = ["type", "manufacturer", "model", "year"]
    } else if (currentStep === 2) {
      fieldsToValidate = ["vin", "plateNumber"]
    } else if (currentStep === 3) {
      fieldsToValidate = ["capacity", "connectorType"]
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canGoToStep = (step: number) => {
    if (step <= currentStep) return true
    if (step === currentStep + 1 && isStepValid(currentStep)) return true
    return false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 p-6 border-b sticky top-0 z-10">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-xl">
                  <Car className="h-6 w-6 text-white" />
                </div>
                Add New Vehicle
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Enter your vehicle details to add it to your garage and start
                charging.
              </DialogDescription>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between gap-2 mt-6">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1 flex items-center gap-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                      currentStep >= step
                        ? "bg-orange-500 text-white shadow-lg"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500",
                      currentStep > step && isStepValid(step) && "bg-green-500",
                      canGoToStep(step) && "cursor-pointer",
                    )}
                    onClick={() => canGoToStep(step) && setCurrentStep(step)}
                  >
                    {currentStep > step && isStepValid(step) ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm hidden sm:inline",
                      currentStep >= step
                        ? "text-orange-600 font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {step === 1 && "Basic Info"}
                    {step === 2 && "Identification"}
                    {step === 3 && "EV Details"}
                    {step === 4 && "Owner Info"}
                  </span>
                  {step < 4 && (
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit(onFormSubmit)}
            className="p-6"
          >
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Car className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Vehicle Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formValues.type}
                      onValueChange={(value) => setValue("type", value)}
                    >
                      <SelectTrigger className="transition-all focus:ring-2 focus:ring-orange-500 w-full">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="manufacturer"
                      className="text-sm font-medium"
                    >
                      Brand <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="manufacturer"
                      placeholder="Tesla, BMW, Mercedes..."
                      {...register("manufacturer", {
                        required: "Brand is required",
                      })}
                      className={cn(
                        "transition-all focus:ring-2 focus:ring-orange-500",
                        getFieldError("manufacturer") && "border-red-500",
                      )}
                    />
                    <AnimatePresence>
                      {getFieldError("manufacturer") && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("manufacturer")}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-sm font-medium">
                      Model <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="model"
                      placeholder="Model 3, i4, Taycan..."
                      {...register("model", { required: "Model is required" })}
                      className={cn(
                        "transition-all focus:ring-2 focus:ring-orange-500",
                        getFieldError("model") && "border-red-500",
                      )}
                    />
                    <AnimatePresence>
                      {getFieldError("model") && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("model")}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">
                      Year <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2024"
                      {...register("year", {
                        required: "Year is required",
                        min: {
                          value: 1900,
                          message: "Year must be 1900 or later",
                        },
                        max: {
                          value: new Date().getFullYear() + 1,
                          message: "Year cannot be in the future",
                        },
                      })}
                      className={cn(
                        "transition-all focus:ring-2 focus:ring-orange-500",
                        getFieldError("year") && "border-red-500",
                      )}
                    />
                    <AnimatePresence>
                      {getFieldError("year") && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-500"
                        >
                          {getFieldError("year")}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Identification */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Fingerprint className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">Identification</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="vin" className="text-sm font-medium">
                      VIN <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vin"
                      placeholder="17-character Vehicle Identification Number"
                      {...register("vin", {
                        required: "VIN is required",
                        minLength: {
                          value: 17,
                          message: "VIN must be exactly 17 characters",
                        },
                        maxLength: {
                          value: 17,
                          message: "VIN must be exactly 17 characters",
                        },
                      })}
                      className={cn(
                        "font-mono text-sm uppercase transition-all focus:ring-2 focus:ring-orange-500",
                        getFieldError("vin") && "border-red-500",
                        formValues.vin?.length === 17 &&
                          !errors.vin &&
                          "border-green-500",
                      )}
                    />
                    <AnimatePresence>
                      {getFieldError("vin") && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("vin")}
                        </motion.p>
                      )}
                      {formValues.vin?.length === 17 && !errors.vin && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-green-500 flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Valid VIN format
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="plateNumber"
                      className="text-sm font-medium"
                    >
                      Plate Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="plateNumber"
                      placeholder="ABC-1234"
                      {...register("plateNumber", {
                        required: "Plate number is required",
                      })}
                      className={cn(
                        "uppercase transition-all focus:ring-2 focus:ring-orange-500",
                        getFieldError("plateNumber") && "border-red-500",
                      )}
                    />
                    <AnimatePresence>
                      {getFieldError("plateNumber") && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {getFieldError("plateNumber")}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="gpsDeviceId"
                      className="text-sm font-medium"
                    >
                      GPS Device ID{" "}
                      <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="gpsDeviceId"
                      placeholder="Enter GPS device identifier"
                      {...register("gpsDeviceId")}
                      className="transition-all focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mileage" className="text-sm font-medium">
                      Current Mileage (km)
                    </Label>
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="0"
                      {...register("mileage", {
                        min: {
                          value: 0,
                          message: "Mileage cannot be negative",
                        },
                      })}
                      className="transition-all focus:ring-2 focus:ring-orange-500"
                    />
                    {getFieldError("mileage") && (
                      <p className="text-sm text-red-500">
                        {getFieldError("mileage")}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: EV Details */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">EV Specifications</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-sm font-medium">
                      Battery Capacity (kWh){" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Battery className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="capacity"
                        type="number"
                        step="0.1"
                        placeholder="75"
                        className="pl-9 transition-all focus:ring-2 focus:ring-orange-500"
                        {...register("capacity", {
                          required: "Battery capacity is required",
                          min: {
                            value: 0,
                            message: "Capacity must be positive",
                          },
                          max: {
                            value: 200,
                            message: "Capacity seems too high",
                          },
                        })}
                      />
                    </div>
                    <AnimatePresence>
                      {getFieldError("capacity") && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-red-500"
                        >
                          {getFieldError("capacity")}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="connectorType"
                      className="text-sm font-medium"
                    >
                      Connector Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formValues.connectorType}
                      onValueChange={(value) =>
                        setValue("connectorType", value)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "transition-all focus:ring-2 focus:ring-orange-500",
                          errors.connectorType && "border-red-500",
                        )}
                      >
                        <SelectValue placeholder="Select your connector type" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectorTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.connectorType && (
                      <p className="text-sm text-red-500">
                        {errors.connectorType.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image Upload with Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vehicle Image</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 transition-all hover:border-orange-500">
                    {!imagePreview ? (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="mt-2">
                          <Label
                            htmlFor="image-upload"
                            className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium"
                          >
                            Click to upload
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Vehicle preview"
                          className="max-h-64 mx-auto rounded-lg object-contain"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <p className="text-center text-sm text-muted-foreground mt-2">
                          Click the X to remove and upload a different image
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Owner Information */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">Owner Information</h3>
                  <Badge variant="secondary">Optional</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-sm font-medium">
                      Owner Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ownerName"
                        placeholder="Full name of the vehicle owner"
                        className="pl-9 transition-all focus:ring-2 focus:ring-orange-500"
                        {...register("ownerName")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone" className="text-sm font-medium">
                      Owner Phone
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ownerPhone"
                        placeholder="+1 234 567 8900"
                        className="pl-9 transition-all focus:ring-2 focus:ring-orange-500"
                        {...register("ownerPhone")}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        Why provide owner information?
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        This helps us contact the vehicle owner if needed for
                        charging sessions or emergencies. This information is
                        optional and will be kept private.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 pt-6 mt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={
                  currentStep === 1 ? () => onOpenChange(false) : prevStep
                }
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px]"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleManualSubmit}
                  className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px] transition-all duration-200 hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Vehicle...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Add Vehicle
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
