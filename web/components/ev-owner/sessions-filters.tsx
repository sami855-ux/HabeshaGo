"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"

interface SessionsFiltersProps {
  show: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
}

export function SessionsFilters({
  show,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: SessionsFiltersProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
        >
          <Input
            placeholder="Search by user, vehicle, station..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="border-slate-200 focus:ring-slate-500"
          />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
