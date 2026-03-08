import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Globe,
  MapPin,
  Clock,
  LogOut,
  Shield,
  Lock,
  RefreshCw,
  Info,
  SmartphoneNfc,
  Battery,
  Wifi,
  ShieldAlert,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Enhanced device inventory with more details
const deviceInventory = [
  {
    id: 1,
    name: "iPhone 15 Pro",
    type: "mobile",
    os: "iOS 17.2",
    browser: "Safari",
    location: "San Francisco, CA",
    ip: "192.168.1.101",
    lastSeen: "2 minutes ago",
    isCurrent: true,
    status: "active" as const,
  },
  {
    id: 2,
    name: "MacBook Pro",
    type: "laptop",
    os: "macOS Sonoma",
    browser: "Chrome",
    location: "New York, NY",
    ip: "192.168.1.102",
    lastSeen: "1 hour ago",
    isCurrent: false,
    status: "active" as const,
  },
  {
    id: 3,
    name: "iPad Air",
    type: "tablet",
    os: "iPadOS 17",
    browser: "Safari",
    location: "London, UK",
    ip: "192.168.1.103",
    lastSeen: "3 days ago",
    isCurrent: false,
    status: "inactive" as const,
  },
  {
    id: 4,
    name: "Windows Desktop",
    type: "desktop",
    os: "Windows 11",
    browser: "Firefox",
    location: "Tokyo, Japan",
    ip: "192.168.1.104",
    lastSeen: "1 week ago",
    isCurrent: false,
    status: "suspicious" as const,
  },
]

function DeviceModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [devices, setDevices] = useState(deviceInventory)
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false)
  const [showAllDetails, setShowAllDetails] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="size-5" />
      case "laptop":
        return <Laptop className="size-5" />
      case "tablet":
        return <Tablet className="size-5" />
      case "desktop":
        return <Monitor className="size-5" />
      default:
        return <Smartphone className="size-5" />
    }
  }

  const getStatusBadge = (status: "active" | "inactive" | "suspicious") => {
    const variants = {
      active: {
        light:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
        icon: <CheckCircle2 className="size-3" />,
        text: "Active",
      },
      inactive: {
        light:
          "bg-muted text-muted-foreground border-border dark:bg-muted/50 dark:text-muted-foreground",
        icon: <Clock className="size-3" />,
        text: "Inactive",
      },
      suspicious: {
        light:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
        icon: <ShieldAlert className="size-3" />,
        text: "Suspicious",
      },
    }

    const variant = variants[status]
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1 px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
          variant.light
        )}
      >
        {variant.icon}
        {variant.text}
      </Badge>
    )
  }

  const handleLogoutDevice = (deviceId: number) => {
    setDevices(devices.filter((device) => device.id !== deviceId))
    toast.success("Device logged out successfully", {
      description: "This device will need to sign in again.",
      icon: <Lock className="text-emerald-500" />,
      action: {
        label: "Undo",
        onClick: () => {
          const device = deviceInventory.find((d) => d.id === deviceId)
          if (device) setDevices((prev) => [...prev, device])
        },
      },
    })
  }

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const currentDevice = devices.find((device) => device.isCurrent)
    setDevices(currentDevice ? [currentDevice] : [])

    setIsLoggingOutAll(false)
    toast.success("All other devices logged out", {
      description: "You'll stay signed in on this device.",
      icon: <Shield className="text-emerald-500" />,
    })
  }

  const handleMarkAsTrusted = (deviceId: number) => {
    setDevices(
      devices.map((device) =>
        device.id === deviceId
          ? { ...device, status: "active" as const }
          : device
      )
    )
    toast.success("Device marked as trusted", {
      icon: <Shield className="text-emerald-500" />,
    })
  }

  const handleViewDetails = (device: (typeof devices)[0]) => {
    toast.custom((t) => (
      <div className="w-full max-w-md rounded-lg bg-background p-4 shadow-lg border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-lg p-2",
                device.isCurrent
                  ? "bg-primary/10 text-primary dark:bg-primary/20"
                  : device.status === "suspicious"
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-muted"
              )}
            >
              {getDeviceIcon(device.type)}
            </div>
            <div>
              <p className="font-semibold">{device.name}</p>
              <p className="text-sm text-muted-foreground">{device.os}</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => toast.dismiss(t)}
            className="size-8"
          >
            ×
          </Button>
        </div>
        <Separator className="my-3" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Browser</p>
            <p className="font-medium">{device.browser}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Location</p>
            <p className="font-medium flex items-center gap-1">
              <MapPin className="size-3" />
              {device.location}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">IP Address</p>
            <p className="font-mono font-medium">{device.ip}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Last Seen</p>
            <p className="font-medium flex items-center gap-1">
              <Clock className="size-3" />
              {device.lastSeen}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => toast.dismiss(t)}
          >
            Close
          </Button>
          {!device.isCurrent && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => {
                handleLogoutDevice(device.id)
                toast.dismiss(t)
              }}
            >
              <LogOut className="size-3 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    ))
  }

  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1)
    toast.info("Refreshing device list...", {
      duration: 1000,
    })
  }

  const getActiveSessionsCount = () => {
    return devices.filter((d) => d.status === "active").length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none shadow-xl dark:shadow-2xl max-h-[85vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-2 rounded-xl">
                  <SmartphoneNfc className="size-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    Active Sessions
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs font-normal bg-gradient-to-r from-primary/10 to-primary/5"
                    >
                      <Shield className="size-3" />
                      Security Overview
                    </Badge>
                    <Badge variant="outline" className="text-xs font-normal">
                      <Zap className="size-3 mr-1" />
                      {getActiveSessionsCount()} Active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <DialogDescription className="text-muted-foreground pt-2">
              Manage your active sessions across devices. Review locations and
              security status.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Total devices: {devices.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllDetails(!showAllDetails)}
                className="h-7 text-xs gap-1"
              >
                {showAllDetails ? (
                  <EyeOff className="size-3" />
                ) : (
                  <Eye className="size-3" />
                )}
                {showAllDetails ? "Hide Details" : "Show Details"}
              </Button>
            </div>

            <div className="space-y-3 pb-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className={cn(
                    "group relative rounded-xl border p-4 transition-all duration-300 hover:shadow-lg",
                    "bg-gradient-to-br from-background to-muted/5",
                    "dark:from-background dark:to-muted/10",
                    device.isCurrent &&
                      "border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5",
                    device.status === "suspicious" &&
                      "border-red-300/50 dark:border-red-800/50 bg-gradient-to-br from-red-50/50 to-red-50/30 dark:from-red-950/30 dark:to-red-950/10",
                    selectedDevice === device.id && "ring-2 ring-primary/20"
                  )}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "rounded-xl p-2.5 transition-all duration-300",
                          "bg-gradient-to-br",
                          device.isCurrent
                            ? "from-primary/20 to-primary/10 text-primary dark:from-primary/30 dark:to-primary/20"
                            : device.status === "suspicious"
                            ? "from-red-100 to-red-50 text-red-600 dark:from-red-900/40 dark:to-red-900/20 dark:text-red-400"
                            : "from-muted to-muted/50 text-muted-foreground"
                        )}
                      >
                        {getDeviceIcon(device.type)}
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{device.name}</p>
                          {device.isCurrent && (
                            <Badge
                              variant="default"
                              className="text-xs bg-gradient-to-r from-primary to-primary/80"
                            >
                              Current Device
                            </Badge>
                          )}
                          {getStatusBadge(device.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-medium px-2 py-0.5 rounded-full bg-muted/50 dark:bg-muted/30">
                              {device.os}
                            </span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{device.browser}</span>
                          </div>

                          {showAllDetails && (
                            <div className="space-y-1.5 pt-1 border-t border-border/50 dark:border-border/30">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="size-3 text-muted-foreground" />
                                  <span className="truncate">
                                    {device.location}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Globe className="size-3 text-muted-foreground" />
                                  <span className="font-mono truncate">
                                    {device.ip}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <Clock className="size-3 text-muted-foreground" />
                                <span>Last seen: {device.lastSeen}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(device)}
                          className="gap-2 cursor-pointer"
                        >
                          <Info className="size-4" />
                          View Details
                        </DropdownMenuItem>
                        {device.status === "suspicious" && (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsTrusted(device.id)}
                            className="gap-2 cursor-pointer text-emerald-600 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="size-4" />
                            Mark as Trusted
                          </DropdownMenuItem>
                        )}
                        {!device.isCurrent && (
                          <DropdownMenuItem
                            onClick={() => handleLogoutDevice(device.id)}
                            className="gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                          >
                            <LogOut className="size-4" />
                            Logout Device
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className=" bg-background p-6 pt-4 sticky bottom-0">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-11 rounded-xl transition-all hover:scale-[1.02]"
              >
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogoutAllDevices}
                disabled={
                  isLoggingOutAll ||
                  devices.filter((d) => !d.isCurrent).length === 0
                }
                className="flex-1 h-11 rounded-xl transition-all hover:scale-[1.02] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
              >
                {isLoggingOutAll ? (
                  <>
                    <div className="animate-spin rounded-full size-4 border-2 border-current border-t-transparent mr-2" />
                    Logging Out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 size-4" />
                    Logout All Others
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DeviceModal }
