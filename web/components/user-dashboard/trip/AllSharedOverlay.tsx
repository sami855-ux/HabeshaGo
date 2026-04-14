"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface AllSharedOverlayProps {
  totalTickets: number
  className?: string
}

export function AllSharedOverlay({
  totalTickets,
  className,
}: AllSharedOverlayProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "absolute inset-0 rounded-3xl z-30",
        "backdrop-blur-md bg-black/20",
        "flex items-center justify-center",
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-black/20 backdrop-blur-sm px-5 py-2.5 rounded-4xl border border-white/20 flex items-center gap-5"
      >
        <p className="text-white text-center mr-2">
          <span className="font-medium">All tickets have been shared</span>
          <span className="text-white/70 text-sm ml-2">
            • {totalTickets} {totalTickets === 1 ? "ticket" : "tickets"}
          </span>
        </p>
        <Button
          variant={"default"}
          className="cursor-pointer rounded-xl "
          onClick={() => router.push(`/user/booking/share/shared-ticket`)}
        >
          Check the shared ticket status
          <ChevronRight size={25} />
        </Button>
      </motion.div>
    </motion.div>
  )
}
