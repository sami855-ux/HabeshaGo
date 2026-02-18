"use client"

import { useState } from "react"
import { User, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge } from "./StatusBadge"

interface SimpleDriver {
  id: string
  name: string
  licenseNo: string
  status: string
  phone?: string
}

interface Bus {
  id: number
  driverId?: string
  driver?: SimpleDriver
}

interface UpdateDriverDialogProps {
  bus: Bus
  drivers: SimpleDriver[]
  onUpdate: (driverId: string | null) => Promise<void>
}

export function UpdateDriverDialog({ bus, drivers, onUpdate }: UpdateDriverDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(bus.driverId || "unassign")

  const handleSubmit = async () => {
    try {
      setLoading(true)
      // Convert "unassign" to null, otherwise use the driver ID
      await onUpdate(selectedDriver === "unassign" ? null : selectedDriver)
      setOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          Change Driver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Driver Assignment</DialogTitle>
          <DialogDescription>
            Assign a different driver to this bus or unassign the current driver.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {bus.driver ? (
            <div className="space-y-2">
              <Label>Current Driver</Label>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar>
                  <AvatarFallback>{bus.driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{bus.driver.name}</div>
                  <div className="text-sm text-muted-foreground">{bus.driver.licenseNo}</div>
                </div>
                <StatusBadge status={bus.driver.status} size="sm" />
              </div>
            </div>
          ) : (
            <div className="text-center p-4 border rounded-lg">
              <p className="text-muted-foreground">No driver currently assigned</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="driver">Select New Driver</Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a driver">
                  {selectedDriver === "unassign" ? "Unassign Driver" : 
                   drivers.find(d => d.id === selectedDriver)?.name || "Select a driver"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassign">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserX className="h-4 w-4" />
                    Unassign Driver
                  </div>
                </SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{driver.name}</span>
                        <span className="text-xs text-muted-foreground">({driver.licenseNo})</span>
                      </div>
                      <StatusBadge status={driver.status} size="sm" />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Note: This will update the driver assignment immediately. The previous driver will be notified.
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}