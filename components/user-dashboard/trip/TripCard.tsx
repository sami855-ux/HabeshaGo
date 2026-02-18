import { useState } from "react"
import { Trip } from "@/types/trips"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  QrCode,
  Share2,
  Download,
  Heart,
  MoreHorizontal,
  Bell,
  Award,
  Trash2,
  Edit,
  Copy,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Ticket,
  CreditCard,
  Timer,
  CheckCheck,
  Share,
  AlertCircle,
} from "lucide-react"
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns"
import OrangeTicketSheet from "./TicketSheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { motion } from "framer-motion"

interface TripCardProps {
  trip: Trip
  category: "upcoming" | "past"
  onDelete?: (tripId: number) => void
  onEdit?: (trip: Trip) => void
  onDuplicate?: (trip: Trip) => void
  onShare?: (trip: Trip) => void
  onDownload?: (trip: Trip) => void
}

export default function TripCard({
  trip,
  category,
  onDelete,
  onEdit,
  onDuplicate,
  onShare,
  onDownload,
}: TripCardProps) {
  const [open, setOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const departureDate = new Date(trip.date)
  const now = new Date()

  const arrivalDate = new Date(departureDate)
  if (trip.bus?.route?.estimatedTimeMin) {
    arrivalDate.setMinutes(
      arrivalDate.getMinutes() + trip.bus.route.estimatedTimeMin,
    )
  } else {
    arrivalDate.setHours(arrivalDate.getHours() + 5)
  }

  const totalAmount = parseFloat(trip.totalAmount)
  const discount = parseFloat(trip.discount)

  const timeUntilDeparture = formatDistanceToNow(departureDate, {
    addSuffix: true,
  })
  const isUrgent = departureDate.getTime() - Date.now() < 1000 * 60 * 60 * 3

  const validUntilDate = trip.validUntil ? new Date(trip.validUntil) : null
  const isExpired = validUntilDate ? isBefore(validUntilDate, now) : false

  const statusConfig = {
    CONFIRMED: {
      icon: CheckCircle2,
      label: "Confirmed",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      dot: "bg-emerald-500",
    },
    COMPLETED: {
      icon: Award,
      label: "Completed",
      color: "text-blue-600",
      bg: "bg-blue-50",
      dot: "bg-blue-500",
    },
    CANCELLED: {
      icon: XCircle,
      label: "Cancelled",
      color: "text-red-600",
      bg: "bg-red-50",
      dot: "bg-red-500",
    },
  }

  const status =
    statusConfig[trip.status as keyof typeof statusConfig] ||
    statusConfig.CONFIRMED
  const StatusIcon = status.icon

  const origin = trip.origin || trip.bus?.route?.origin || "Unknown"
  const destination =
    trip.destination || trip.bus?.route?.destination || "Unknown"

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onDelete?.(trip.id)
    } catch (error) {
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleShareClick = () => {
    onShare?.(trip)
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={cn(
            "relative rounded-2xl",
            "bg-white dark:bg-gray-900",
            "border border-gray-100 dark:border-gray-800",
            "shadow-sm hover:shadow-md transition-all duration-200",
            isExpired && "opacity-75",
          )}
        >
          {/* Status Indicator */}
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl",
              status.dot,
            )}
          />

          <div className="p-5 pl-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className={cn("p-2 rounded-xl", status.bg)}>
                  <StatusIcon className={cn("h-4 w-4", status.color)} />
                </div>
                <span className={cn("text-sm font-medium", status.color)}>
                  {status.label}
                </span>

                {/* Status Badges Row */}
                <div className="flex items-center gap-1.5 ml-1 flex-wrap">
                  {/* Expired Badge */}
                  {isExpired && (
                    <Badge className="bg-gray-100 text-gray-700 border-0 rounded-full text-xs px-2 py-0.5 flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      Expired
                    </Badge>
                  )}

                  {/* Checked In Badge */}
                  {trip.checkedIn && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 rounded-full text-xs px-2 py-0.5 flex items-center gap-1">
                      <CheckCheck className="h-3 w-3" />
                      Checked In
                    </Badge>
                  )}

                  {/* Shared Badge */}
                  {trip.shared && (
                    <Badge className="bg-blue-100 text-blue-700 border-0 rounded-full text-xs px-2 py-0.5 flex items-center gap-1">
                      <Share className="h-3 w-3" />
                      Shared
                    </Badge>
                  )}

                  {/* Urgent Badge */}
                  {category === "upcoming" &&
                    isUrgent &&
                    trip.status === "CONFIRMED" &&
                    !isExpired && (
                      <Badge className="bg-orange-100 text-orange-700 border-0 rounded-full text-xs px-2 py-0.5 flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        Boarding Soon
                      </Badge>
                    )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          isLiked
                            ? "fill-orange-500 text-orange-500"
                            : "text-gray-400",
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isLiked ? "Remove from saved" : "Save trip"}</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={handleShareClick}
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDownload?.(trip)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDuplicate?.(trip)}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit?.(trip)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-2 text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Route */}
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-base font-medium text-gray-900 dark:text-white">
                      {origin}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-base font-medium text-gray-900 dark:text-white">
                      {destination}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>

              {/* Stops */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="text-sm">
                  <span className="text-xs text-gray-500 block">Board at</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {trip.boardingStop}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-xs text-gray-500 block">
                    Get off at
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {trip.alightingStop}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Info */}
            <div className="flex items-center gap-4 mb-5 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {format(departureDate, "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {format(departureDate, "h:mm a")} -{" "}
                  {format(arrivalDate, "h:mm a")}
                </span>
              </div>
            </div>

            {/* Price & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: trip.currency,
                    }).format(totalAmount)}
                  </span>
                  {discount > 0 && (
                    <Badge className="bg-orange-100 text-orange-700 border-0 rounded-full">
                      -{discount}%
                    </Badge>
                  )}
                </div>
                {trip.pointsUsed > 0 && (
                  <span className="text-xs text-orange-600">
                    +{trip.pointsUsed} points
                  </span>
                )}
              </div>

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-5 gap-2">
                    <Ticket className="h-4 w-4" />
                    View Ticket
                  </Button>
                </SheetTrigger>
                <OrangeTicketSheet trip={trip} />
              </Sheet>
            </div>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete Trip
              </AlertDialogTitle>
              <AlertDialogDescription>
                Delete trip from {origin} to {destination}? This cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />{" "}
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </TooltipProvider>
  )
}
