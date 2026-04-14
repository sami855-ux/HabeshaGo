"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import type { Payment, Filters } from "@/types/payment"

import { getFinancialHistory } from "@/services/transaction"

export function usePayments() {
  const searchParams = useSearchParams()

  const [globalFilter, setGlobalFilter] = useState(
    searchParams.get("search") || "",
  )

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all")

  const [filters, setFilters] = useState<Filters>({
    status: searchParams.get("status")?.split(",").filter(Boolean) || [],
    method: searchParams.get("method")?.split(",").filter(Boolean) || [],
    flow: searchParams.get("flow")?.split(",").filter(Boolean) || [],
    dateRange: {
      from: searchParams.get("dateFrom") || "",
      to: searchParams.get("dateTo") || "",
    },
    amountRange: {
      min: searchParams.get("amountMin") || "",
      max: searchParams.get("amountMax") || "",
    },
    gateway: searchParams.get("gateway")?.split(",").filter(Boolean) || [],
    currency: searchParams.get("currency")?.split(",").filter(Boolean) || [],
  })

  // ✅ REACT QUERY FETCH
  const {
    data: apiData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["financial-history"],
    queryFn: getFinancialHistory,
  })

  // ✅ extract transactions
  const data: Payment[] = apiData?.transactions || []

  // 🔥 FILTER LOGIC (UNCHANGED)
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // ⚠️ You can switch to item.type if needed
      if (
        activeTab !== "all" &&
        item.status?.toLowerCase() !== activeTab.toLowerCase()
      ) {
        return false
      }

      if (filters.status.length > 0 && !filters.status.includes(item.status)) {
        return false
      }

      if (filters.method.length > 0 && !filters.method.includes(item.method)) {
        return false
      }

      if (filters.flow.length > 0 && !filters.flow.includes(item.flow)) {
        return false
      }

      if (
        filters.gateway.length > 0 &&
        !filters.gateway.includes(item.gateway)
      ) {
        return false
      }

      if (
        filters.currency.length > 0 &&
        !filters.currency.includes(item.currency)
      ) {
        return false
      }

      if (filters.dateRange.from || filters.dateRange.to) {
        const itemDate = new Date(item.createdAt).getTime()

        if (
          filters.dateRange.from &&
          itemDate < new Date(filters.dateRange.from).getTime()
        ) {
          return false
        }

        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to)
          toDate.setHours(23, 59, 59, 999)

          if (itemDate > toDate.getTime()) {
            return false
          }
        }
      }

      if (
        filters.amountRange.min &&
        item.amount < Number(filters.amountRange.min)
      ) {
        return false
      }

      if (
        filters.amountRange.max &&
        item.amount > Number(filters.amountRange.max)
      ) {
        return false
      }

      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase()

        return (
          item.reference?.toLowerCase().includes(searchLower) ||
          item.user?.name?.toLowerCase().includes(searchLower) ||
          item.user?.email?.toLowerCase().includes(searchLower) ||
          item.gatewayRef?.toLowerCase().includes(searchLower) ||
          item.id.toString().includes(searchLower)
        )
      }

      return true
    })
  }, [data, activeTab, filters, globalFilter])

  // 🔥 FILTER COUNT (UNCHANGED)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status.length) count++
    if (filters.method.length) count++
    if (filters.flow.length) count++
    if (filters.gateway.length) count++
    if (filters.currency.length) count++
    if (filters.dateRange.from || filters.dateRange.to) count++
    if (filters.amountRange.min || filters.amountRange.max) count++
    if (globalFilter) count++
    return count
  }, [filters, globalFilter])

  const clearFilters = () => {
    setFilters({
      status: [],
      method: [],
      flow: [],
      dateRange: { from: "", to: "" },
      amountRange: { min: "", max: "" },
      gateway: [],
      currency: [],
    })
    setGlobalFilter("")
    setActiveTab("all")
  }

  return {
    data,
    filteredData,
    loading,
    error, // ✅ NEW (important)
    globalFilter,
    setGlobalFilter,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    activeFilterCount,
    clearFilters,
  }
}
