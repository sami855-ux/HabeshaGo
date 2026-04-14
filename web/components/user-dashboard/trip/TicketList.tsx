"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Ticket {
  id: number
  seatNumber: number
  boardingStop: string
  alightingStop: string
  qrCode: string
  checkedIn: boolean
  checkedInAt: string | null
  validUntil: string
}

interface TicketListProps {
  tickets: Ticket[]
  busNumber: string
  busType?: string
  selectedTime: string
  arrivalTime: string
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  busNumber,
  busType,
  selectedTime,
  arrivalTime,
}) => {
  const [expandedTicket, setExpandedTicket] = useState<number | null>(
    tickets.length > 0 ? tickets[0].id : null
  )
  const [qrSize, setQrSize] = useState<"small" | "medium" | "large">("medium")

  const getQrSize = () => {
    switch (qrSize) {
      case "small":
        return "w-24 h-24"
      case "large":
        return "w-48 h-48"
      default:
        return "w-40 h-40"
    }
  }

  if (tickets.length === 0) {
    return (
      <Card className="p-12 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        <h3 className="text-lg font-medium mb-2">No Tickets Available</h3>
        <p className="text-gray-500">Your booking is confirmed but tickets are being generated.</p>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {tickets.map((ticket, index) => {
          const isExpanded = expandedTicket === ticket.id
          
          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  "border overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md",
                  isExpanded 
                    ? "border-orange-500 shadow-lg" 
                    : "border-gray-200 dark:border-gray-800"
                )}
                onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
              >
                {/* Compact Ticket Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      isExpanded ? "bg-orange-100 dark:bg-orange-900/30" : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      <svg className={cn(
                        "w-5 h-5",
                        isExpanded ? "text-orange-600" : "text-gray-500"
                      )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          Ticket {index + 1}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Seat {ticket.seatNumber}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {ticket.boardingStop} → {ticket.alightingStop}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      ticket.checkedIn ? "bg-green-500" : "bg-yellow-500"
                    )} />
                    <svg 
                      className={cn(
                        "w-5 h-5 transition-transform duration-300",
                        isExpanded && "rotate-180"
                      )} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-800">
                        {/* Stop Information */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Boarding</p>
                            <p className="font-medium">{ticket.boardingStop}</p>
                            <p className="text-xs text-gray-500">{selectedTime}</p>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Alighting</p>
                            <p className="font-medium">{ticket.alightingStop}</p>
                            <p className="text-xs text-gray-500">{arrivalTime}</p>
                          </div>
                        </div>

                        {/* QR Code Section */}
                        <div className="relative flex flex-col items-center py-6 px-4 mb-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                          {/* QR Size Controls */}
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-7 w-7 rounded-full",
                                    qrSize === "small" && "bg-orange-500 text-white"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setQrSize("small")
                                  }}
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Small QR</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-7 w-7 rounded-full",
                                    qrSize === "medium" && "bg-orange-500 text-white"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setQrSize("medium")
                                  }}
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Medium QR</TooltipContent>
                            </Tooltip>
                          </div>

                          {/* QR Code */}
                          <motion.div
                            className="relative cursor-pointer mb-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="relative bg-white dark:bg-gray-800 p-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 shadow-md">
                              <img
                                src={ticket.qrCode}
                                alt={`Ticket ${index + 1} QR Code`}
                                className={cn("rounded-lg", getQrSize())}
                              />
                            </div>
                          </motion.div>

                          {/* QR Instructions */}
                          <div className="text-center">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Scan at boarding gate
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              Valid until {format(new Date(ticket.validUntil), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>

                        {/* Check-in Status */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Check-in status:</span>
                          <span className={cn(
                            "font-medium",
                            ticket.checkedIn ? "text-green-600" : "text-yellow-600"
                          )}>
                            {ticket.checkedIn ? "Checked In" : "Not Checked In"}
                          </span>
                        </div>
                        {ticket.checkedInAt && (
                          <p className="text-xs text-gray-400 mt-1">
                            Checked in at {format(new Date(ticket.checkedInAt), "h:mm a")}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

export default TicketList