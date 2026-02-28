"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import type { Payment, Filters } from "../types"

// Mock data generator
const generateMockPayments = (count: number): Payment[] => {
  const statuses = ["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"]
  const methods = ["WALLET", "TELEBIRR", "CBE", "BANK_TRANSFER", "CASH"]
  const gateways = ["CHAPA", "INTERNAL"]
  const flows = ["WALLET_TOPUP", "WALLET_PAYMENT", "DIRECT_PAYMENT"]
  const currencies = ["ETB", "USD"]

  const firstNames = [
    "John",
    "Jane",
    "Mike",
    "Sarah",
    "David",
    "Emily",
    "Chris",
    "Anna",
  ]
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
  ]

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const method = methods[Math.floor(Math.random() * methods.length)]
    const gateway = gateways[Math.floor(Math.random() * gateways.length)]
    const flow = flows[Math.floor(Math.random() * flows.length)]
    const currency = currencies[Math.floor(Math.random() * currencies.length)]

    const amount = Math.floor(Math.random() * 10000) + 100
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30))

    return {
      id: i + 1,
      userId: `user_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      method,
      gateway,
      flow,
      pointsUsed: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : null,
      pointsValue: Math.random() > 0.7 ? Math.floor(Math.random() * 500) : null,
      status,
      gatewayRef:
        Math.random() > 0.3
          ? `chapa_ref_${Math.random().toString(36).substr(2, 10)}`
          : null,
      reference: `PAY-${new Date().getFullYear()}-${String(i + 1).padStart(6, "0")}`,
      metadata: {
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0...",
      },
      walletId:
        Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 1 : null,
      minibusReservationId:
        Math.random() > 0.8 ? Math.floor(Math.random() * 50) + 1 : null,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      user: {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      },
      wallet:
        Math.random() > 0.5
          ? {
              id: Math.floor(Math.random() * 100) + 1,
              balance: Math.floor(Math.random() * 50000),
            }
          : null,
    }
  })
}

export function usePayments() {
  const searchParams = useSearchParams()

  const [data, setData] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
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

  // Load mock data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setData(generateMockPayments(50))
      setLoading(false)
    }
    loadData()
  }, [])

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Tab filter
      if (
        activeTab !== "all" &&
        item.status.toLowerCase() !== activeTab.toLowerCase()
      ) {
        return false
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(item.status)) {
        return false
      }

      // Method filter
      if (filters.method.length > 0 && !filters.method.includes(item.method)) {
        return false
      }

      // Flow filter
      if (filters.flow.length > 0 && !filters.flow.includes(item.flow)) {
        return false
      }

      // Gateway filter
      if (
        filters.gateway.length > 0 &&
        !filters.gateway.includes(item.gateway)
      ) {
        return false
      }

      // Currency filter
      if (
        filters.currency.length > 0 &&
        !filters.currency.includes(item.currency)
      ) {
        return false
      }

      // Date range filter
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

      // Amount range filter
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

      // Global search
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase()
        return (
          item.reference.toLowerCase().includes(searchLower) ||
          item.user.name?.toLowerCase().includes(searchLower) ||
          item.user.email.toLowerCase().includes(searchLower) ||
          item.gatewayRef?.toLowerCase().includes(searchLower) ||
          item.id.toString().includes(searchLower)
        )
      }

      return true
    })
  }, [data, activeTab, filters, globalFilter])

  // Calculate active filter count
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

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams()
    if (globalFilter) params.set("search", globalFilter)
    if (activeTab !== "all") params.set("tab", activeTab)
    if (filters.status.length) params.set("status", filters.status.join(","))
    if (filters.method.length) params.set("method", filters.method.join(","))
    if (filters.flow.length) params.set("flow", filters.flow.join(","))
    if (filters.gateway.length) params.set("gateway", filters.gateway.join(","))
    if (filters.currency.length)
      params.set("currency", filters.currency.join(","))
    if (filters.dateRange.from) params.set("dateFrom", filters.dateRange.from)
    if (filters.dateRange.to) params.set("dateTo", filters.dateRange.to)
    if (filters.amountRange.min)
      params.set("amountMin", filters.amountRange.min)
    if (filters.amountRange.max)
      params.set("amountMax", filters.amountRange.max)

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, "", newUrl)
  }, [globalFilter, activeTab, filters])

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
