"use client"

import { motion } from "framer-motion"
import { Share2, Inbox, Search, Users, Ticket, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface EmptyStateProps {
  type: "sent" | "received"
  hasFilters: boolean
  onClearFilters: () => void
}

export function EmptyState({
  type,
  hasFilters,
  onClearFilters,
}: EmptyStateProps) {
  const router = useRouter()

  const config = {
    sent: {
      icon: Share2,
      title: "No tickets shared yet",
      description:
        "You haven't shared any tickets with others. Share a ticket to get started.",
      action: "Share a Ticket",
      actionLink: "/user/trips",
    },
    received: {
      icon: Users,
      title: "No tickets received yet",
      description:
        "When someone shares a ticket with you, it will appear here.",
      action: "Browse Tickets",
      actionLink: "/user/trips",
    },
  }

  const { icon: Icon, title, description, action, actionLink } = config[type]

  // If filters are active, show a different message
  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
          <Filter className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No matching tickets
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
          We couldn't find any {type} tickets matching your current filters. Try
          adjusting your search or filters.
        </p>
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="rounded-full px-6 h-11 border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/30"
        >
          Clear Filters
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Animated icon */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 flex items-center justify-center mb-6 shadow-lg"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-xl">
          <Icon className="h-8 w-8" />
        </div>
      </motion.div>

      {/* Text */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      {/* Illustration of empty state */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex -space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center">
            <Ticket className="h-4 w-4 text-gray-500" />
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center">
            <Share2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-900 flex items-center justify-center">
            <Users className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </div>
        </div>
        <span className="text-sm text-gray-400">No activity yet</span>
      </div>

      {/* Action button */}
      <div className="flex gap-3">
        <Button
          onClick={() => router.push(actionLink)}
          className="rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 h-12 shadow-lg shadow-orange-200 dark:shadow-orange-900/30"
        >
          {action}
        </Button>
        {type === "sent" && (
          <Button
            variant="outline"
            onClick={() => router.push("/user/trips?tab=past")}
            className="rounded-full px-8 h-12 border-gray-200 dark:border-gray-800"
          >
            View Past Trips
          </Button>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-400 mt-8">
        {type === "sent"
          ? "Go to your trips and click the share button on any ticket"
          : "Ask a friend to share a ticket with you using your phone number"}
      </p>
    </motion.div>
  )
}
