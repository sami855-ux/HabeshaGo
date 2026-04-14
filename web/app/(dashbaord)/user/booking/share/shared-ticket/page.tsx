"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  Share2,
  Search,
  X,
  Calendar as CalendarIcon,
  Ticket,
  Users,
  Clock,
  Loader2,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSelector } from "@/store/store"
import { SharedTicketCard } from "@/components/user-dashboard/trip/SharedTicketCard"
import { EmptyState } from "@/components/user-dashboard/trip/EmptyState"
import { FiltersBar } from "@/components/user-dashboard/trip/FiltersBar"
import { getSharedTicketsAPI } from "@/services/booking.api"

// Updated interface to match the actual data structure
interface SharedTicket {
  shareId: string
  ticketId: number
  seatNumber: number
  boardingStop: string
  alightingStop: string
  qrCode: string
  checkedIn: boolean
  validUntil: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  sharedAt: string
  booking: {
    id: number
    bookingCode: string
    createdAt: string
  }
  bus: {
    id: number
    busNumber: string
    origin: string
    destination: string
  }
  // For sent tickets
  receiver?: {
    id: string
    name: string
    phone: string
    email: string
  }
  // For received tickets
  owner?: {
    id: string
    name: string
    phone: string
    email: string
  }
}

interface ApiResponse {
  sent: SharedTicket[]
  received: SharedTicket[]
}

export default function SharedTicketsPage() {
  const { user } = useAppSelector((state) => state.user)
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent")
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
  })

  // Fetch shared tickets
  const { data, isLoading, error, refetch } = useQuery<ApiResponse>({
    queryKey: ["sharedTickets", user?.id],
    queryFn: () => getSharedTicketsAPI(),
    enabled: !!user?.id,
  })

  console.log(data)

  // Get current tab data
  const currentTickets = data?.[activeTab] || []

  // Filter tickets based on active tab and filters
  const filteredTickets = useMemo(() => {
    return currentTickets.filter((ticket: SharedTicket) => {
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()

        // Search by receiver/owner name, phone, ticketId, or booking code
        const targetName =
          activeTab === "sent"
            ? ticket.receiver?.name?.toLowerCase() || ""
            : ticket.owner?.name?.toLowerCase() || ""

        const targetPhone =
          activeTab === "sent"
            ? ticket.receiver?.phone?.toLowerCase() || ""
            : ticket.owner?.phone?.toLowerCase() || ""

        const ticketId = ticket.ticketId.toString()
        const bookingCode = ticket.booking.bookingCode.toLowerCase()
        const busNumber = ticket.bus.busNumber.toLowerCase()
        const seatNumber = ticket.seatNumber.toString()

        if (
          !targetName.includes(searchLower) &&
          !targetPhone.includes(searchLower) &&
          !ticketId.includes(searchLower) &&
          !bookingCode.includes(searchLower) &&
          !busNumber.includes(searchLower) &&
          !seatNumber.includes(searchLower)
        ) {
          return false
        }
      }

      // Apply status filter
      if (filters.status !== "all" && ticket.status !== filters.status) {
        return false
      }

      // Apply date filters
      if (filters.dateFrom) {
        const sharedDate = new Date(ticket.sharedAt)
        const fromDate = new Date(filters.dateFrom)
        if (sharedDate < fromDate) return false
      }
      if (filters.dateTo) {
        const sharedDate = new Date(ticket.sharedAt)
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (sharedDate > toDate) return false
      }

      return true
    })
  }, [currentTickets, filters, activeTab])

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      dateFrom: "",
      dateTo: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== "all",
  )

  // Calculate counts
  const sentCount = data?.sent?.length || 0
  const receivedCount = data?.received?.length || 0

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Failed to load</h2>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Share2 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Shared Tickets
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage tickets you shared with others or received from friends
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters Bar */}
        <FiltersBar
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Tabs */}
        <Tabs
          defaultValue="sent"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "sent" | "received")}
          className="mt-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-gray-100 dark:bg-gray-800 p-1">
            <TabsTrigger
              value="sent"
              className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 rounded-lg relative"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Sent
              {sentCount > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white border-0 h-5 px-1.5 text-xs">
                  {sentCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="received"
              className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 rounded-lg relative"
            >
              <Users className="h-4 w-4 mr-2" />
              Received
              {receivedCount > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white border-0 h-5 px-1.5 text-xs">
                  {receivedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Sent Tickets Tab */}
          <TabsContent value="sent" className="mt-6">
            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredTickets.length > 0 ? (
              <TicketGrid
                tickets={filteredTickets}
                type="sent"
                refetch={refetch}
              />
            ) : (
              <EmptyState
                type="sent"
                hasFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />
            )}
          </TabsContent>

          {/* Received Tickets Tab */}
          <TabsContent value="received" className="mt-6">
            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredTickets.length > 0 ? (
              <TicketGrid
                tickets={filteredTickets}
                type="received"
                refetch={refetch}
              />
            ) : (
              <EmptyState
                type="received"
                hasFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800"
        >
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Ticket Grid
function TicketGrid({
  tickets,
  type,
  refetch,
}: {
  tickets: SharedTicket[]
  type: "sent" | "received"
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {tickets.map((ticket: SharedTicket, index: number) => (
          <motion.div
            key={index} // Use shareId instead of id
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
          >
            <SharedTicketCard
              ticket={ticket}
              type={type}
              onStatusChange={() => refetch()}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
