// components/user-dashboard/shared-tickets/FiltersBar.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import {
  Search,
  X,
  Calendar as CalendarIcon,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface FiltersBarProps {
  filters: {
    search: string
    status: string
    dateFrom: string
    dateTo: string
  }
  onFilterChange: (filters: any) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function FiltersBar({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: FiltersBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState<"from" | "to" | null>(
    null,
  )

  const updateFilter = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search") return value !== ""
    if (key === "status") return value !== "all"
    if (key === "dateFrom" || key === "dateTo") return value !== ""
    return false
  }).length

  // Handle date selection from calendar
  const handleDateSelect = (type: "from" | "to", date: Date | undefined) => {
    if (date) {
      updateFilter(
        type === "from" ? "dateFrom" : "dateTo",
        format(date, "yyyy-MM-dd"),
      )
    }
    setDatePickerOpen(null)
  }

  // Get date objects for calendar
  const dateFromObj = filters.dateFrom ? new Date(filters.dateFrom) : undefined
  const dateToObj = filters.dateTo ? new Date(filters.dateTo) : undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden"
    >
      {/* Main Filter Bar */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search - Always visible */}
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <Input
              placeholder="Search by name, phone or booking ID..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-9 h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filters - Visible on desktop, collapsible on mobile */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Status Filter */}
            <div className="w-40">
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ACCEPTED">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Accepted</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="REJECTED">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Rejected</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From with Calendar */}
            <Popover
              open={datePickerOpen === "from"}
              onOpenChange={(open) => setDatePickerOpen(open ? "from" : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-40 h-11 justify-start text-left font-normal bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                    !filters.dateFrom && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom
                    ? format(new Date(filters.dateFrom), "MMM dd, yyyy")
                    : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFromObj}
                  onSelect={(date) => handleDateSelect("from", date)}
                  initialFocus
                  disabled={(date) => (dateToObj ? date > dateToObj : false)}
                  className="rounded-lg border-0"
                />
              </PopoverContent>
            </Popover>

            {/* Date To with Calendar */}
            <Popover
              open={datePickerOpen === "to"}
              onOpenChange={(open) => setDatePickerOpen(open ? "to" : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-40 h-11 justify-start text-left font-normal bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                    !filters.dateTo && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo
                    ? format(new Date(filters.dateTo), "MMM dd, yyyy")
                    : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateToObj}
                  onSelect={(date) => handleDateSelect("to", date)}
                  initialFocus
                  disabled={(date) =>
                    dateFromObj ? date < dateFromObj : false
                  }
                  className="rounded-lg border-0"
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    variant="ghost"
                    onClick={onClearFilters}
                    className="h-11 px-4 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                    {activeFilterCount > 0 && (
                      <Badge className="ml-2 bg-orange-500 text-white border-0 h-5 px-1.5 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <Collapsible
              open={isExpanded}
              onOpenChange={setIsExpanded}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 h-11 gap-2 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-white border-0 h-5 px-1.5 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 ml-auto transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3 space-y-3">
                {/* Status Filter */}
                <Select
                  value={filters.status}
                  onValueChange={(value) => updateFilter("status", value)}
                >
                  <SelectTrigger className="h-11 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="ACCEPTED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Accepted
                      </div>
                    </SelectItem>
                    <SelectItem value="REJECTED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        Rejected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile Date Pickers */}
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 justify-start text-left font-normal bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                          !filters.dateFrom && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom
                          ? format(new Date(filters.dateFrom), "MMM dd")
                          : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFromObj}
                        onSelect={(date) => {
                          if (date)
                            updateFilter("dateFrom", format(date, "yyyy-MM-dd"))
                        }}
                        initialFocus
                        className="rounded-lg border-0"
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 justify-start text-left font-normal bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                          !filters.dateTo && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo
                          ? format(new Date(filters.dateTo), "MMM dd")
                          : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateToObj}
                        onSelect={(date) => {
                          if (date)
                            updateFilter("dateTo", format(date, "yyyy-MM-dd"))
                        }}
                        initialFocus
                        className="rounded-lg border-0"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Mobile Clear Button */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={onClearFilters}
                    className="w-full h-11 gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear all filters
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">
                Active filters:
              </span>

              {filters.search && (
                <Badge
                  variant="secondary"
                  className="pl-2 pr-1 py-1 gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <Search className="h-3 w-3 mr-1 text-gray-500" />
                  <span className="max-w-[150px] truncate">
                    {filters.search}
                  </span>
                  <button
                    onClick={() => updateFilter("search", "")}
                    className="ml-1 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.status !== "all" && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "pl-2 pr-1 py-1 gap-1 bg-white dark:bg-gray-900 border",
                    filters.status === "PENDING" &&
                      "border-amber-200 dark:border-amber-800",
                    filters.status === "ACCEPTED" &&
                      "border-emerald-200 dark:border-emerald-800",
                    filters.status === "REJECTED" &&
                      "border-rose-200 dark:border-rose-800",
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      filters.status === "PENDING" && "bg-amber-500",
                      filters.status === "ACCEPTED" && "bg-emerald-500",
                      filters.status === "REJECTED" && "bg-rose-500",
                    )}
                  />
                  <span>{filters.status}</span>
                  <button
                    onClick={() => updateFilter("status", "all")}
                    className="ml-1 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.dateFrom && (
                <Badge
                  variant="secondary"
                  className="pl-2 pr-1 py-1 gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <CalendarIcon className="h-3 w-3 text-gray-500" />
                  <span>
                    From {format(new Date(filters.dateFrom), "MMM d, yyyy")}
                  </span>
                  <button
                    onClick={() => updateFilter("dateFrom", "")}
                    className="ml-1 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.dateTo && (
                <Badge
                  variant="secondary"
                  className="pl-2 pr-1 py-1 gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                >
                  <CalendarIcon className="h-3 w-3 text-gray-500" />
                  <span>
                    To {format(new Date(filters.dateTo), "MMM d, yyyy")}
                  </span>
                  <button
                    onClick={() => updateFilter("dateTo", "")}
                    className="ml-1 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {activeFilterCount > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
