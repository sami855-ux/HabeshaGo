// app/(dashboard)/admin/add-promo-code/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  Calendar,
  Tag,
  Hash,
  Clock,
  AlertCircle,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  ArrowLeft,
  TrendingUp,
  Percent,
  Wallet,
  Gift,
  Shield,
  Sparkles,
  BarChart3,
  Timer,
  Infinity,
  ChevronLeft,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { axiosInstance } from "@/services/axiosInstance"

// Types based on your Prisma model
type DiscountType = "PERCENT" | "FIXED"

interface PromoCode {
  id: number
  code: string
  type: DiscountType
  value: number
  maxUsage: number | null
  usedCount: number
  minAmount: number | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: PromoCode[]
  statusCode: number
}

// Currency symbol for Ethiopia
const CURRENCY = "ETB"

export default function PromoCodesPage() {
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]) // Initialize as empty array
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "expired"
  >("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENT" as DiscountType,
    value: 0,
    maxUsage: "",
    minAmount: "",
    expiresAt: "",
    isActive: true,
  })

  // Load promo codes on component mount
  useEffect(() => {
    loadPromoCodes()
  }, [])

  // Filter promo codes based on search and status - FIXED: Added safety check
  const filteredPromoCodes = Array.isArray(promoCodes)
    ? promoCodes.filter((promo) => {
        const matchesSearch =
          promo.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false

        if (statusFilter === "all") return matchesSearch
        if (statusFilter === "active")
          return (
            matchesSearch &&
            promo.isActive &&
            !isExpired(promo.expiresAt) &&
            !isMaxUsageReached(promo)
          )
        if (statusFilter === "inactive") return matchesSearch && !promo.isActive
        if (statusFilter === "expired")
          return matchesSearch && isExpired(promo.expiresAt)

        return matchesSearch
      })
    : []

  const loadPromoCodes = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get<ApiResponse>("/promo-code")

      if (response.data.success) {
        console.log(response.data.data.data)
        setPromoCodes(response.data.data.data || []) // Ensure we set an array even if data is undefined
      } else {
        toast.error(response.data.message || "Failed to load promo codes")
        setPromoCodes([]) // Set empty array on error
      }
    } catch (error: any) {
      console.error("Load promo codes error:", error)
      toast.error(error.response?.data?.message || "Failed to load promo codes")
      setPromoCodes([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const isMaxUsageReached = (promo: PromoCode) => {
    if (!promo.maxUsage) return false
    return promo.usedCount >= promo.maxUsage
  }

  const getPromoStatus = (promo: PromoCode) => {
    if (!promo.isActive)
      return { label: "Inactive", color: "secondary", icon: EyeOff }
    if (isExpired(promo.expiresAt))
      return { label: "Expired", color: "destructive", icon: Timer }
    if (isMaxUsageReached(promo))
      return { label: "Used Up", color: "destructive", icon: AlertCircle }
    return { label: "Active", color: "default", icon: CheckCircle }
  }

  const getUsagePercentage = (promo: PromoCode) => {
    if (!promo.maxUsage) return 0
    return (promo.usedCount / promo.maxUsage) * 100
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Promo code copied to clipboard!")
  }

  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const promoData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : null,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).toISOString()
          : null,
        isActive: formData.isActive,
      }

      const response = await axiosInstance.post("/promo-code/create", promoData)

      if (response.data.success) {
        toast.success(
          response.data.message || "Promo code created successfully!",
        )
        setIsAddDialogOpen(false)
        resetForm()
        loadPromoCodes() // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to create promo code")
      }
    } catch (error: any) {
      console.error("Create promo code error:", error)
      toast.error(
        error.response?.data?.message || "Failed to create promo code",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditPromoCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPromoCode) return
    setIsSubmitting(true)

    try {
      const promoData = {
        type: formData.type,
        value: formData.value,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : null,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).toISOString()
          : null,
        isActive: formData.isActive,
      }

      const response = await axiosInstance.put(
        `/promo-code/${selectedPromoCode.id}`,
        promoData,
      )

      if (response.data.success) {
        toast.success(
          response.data.message || "Promo code updated successfully!",
        )
        setIsEditDialogOpen(false)
        resetForm()
        loadPromoCodes() // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to update promo code")
      }
    } catch (error: any) {
      console.error("Update promo code error:", error)
      toast.error(
        error.response?.data?.message || "Failed to update promo code",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePromoCode = async (id: number) => {
    toast.custom((t) => (
      <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div>
          <p className="font-medium">Delete Promo Code?</p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={() => toast.dismiss(t)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              try {
                const response = await axiosInstance.delete(`/promo-code/${id}`)
                if (response.data.success) {
                  toast.success("Promo code deleted successfully!")
                  loadPromoCodes() // Refresh the list
                } else {
                  toast.error(
                    response.data.message || "Failed to delete promo code",
                  )
                }
              } catch (error: any) {
                toast.error(
                  error.response?.data?.message ||
                    "Failed to delete promo code",
                )
              }
              toast.dismiss(t)
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    ))
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await axiosInstance.patch(
        `/promo-code/${id}/toggle-status`,
        {
          isActive: !currentStatus,
        },
      )

      if (response.data.success) {
        toast.success(
          `Promo code ${!currentStatus ? "activated" : "deactivated"} successfully!`,
        )
        loadPromoCodes() // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to update status")
      }
    } catch (error: any) {
      console.error("Toggle status error:", error)
      toast.error(error.response?.data?.message || "Failed to update status")
    }
  }

  const openEditDialog = (promo: PromoCode) => {
    setSelectedPromoCode(promo)
    setFormData({
      code: promo.code,
      type: promo.type,
      value: promo.value,
      maxUsage: promo.maxUsage?.toString() || "",
      minAmount: promo.minAmount?.toString() || "",
      expiresAt: promo.expiresAt ? promo.expiresAt.split("T")[0] : "",
      isActive: promo.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      code: "",
      type: "PERCENTAGE",
      value: 0,
      maxUsage: "",
      minAmount: "",
      expiresAt: "",
      isActive: true,
    })
    setSelectedPromoCode(null)
  }

  // Calculate statistics with safety check
  const stats = {
    total: Array.isArray(promoCodes) ? promoCodes.length : 0,
    active: Array.isArray(promoCodes)
      ? promoCodes.filter(
          (p) => p.isActive && !isExpired(p.expiresAt) && !isMaxUsageReached(p),
        ).length
      : 0,
    expired: Array.isArray(promoCodes)
      ? promoCodes.filter((p) => isExpired(p.expiresAt)).length
      : 0,
    totalUses: Array.isArray(promoCodes)
      ? promoCodes.reduce((sum, p) => sum + (p.usedCount || 0), 0)
      : 0,
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen ">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                  Promo Codes
                </h1>
              </div>
              <p className="text-muted-foreground">
                Create and manage discount codes to boost your sales
              </p>
            </div>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Promo Code
            </Button>
          </div>

          {/* Stats Cards */}
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Codes
                </CardTitle>
                <Tag className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.total}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total promo codes
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Active Codes
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.active}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently valid
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Expired
                </CardTitle>
                <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.expired}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Past expiration date
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Uses
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.totalUses.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Across all codes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search promo codes by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-slate-200 dark:border-slate-800 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={(v: any) => setStatusFilter(v)}
                  >
                    <SelectTrigger className="w-[160px] border-slate-200 dark:border-slate-800">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={loadPromoCodes}
                    className="border-slate-200 dark:border-slate-800"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", loading && "animate-spin")}
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Promo Codes Table */}
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="font-semibold">
                        Promo Code
                      </TableHead>
                      <TableHead className="font-semibold">Discount</TableHead>
                      <TableHead className="font-semibold">Usage</TableHead>
                      <TableHead className="font-semibold">
                        Min. Amount
                      </TableHead>
                      <TableHead className="font-semibold">Expires</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                          <p className="mt-2 text-muted-foreground">
                            Loading promo codes...
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : filteredPromoCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full">
                              <Gift className="h-12 w-12 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-lg font-medium">
                                No promo codes found
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {searchTerm || statusFilter !== "all"
                                  ? "Try adjusting your filters"
                                  : "Create your first promo code to get started"}
                              </p>
                            </div>
                            {!searchTerm && statusFilter === "all" && (
                              <Button
                                onClick={() => setIsAddDialogOpen(true)}
                                className="mt-2 gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Create Promo Code
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPromoCodes.map((promo) => {
                        const status = getPromoStatus(promo)
                        const expired = isExpired(promo.expiresAt)
                        const usageReached = isMaxUsageReached(promo)
                        const usagePercentage = getUsagePercentage(promo)
                        const StatusIcon = status.icon

                        return (
                          <TableRow
                            key={promo.id}
                            className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                          >
                            <TableCell className="font-mono font-medium">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                                  <Shield className="h-3 w-3 text-purple-600" />
                                </div>
                                <span className="font-semibold">
                                  {promo.code}
                                </span>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleCopyCode(promo.code)}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy code</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {promo.type === "PERCENTAGE" ? (
                                  <>
                                    <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                                      <Percent className="h-3 w-3 text-green-600" />
                                    </div>
                                    <span className="font-medium">
                                      {promo.value}% OFF
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                                      <Wallet className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <span className="font-medium">
                                      {CURRENCY} {promo.value.toLocaleString()}{" "}
                                      OFF
                                    </span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="font-medium">
                                    {promo.usedCount.toLocaleString()} /{" "}
                                    {promo.maxUsage ? (
                                      promo.maxUsage.toLocaleString()
                                    ) : (
                                      <Infinity className="h-3 w-3 inline" />
                                    )}
                                  </span>
                                  {promo.maxUsage && (
                                    <span className="text-muted-foreground">
                                      {Math.round(usagePercentage)}%
                                    </span>
                                  )}
                                </div>
                                {promo.maxUsage && (
                                  <Progress
                                    value={usagePercentage}
                                    className="h-1.5"
                                    indicatorClassName={cn(
                                      usagePercentage >= 80
                                        ? "bg-red-500"
                                        : "bg-purple-500",
                                    )}
                                  />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {promo.minAmount ? (
                                <div className="flex items-center gap-1.5">
                                  <Wallet className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">
                                    {CURRENCY}{" "}
                                    {promo.minAmount.toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  No minimum
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {promo.expiresAt ? (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span
                                    className={cn(
                                      "text-sm font-medium",
                                      expired && "text-red-500 line-through",
                                    )}
                                  >
                                    {format(
                                      new Date(promo.expiresAt),
                                      "MMM dd, yyyy",
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm flex items-center gap-1">
                                  <Infinity className="h-3 w-3" />
                                  Never expires
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <StatusIcon
                                  className={cn(
                                    "h-3 w-3",
                                    status.color === "default" &&
                                      "text-green-500",
                                    status.color === "destructive" &&
                                      "text-red-500",
                                    status.color === "secondary" &&
                                      "text-gray-500",
                                  )}
                                />
                                <Badge
                                  variant={status.color as any}
                                  className="font-medium"
                                >
                                  {status.label}
                                </Badge>
                              </div>
                              {usageReached && !expired && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 text-xs"
                                >
                                  Limit Reached
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(promo)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleToggleStatus(
                                        promo.id,
                                        promo.isActive,
                                      )
                                    }
                                  >
                                    {promo.isActive ? (
                                      <>
                                        <EyeOff className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() =>
                                      handleDeletePromoCode(promo.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Promo Code Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Promo Code</DialogTitle>
            <DialogDescription>
              Create a new discount code for your customers
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPromoCode}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Promo Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., SUMMER25"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  className="font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: DiscountType) =>
                      setFormData({ ...formData, type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED">
                        Fixed Amount ({CURRENCY})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Discount Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    step={formData.type === "PERCENTAGE" ? 1 : 0.01}
                    min={0}
                    placeholder={
                      formData.type === "PERCENTAGE"
                        ? "e.g., 25"
                        : `e.g., ${CURRENCY} 100`
                    }
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUsage">Max Usage (Optional)</Label>
                  <Input
                    id="maxUsage"
                    type="number"
                    min={0}
                    placeholder="Unlimited"
                    value={formData.maxUsage}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsage: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minAmount">
                    Min. Order Amount ({CURRENCY}) (Optional)
                  </Label>
                  <Input
                    id="minAmount"
                    type="number"
                    step={0.01}
                    min={0}
                    placeholder={`Min ${CURRENCY} amount`}
                    value={formData.minAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minAmount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Label htmlFor="isActive" className="font-medium">
                  Active Status
                </Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Promo Code
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Promo Code Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Promo Code</DialogTitle>
            <DialogDescription>
              Update your discount code details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPromoCode}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Promo Code</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  disabled
                  className="font-mono bg-slate-50 dark:bg-slate-900"
                />
                <p className="text-xs text-muted-foreground">
                  Code cannot be changed after creation
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Discount Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: DiscountType) =>
                      setFormData({ ...formData, type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">
                        Fixed Amount ({CURRENCY})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-value">Discount Value *</Label>
                  <Input
                    id="edit-value"
                    type="number"
                    step={formData.type === "PERCENTAGE" ? 1 : 0.01}
                    min={0}
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-maxUsage">Max Usage (Optional)</Label>
                  <Input
                    id="edit-maxUsage"
                    type="number"
                    min={0}
                    placeholder="Unlimited"
                    value={formData.maxUsage}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUsage: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minAmount">
                    Min. Order Amount ({CURRENCY}) (Optional)
                  </Label>
                  <Input
                    id="edit-minAmount"
                    type="number"
                    step={0.01}
                    min={0}
                    value={formData.minAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minAmount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expiresAt">
                  Expiration Date (Optional)
                </Label>
                <Input
                  id="edit-expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <Label htmlFor="edit-isActive" className="font-medium">
                  Active Status
                </Label>
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
