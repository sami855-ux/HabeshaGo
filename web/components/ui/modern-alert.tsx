import { motion } from "framer-motion"
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
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Share2,
  Ban,
  LogOut,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

export type AlertType = "danger" | "warning" | "success" | "info" | "default"

interface ModernAlertProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string | ReactNode
  type?: AlertType
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel?: () => void
  isConfirming?: boolean
  confirmText?: string
  icon?: ReactNode
  showCancel?: boolean
  className?: string
}

const alertConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: "text-red-600",
    bgColor: "bg-red-100",
    confirmBg: "bg-red-500 hover:bg-red-600",
    borderColor: "border-red-200",
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-100",
    confirmBg: "bg-yellow-500 hover:bg-yellow-600",
    borderColor: "border-yellow-200",
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-600",
    bgColor: "bg-green-100",
    confirmBg: "bg-green-500 hover:bg-green-600",
    borderColor: "border-green-200",
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    confirmBg: "bg-blue-500 hover:bg-blue-600",
    borderColor: "border-blue-200",
  },
  default: {
    icon: AlertCircle,
    iconColor: "text-gray-600",
    bgColor: "bg-gray-100",
    confirmBg: "bg-gray-500 hover:bg-gray-600",
    borderColor: "border-gray-200",
  },
}

export function ModernAlert({
  open,
  onOpenChange,
  title,
  description,
  type = "danger",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isConfirming = false,
  confirmText,
  icon,
  showCancel = true,
  className,
}: ModernAlertProps) {
  const config = alertConfig[type]
  const IconComponent = icon ? null : config.icon

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("rounded-3xl", className)}>
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={cn(
              "mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4",
              config.bgColor,
            )}
          >
            {icon ? (
              icon
            ) : (
              <IconComponent className={cn("h-7 w-7", config.iconColor)} />
            )}
          </motion.div>

          <AlertDialogTitle className="text-center text-xl font-bold">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter
          className={cn(
            "flex gap-3 sm:justify-center",
            !showCancel && "sm:justify-center",
          )}
        >
          {showCancel && (
            <AlertDialogCancel
              onClick={handleCancel}
              disabled={isConfirming}
              className="rounded-full px-6 min-w-[100px] border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {cancelLabel}
            </AlertDialogCancel>
          )}

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isConfirming}
            className={cn(
              "rounded-full px-6 min-w-[100px] text-white transition-all",
              config.confirmBg,
              isConfirming && "opacity-90 cursor-not-allowed",
            )}
          >
            {isConfirming ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                <span>{confirmText || confirmLabel}...</span>
              </motion.div>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/**
 * 
 * const [showDeleteDialog, setShowDeleteDialog] = useState(false)
const [isDeleting, setIsDeleting] = useState(false)

const handleDelete = async () => {
  setIsDeleting(true)
  // Your delete logic here
  await deleteTrip(tripId)
  setIsDeleting(false)
  setShowDeleteDialog(false)
}

<ModernAlert
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
  title="Delete Trip"
  description={
    <>
      Are you sure you want to delete this trip from{" "}
      <span className="font-semibold">Addis Ababa</span> to{" "}
      <span className="font-semibold">Adama</span>? This action cannot be undone.
    </>
  }
  type="danger"
  confirmLabel="Delete"
  onConfirm={handleDelete}
  isConfirming={isDeleting}
  confirmText="Deleting"
/>
 */
