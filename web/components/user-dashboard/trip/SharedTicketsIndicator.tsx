import { motion, AnimatePresence } from "framer-motion"
import { Users, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SharedTicketsIndicatorProps {
  totalTickets: number
  sharedTicketsCount: number
  className?: string
}

export function SharedTicketsIndicator({
  totalTickets,
  sharedTicketsCount,
  className,
}: SharedTicketsIndicatorProps) {
  const allShared = sharedTicketsCount === totalTickets && totalTickets > 0

  // Don't render if no tickets are shared
  if (sharedTicketsCount === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("absolute top-2 right-2 z-20", className)}
    >
      <Badge
        className={cn(
          "px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm",
          "flex items-center gap-1.5 border-0",
          allShared ? "bg-purple-500 text-white" : "bg-orange-500 text-white",
        )}
      >
        <Share2 className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">
          {sharedTicketsCount}/{totalTickets} Shared
        </span>
        {allShared && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full"
          >
            <span className="text-[10px] font-bold">ALL</span>
          </motion.div>
        )}
      </Badge>
    </motion.div>
  )
}
