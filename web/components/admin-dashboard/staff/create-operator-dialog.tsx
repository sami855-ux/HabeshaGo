// app/operators-management/components/create-operator-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Car,
  ParkingSquare,
  Zap,
  UserPlus,
  Mail,
  Phone,
  User,
  Shield,
  Calendar,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type Role } from "@/types/operator"
import React from "react"

interface CreateOperatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRole: Role | null
}

export default function CreateOperatorDialog({
  open,
  onOpenChange,
  selectedRole,
}: CreateOperatorDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED",
    // Driver specific fields based on your schema
    licenseNo: "",
    experience: "",
    assignedBus: "",
    assignedMinibus: "",
    // Parking operator fields
    assignedParkingArea: "",
    shift: "",
    // EV operator fields
    assignedChargingStation: "",
    chargerType: "",
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        status: "ACTIVE",
        licenseNo: "",
        experience: "",
        assignedBus: "",
        assignedMinibus: "",
        assignedParkingArea: "",
        shift: "",
        assignedChargingStation: "",
        chargerType: "",
      })
    }
  }, [open])

  const roleConfig = {
    DRIVER: {
      label: "Driver",
      icon: Car,
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    PARKING_OPERATOR: {
      label: "Parking Operator",
      icon: ParkingSquare,
      color: "bg-green-500/10 text-green-700 dark:text-green-300",
    },
    EV_OPERATOR: {
      label: "EV Operator",
      icon: Zap,
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    },
    STAFF: {
      label: "Staff",
      icon: UserPlus,
      color: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Prepare data based on role
      const operatorData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        role: selectedRole,
      }

      // Add role-specific fields
      if (selectedRole === "DRIVER") {
        Object.assign(operatorData, {
          licenseNo: formData.licenseNo,
          experience: formData.experience
            ? parseInt(formData.experience)
            : null,
          assignedBus: formData.assignedBus || null,
          assignedMinibus: formData.assignedMinibus || null,
        })
      } else if (selectedRole === "PARKING_OPERATOR") {
        Object.assign(operatorData, {
          assignedParkingArea: formData.assignedParkingArea,
          shift: formData.shift,
        })
      } else if (selectedRole === "EV_OPERATOR") {
        Object.assign(operatorData, {
          assignedChargingStation: formData.assignedChargingStation,
          chargerType: formData.chargerType,
        })
      }

      console.log("Creating operator:", operatorData)

      // Here you would make your API call
      // Example:
      // const response = await fetch('/api/operators', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(operatorData),
      // })

      // if (response.ok) {
      //   // Success handling
      // } else {
      //   // Error handling
      // }

      onOpenChange(false)

      // Show success toast/message
      // toast({
      //   title: "Operator created",
      //   description: `${formData.name} has been added successfully.`,
      // })
    } catch (error) {
      console.error("Error creating operator:", error)
      // Show error toast/message
      // toast({
      //   title: "Error",
      //   description: "Failed to create operator. Please try again.",
      //   variant: "destructive",
      // })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto border-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedRole && (
              <Badge
                variant="secondary"
                className={cn("gap-1.5", roleConfig[selectedRole].color)}
              >
                {roleConfig[selectedRole].icon &&
                  React.createElement(roleConfig[selectedRole].icon, {
                    className: "h-3.5 w-3.5",
                  })}
                {roleConfig[selectedRole].label}
              </Badge>
            )}
            <span>Add New Operator</span>
          </DialogTitle>
          <DialogDescription>
            Fill in the operator details below. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="pl-9"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="pl-9"
                    placeholder="operator@example.com"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-900/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Account Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Set the operator's account status
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      formData.status === "ACTIVE" ? "default" : "destructive"
                    }
                  >
                    {formData.status === "ACTIVE" ? "Active" : "Suspended"}
                  </Badge>
                  <Switch
                    checked={formData.status === "ACTIVE"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        status: checked ? "ACTIVE" : "SUSPENDED",
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Role-Specific Fields */}
            {selectedRole && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {roleConfig[selectedRole].label} Details
                  </h3>

                  {selectedRole === "DRIVER" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="licenseNo">
                            License Number{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="licenseNo"
                            value={formData.licenseNo}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                licenseNo: e.target.value,
                              })
                            }
                            placeholder="DL-123456"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience (Years)</Label>
                          <Input
                            id="experience"
                            type="number"
                            min="0"
                            max="50"
                            value={formData.experience}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                experience: e.target.value,
                              })
                            }
                            placeholder="5"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="assignedBus">Assigned Bus</Label>
                          <Select
                            value={formData.assignedBus}
                            onValueChange={(value) =>
                              setFormData({ ...formData, assignedBus: value })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a bus" />
                            </SelectTrigger>
                            <SelectContent className="">
                              <SelectItem value="bus-42">Bus #42</SelectItem>
                              <SelectItem value="bus-18">Bus #18</SelectItem>
                              <SelectItem value="bus-7">Bus #7</SelectItem>
                              <SelectItem value="bus-23">Bus #23</SelectItem>
                              <SelectItem value="bus-15">Bus #15</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="assignedMinibus">
                            Assigned Minibus
                          </Label>
                          <Select
                            value={formData.assignedMinibus}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                assignedMinibus: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a minibus" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mini-1">Minibus #1</SelectItem>
                              <SelectItem value="mini-2">Minibus #2</SelectItem>
                              <SelectItem value="mini-3">Minibus #3</SelectItem>
                              <SelectItem value="mini-4">Minibus #4</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
                        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 mb-2">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-medium">
                            Driver Information
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Drivers must have a valid license number and can be
                          assigned to either a bus or minibus.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedRole === "PARKING_OPERATOR" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignedParkingArea">
                          Parking Area <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="assignedParkingArea"
                          value={formData.assignedParkingArea}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              assignedParkingArea: e.target.value,
                            })
                          }
                          placeholder="Downtown Garage"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shift">
                          Shift <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.shift}
                          onValueChange={(value) =>
                            setFormData({ ...formData, shift: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MORNING">
                              Morning (6AM-2PM)
                            </SelectItem>
                            <SelectItem value="AFTERNOON">
                              Afternoon (2PM-10PM)
                            </SelectItem>
                            <SelectItem value="NIGHT">
                              Night (10PM-6AM)
                            </SelectItem>
                            <SelectItem value="FLEXIBLE">
                              Flexible Shift
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedRole === "EV_OPERATOR" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignedChargingStation">
                          Charging Station{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="assignedChargingStation"
                          value={formData.assignedChargingStation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              assignedChargingStation: e.target.value,
                            })
                          }
                          placeholder="Station #5"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chargerType">
                          Charger Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.chargerType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, chargerType: value })
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select charger type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AC_SLOW">
                              AC Slow Charger (Level 2)
                            </SelectItem>
                            <SelectItem value="DC_FAST">
                              DC Fast Charger (Level 3)
                            </SelectItem>
                            <SelectItem value="SUPERCHARGER">
                              Supercharger
                            </SelectItem>
                            <SelectItem value="HYPERCHARGER">
                              Hypercharger
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="mx-2 cursor-pointer">
              Create Operator
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
