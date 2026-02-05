"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Clock,
  Wrench,
  XCircle,
  AlertCircle,
  Car,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Vehicle, VehicleStatus } from "@/types/vehicle"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { updateVehicleStatus } from "@/services/vehicle.api"

const statusOptions = [
  {
    value: "ACTIVE" as VehicleStatus,
    label: "Active",
    description: "Vehicle is operational and ready for use",
    icon: CheckCircle,
    color:
      "bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-900/10",
    borderColor: "border-green-200 dark:border-green-800",
    textColor: "text-green-800 dark:text-green-300",
    iconColor: "text-green-600 dark:text-green-400",
    badgeColor: "bg-green-500",
    impact: "positive",
    impactText: "Vehicle will be available for assignments",
  },
  {
    value: "UNDER_MAINTENANCE" as VehicleStatus,
    label: "Under Maintenance",
    description: "Vehicle is currently undergoing service",
    icon: Wrench,
    color:
      "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/10",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-800 dark:text-amber-300",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeColor: "bg-amber-500",
    impact: "warning",
    impactText: "Vehicle will be temporarily unavailable",
  },
  {
    value: "OUT_OF_SERVICE" as VehicleStatus,
    label: "Out of Service",
    description: "Vehicle is temporarily unavailable",
    icon: Clock,
    color:
      "bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/20 dark:to-red-900/10",
    borderColor: "border-red-200 dark:border-red-800",
    textColor: "text-red-800 dark:text-red-300",
    iconColor: "text-red-600 dark:text-red-400",
    badgeColor: "bg-red-500",
    impact: "negative",
    impactText: "Vehicle cannot be assigned to any routes",
  },
  {
    value: "INACTIVE" as VehicleStatus,
    label: "Inactive",
    description: "Vehicle is not in use",
    icon: XCircle,
    color:
      "bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900/80",
    borderColor: "border-gray-200 dark:border-gray-700",
    textColor: "text-gray-800 dark:text-gray-300",
    iconColor: "text-gray-600 dark:text-gray-400",
    badgeColor: "bg-gray-500",
    impact: "neutral",
    impactText: "Vehicle will be removed from active fleet",
  },
]

interface UpdateStatusSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle
  onSuccess: (status: VehicleStatus) => void
  vehicleId: string
}

export default function UpdateStatusSheet({
  open,
  onOpenChange,
  vehicle,
  onSuccess,
  vehicleId,
}: UpdateStatusSheetProps) {
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus>(
    vehicle.status,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedStatus(vehicle.status)
      setShowConfirmation(false)
    }
  }, [open, vehicle.status])

  const getCurrentStatusConfig = () => {
    return statusOptions.find((opt) => opt.value === vehicle.status)
  }

  const getSelectedStatusConfig = () => {
    return statusOptions.find((opt) => opt.value === selectedStatus)
  }

  const handleSubmit = async () => {
    if (selectedStatus === vehicle.status) {
      onOpenChange(false)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await updateVehicleStatus(vehicleId, selectedStatus)
      if (res.success) {
        onSuccess(selectedStatus)
        toast.success(`Vehicle status updated successfully`, {
          description: `${vehicle.plateNumber} is now ${selectedStatus}`,
          icon: <CheckCircle className="h-5 w-5" />,
        })
        onOpenChange(false)
      } else {
        toast.error(res.message)
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update vehicle status", {
        description: "Please try again or contact support",
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStatusConfig = getCurrentStatusConfig()
  const selectedStatusConfig = getSelectedStatusConfig()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg p-0">
        <div className="h-full overflow-y-auto">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 px-6 py-2">
            <SheetHeader className="text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <SheetTitle className="text-2xl font-bold tracking-tight">
                  Update Vehicle Status
                </SheetTitle>
              </div>
              <SheetDescription className="text-base">
                Change the operational status of{" "}
                <span className="font-semibold text-foreground">
                  {vehicle.plateNumber}
                </span>
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="px-6 py-8 space-y-8">
            {/* Current Status Card */}
            <div className="space-y-4">
              <Label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Current Status
              </Label>
              {currentStatusConfig && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all",
                    currentStatusConfig.color,
                    currentStatusConfig.borderColor,
                  )}
                >
                  <div
                    className={cn("p-3 rounded-xl", currentStatusConfig.color)}
                  >
                    <currentStatusConfig.icon
                      className={cn("h-6 w-6", currentStatusConfig.iconColor)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">
                        {currentStatusConfig.label}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium",
                          currentStatusConfig.textColor,
                        )}
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              currentStatusConfig.badgeColor,
                            )}
                          />
                          CURRENT
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentStatusConfig.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Status Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Select New Status
              </Label>
              <div className="space-y-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = selectedStatus === option.value
                  return (
                    <motion.div
                      key={option.value}
                      whileTap={{ scale: 0.99 }}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "relative overflow-hidden group cursor-pointer p-5 rounded-xl border-2 transition-all duration-300",
                        isSelected
                          ? cn(
                              "border-primary shadow-lg shadow-primary/10",
                              option.borderColor,
                            )
                          : "border-transparent hover:border-muted-foreground/20",
                      )}
                      onClick={() => {
                        setSelectedStatus(option.value)
                        setShowConfirmation(true)
                      }}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="selected-status"
                          className="absolute inset-0 bg-primary/5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}

                      <div className="relative flex items-center gap-4">
                        <div
                          className={cn(
                            "p-3 rounded-xl transition-transform duration-300",
                            option.color,
                            isSelected && "scale-110",
                          )}
                        >
                          <Icon className={cn("h-5 w-5", option.iconColor)} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-base">
                              {option.label}
                            </h3>
                            {isSelected && (
                              <Badge
                                variant="default"
                                className="text-xs font-medium gap-1 "
                              >
                                SELECTED
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>

                          {/* Impact indicator */}
                          <div className="flex items-center gap-2 mt-2">
                            {option.impact === "positive" && (
                              <>
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  {option.impactText}
                                </span>
                              </>
                            )}
                            {option.impact === "warning" && (
                              <>
                                <AlertCircle className="h-3 w-3 text-amber-500" />
                                <span className="text-xs text-amber-600 dark:text-amber-400">
                                  {option.impactText}
                                </span>
                              </>
                            )}
                            {option.impact === "negative" && (
                              <>
                                <TrendingDown className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600 dark:text-red-400">
                                  {option.impactText}
                                </span>
                              </>
                            )}
                            {option.impact === "neutral" && (
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {option.impactText}
                              </span>
                            )}
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle className="h-6 w-6 text-primary " />
                        ) : (
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Status Change Preview */}
            <AnimatePresence>
              {selectedStatus !== vehicle.status && selectedStatusConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <Label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Status Change Preview
                  </Label>

                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "relative overflow-hidden p-6 rounded-2xl border-2",
                      "bg-gradient-to-r from-primary/5 to-transparent",
                      "dark:from-primary/10 dark:to-transparent",
                      "border-primary/20 dark:border-primary/30",
                    )}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-12 translate-x-12" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8" />

                    <div className="relative space-y-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center",
                            currentStatusConfig?.color,
                          )}
                        >
                          <Car className="h-6 w-6 text-muted-foreground" />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium">{vehicle.plateNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.model}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              currentStatusConfig?.color,
                            )}
                          >
                            {/* <currentStatusConfig?.icon className={cn(
                              "h-4 w-4",
                              currentStatusConfig?.iconColor
                            )} /> */}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Current
                            </p>
                            <p className="font-medium">
                              {currentStatusConfig?.label}
                            </p>
                          </div>
                        </div>

                        <ArrowRight className="h-5 w-5 text-muted-foreground mx-4" />

                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              selectedStatusConfig.color,
                            )}
                          >
                            <selectedStatusConfig.icon
                              className={cn(
                                "h-4 w-4",
                                selectedStatusConfig.iconColor,
                              )}
                            />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">New</p>
                            <p className="font-medium">
                              {selectedStatusConfig.label}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="text-muted-foreground">
                          This change will take effect immediately
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with actions */}
          <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-2"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "flex-1 h-10 rounded-md font-semibold relative overflow-hidden",
                  selectedStatus === vehicle.status
                    ? "opacity-50 cursor-not-allowed"
                    : "shadow-lg shadow-primary/20 ",
                )}
                onClick={handleSubmit}
                disabled={isSubmitting || selectedStatus === vehicle.status}
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="mr-2"
                    >
                      <Shield className="h-4 w-4" />
                    </motion.div>
                    Updating Status...
                  </>
                ) : (
                  <>Confirm Status Change</>
                )}
              </Button>
            </div>

            {selectedStatus === vehicle.status && (
              <p className="text-center text-sm text-muted-foreground mt-3">
                Select a different status to enable confirmation
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
