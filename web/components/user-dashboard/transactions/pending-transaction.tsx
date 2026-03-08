"use client"

import { useState, useMemo, useEffect } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"
import { Transaction } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  TrendingUp,
  CreditCard,
  Banknote,
  RefreshCw,
  X,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Check,
  ChevronDown,
  MoreVertical,
  FileText,
  Mail,
  Printer,
  Trash2,
  Eye,
  Archive,
  AlertCircle,
  Users,
  BarChart3,
  ExternalLink,
  Copy,
  Receipt,
  File,
  Timer,
  AlertTriangle,
  Play,
  Pause,
  Zap,
  Shield,
  History,
  Target,
  Bell,
  BellOff,
  Clock4,
  CalendarClock,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  addHours,
  isBefore,
  differenceInHours,
} from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
// import { toast } from "@/components/ui/use-toast"

interface PendingTransactionTableProps {
  data: Transaction[]
  isLoading?: boolean
}

type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

interface PendingTransaction extends Transaction {
  expectedCompletion: Date
  priority: "low" | "medium" | "high" | "urgent"
  riskScore: number
  autoRetryEnabled: boolean
  retryCount: number
  notificationEnabled: boolean
  processingStage: "initiated" | "verification" | "processing" | "finalizing"
}

export default function PendingTransactionTable({
  data,
  isLoading = false,
}: PendingTransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  })
  const [isExporting, setIsExporting] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedRows, setSelectedRows] = useState<PendingTransaction[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<PendingTransaction | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [processingTab, setProcessingTab] = useState<
    "all" | "high-risk" | "delayed" | "today"
  >("all")
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds

  // Enhance data with pending-specific fields
  const pendingTransactions = useMemo(() => {
    return data
      .filter((t) => t.status === "PENDING")
      .map((transaction, index) => ({
        ...transaction,
        expectedCompletion: addHours(
          new Date(transaction.date),
          Math.random() > 0.5 ? 24 : 48
        ),
        priority: ["low", "medium", "high", "urgent"][index % 4] as
          | "low"
          | "medium"
          | "high"
          | "urgent",
        riskScore: Math.floor(Math.random() * 100),
        autoRetryEnabled: Math.random() > 0.3,
        retryCount: Math.floor(Math.random() * 3),
        notificationEnabled: true,
        processingStage: [
          "initiated",
          "verification",
          "processing",
          "finalizing",
        ][index % 4] as
          | "initiated"
          | "verification"
          | "processing"
          | "finalizing",
      }))
  }, [data])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simulate refresh by updating risk scores
      //   toast({
      //     title: "Data Refreshed",
      //     description: "Pending transactions updated",
      //   })
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Memoize columns
  const tableColumns = useMemo<ColumnDef<PendingTransaction>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "referenceId",
        header: "Reference ID",
        cell: ({ row }) => {
          const referenceId = row.getValue("referenceId") as string
          const [copied, setCopied] = useState(false)

          const handleCopy = () => {
            navigator.clipboard.writeText(referenceId)
            setCopied(true)
            toast.success("Reference ID copied to clipboard")
            setTimeout(() => setCopied(false), 2000)
          }

          return (
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {referenceId}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"))
          const formatted = new Intl.NumberFormat("en-ET", {
            style: "currency",
            currency: "ETB",
          }).format(amount)

          return <div className="font-medium">{formatted}</div>
        },
      },
      {
        accessorKey: "expectedCompletion",
        header: "Expected By",
        cell: ({ row }) => {
          const date = new Date(row.getValue("expectedCompletion"))
          const isDelayed = isBefore(new Date(), date)
          const hoursRemaining = Math.abs(differenceInHours(date, new Date()))

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(date, "MMM dd, hh:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Timer
                  className={cn(
                    "h-3 w-3",
                    hoursRemaining < 24 ? "text-amber-500" : "text-green-500"
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {hoursRemaining}h remaining
                </span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
          const priority = row.getValue("priority") as string

          const priorityConfig = {
            urgent: {
              label: "Urgent",
              variant: "destructive" as const,
              icon: Zap,
            },
            high: {
              label: "High",
              variant: "warning" as const,
              icon: AlertTriangle,
            },
            medium: {
              label: "Medium",
              variant: "default" as const,
              icon: Clock4,
            },
            low: { label: "Low", variant: "secondary" as const, icon: History },
          }

          const config = priorityConfig[priority as keyof typeof priorityConfig]
          const Icon = config.icon

          return (
            <Badge variant={config.variant} className="gap-1">
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "riskScore",
        header: "Risk Score",
        cell: ({ row }) => {
          const score = row.getValue("riskScore") as number

          return (
            <div className="flex items-center gap-2">
              <div className="w-16">
                <Progress
                  value={score}
                  className={cn(
                    "h-2",
                    score > 70
                      ? "bg-red-500"
                      : score > 40
                      ? "bg-amber-500"
                      : "bg-green-500"
                  )}
                />
              </div>
              <span
                className={cn(
                  "font-medium text-sm",
                  score > 70
                    ? "text-red-600"
                    : score > 40
                    ? "text-amber-600"
                    : "text-green-600"
                )}
              >
                {score}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "processingStage",
        header: "Stage",
        cell: ({ row }) => {
          const stage = row.getValue("processingStage") as string

          const stageConfig = {
            initiated: { label: "Initiated", color: "bg-blue-500" },
            verification: { label: "Verification", color: "bg-amber-500" },
            processing: { label: "Processing", color: "bg-purple-500" },
            finalizing: { label: "Finalizing", color: "bg-green-500" },
          }

          const config = stageConfig[stage as keyof typeof stageConfig]

          return (
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${config.color}`} />
              <span className="text-sm font-medium">{config.label}</span>
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const transaction = row.original

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTransaction(transaction)
                  setSheetOpen(true)
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View details</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toast.success(
                    "Transaction priority increased for faster processing"
                  )
                }}
                className="h-8 w-8 p-0"
              >
                <Zap className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: pendingTransactions,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Update selected rows when rowSelection changes
  useEffect(() => {
    const selected = table.getSelectedRowModel().rows.map((row) => row.original)
    setSelectedRows(selected)
    setShowBulkActions(selected.length > 0)
  }, [rowSelection, table])

  // Calculate stats
  const totalAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0)
  const highPriorityCount = pendingTransactions.filter(
    (t) => t.priority === "high" || t.priority === "urgent"
  ).length
  const highRiskCount = pendingTransactions.filter(
    (t) => t.riskScore > 70
  ).length
  const delayedCount = pendingTransactions.filter((t) =>
    isBefore(new Date(t.expectedCompletion), new Date())
  ).length
  const averageRiskScore =
    pendingTransactions.reduce((sum, t) => sum + t.riskScore, 0) /
    pendingTransactions.length
  const autoRetryCount = pendingTransactions.filter(
    (t) => t.autoRetryEnabled
  ).length

  // Update active filters
  const updateActiveFilters = () => {
    const filters: string[] = []
    const priorityFilter = table
      .getColumn("priority")
      ?.getFilterValue() as string[]

    if (priorityFilter?.length) {
      filters.push(...priorityFilter.map((p) => `Priority: ${p}`))
    }
    if (globalFilter) {
      filters.push(`Search: "${globalFilter}"`)
    }
    if (dateRange.from && dateRange.to) {
      filters.push(
        `Date: ${format(dateRange.from, "MMM dd")} - ${format(
          dateRange.to,
          "MMM dd"
        )}`
      )
    }
    setActiveFilters(filters)
  }

  const clearAllFilters = () => {
    setGlobalFilter("")
    table.getColumn("priority")?.setFilterValue([])
    setDateRange({ from: undefined, to: undefined })
    setActiveFilters([])
    table.resetRowSelection()
  }

  const handleExport = async () => {
    setIsExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const selectedData =
      selectedRows.length > 0 ? selectedRows : pendingTransactions
    const csvContent = [
      [
        "Reference ID",
        "Amount",
        "Expected Completion",
        "Priority",
        "Risk Score",
        "Stage",
        "Retry Count",
      ],
      ...selectedData.map((t) => [
        t.referenceId,
        t.amount,
        format(t.expectedCompletion, "yyyy-MM-dd HH:mm"),
        t.priority,
        t.riskScore,
        t.processingStage,
        t.retryCount,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pending_transactions_${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()

    // setIsExporting(false)
    // // toast({
    //   title: "Export Complete",
    //   description: "Pending transactions exported successfully",
    // })
  }

  const handleBulkApprove = () => {
    // toast({
    //   title: "Transactions Approved",
    //   description: `${selectedRows.length} transactions approved for processing`,
    // })
    table.resetRowSelection()
  }

  const handleBulkExpedite = () => {
    // toast({
    //   title: "Transactions Expedited",
    //   description: `${selectedRows.length} transactions priority increased`,
    // })
    table.resetRowSelection()
  }

  const handleQuickDateFilter = (
    range: "today" | "week" | "month" | "year"
  ) => {
    const today = new Date()
    switch (range) {
      case "today":
        setDateRange({ from: today, to: today })
        break
      case "week":
        setDateRange({ from: subDays(today, 7), to: today })
        break
      case "month":
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) })
        break
      case "year":
        setDateRange({ from: new Date(today.getFullYear(), 0, 1), to: today })
        break
    }
    updateActiveFilters()
  }

  const toggleAutoRetry = (transaction: PendingTransaction) => {
    // toast({
    //   title: transaction.autoRetryEnabled ? "Auto-retry disabled" : "Auto-retry enabled",
    //   description: `Transaction ${transaction.referenceId} updated`,
    // })
  }

  const toggleNotifications = (transaction: PendingTransaction) => {
    // toast({
    //   title: transaction.notificationEnabled ? "Notifications disabled" : "Notifications enabled",
    //   description: `Updates for ${transaction.referenceId}`,
    // })
  }

  // Transaction Details Sheet Component
  const TransactionDetailsSheet = ({
    transaction,
  }: {
    transaction: PendingTransaction
  }) => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case "urgent":
          return "bg-red-500"
        case "high":
          return "bg-amber-500"
        case "medium":
          return "bg-blue-500"
        case "low":
          return "bg-green-500"
        default:
          return "bg-gray-500"
      }
    }

    const getStageProgress = (stage: string) => {
      const stages = ["initiated", "verification", "processing", "finalizing"]
      const currentIndex = stages.indexOf(stage)
      return ((currentIndex + 1) / stages.length) * 100
    }

    return (
      <ScrollArea className="h-full">
        <div className="p-6">
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${getPriorityColor(
                  transaction.priority
                )}`}
              />
              Pending Transaction Details
            </SheetTitle>
            <SheetDescription>
              Monitor and manage this pending transaction
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-muted/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: "ETB",
                    }).format(transaction.amount)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {transaction.type}
                  </p>
                </div>
                <Badge variant="warning" className="gap-1">
                  <Clock className="h-3 w-3" />
                  PENDING
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference ID</p>
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm">
                      {transaction.referenceId}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(transaction.referenceId)
                        // toast({
                        //   title: "Copied!",
                        //   description: "Reference ID copied",
                        // })
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-medium">{transaction.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Processing Status */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Loader2 className="h-5 w-5" />
                Processing Status
              </h4>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {getStageProgress(transaction.processingStage).toFixed(0)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={getStageProgress(transaction.processingStage)}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    "initiated",
                    "verification",
                    "processing",
                    "finalizing",
                  ].map((stage, index) => (
                    <div
                      key={stage}
                      className={cn(
                        "text-center p-2 rounded-lg text-sm",
                        transaction.processingStage === stage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <div className="font-medium capitalize">{stage}</div>
                      <div className="text-xs">Step {index + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline & Expected Completion */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Timeline
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Expected Completion</p>
                      <p className="text-sm text-muted-foreground">
                        {format(transaction.expectedCompletion, "PPpp")}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      differenceInHours(
                        transaction.expectedCompletion,
                        new Date()
                      ) < 24
                        ? "destructive"
                        : "warning"
                    }
                  >
                    {Math.abs(
                      differenceInHours(
                        transaction.expectedCompletion,
                        new Date()
                      )
                    )}
                    h
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Initiated</span>
                    <span className="text-muted-foreground">
                      {format(new Date(transaction.date), "PP")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Elapsed</span>
                    <span className="font-medium">
                      {Math.abs(
                        differenceInHours(
                          new Date(),
                          new Date(transaction.date)
                        )
                      )}{" "}
                      hours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk & Priority Analysis */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk & Priority Analysis
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Risk Score
                    </span>
                    <Badge
                      variant={
                        transaction.riskScore > 70
                          ? "destructive"
                          : transaction.riskScore > 40
                          ? "warning"
                          : "success"
                      }
                    >
                      {transaction.riskScore}
                    </Badge>
                  </div>
                  <Progress
                    value={transaction.riskScore}
                    className={cn(
                      "h-2",
                      transaction.riskScore > 70
                        ? "bg-red-500"
                        : transaction.riskScore > 40
                        ? "bg-amber-500"
                        : "bg-green-500"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Priority
                    </span>
                    <Badge
                      variant={
                        transaction.priority === "urgent"
                          ? "destructive"
                          : transaction.priority === "high"
                          ? "warning"
                          : transaction.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {transaction.priority}
                    </Badge>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        transaction.priority === "urgent"
                          ? "bg-red-500 w-full"
                          : transaction.priority === "high"
                          ? "bg-amber-500 w-3/4"
                          : transaction.priority === "medium"
                          ? "bg-blue-500 w-1/2"
                          : "bg-green-500 w-1/4"
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Automation Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Automation Settings</h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-retry">Auto-retry on Failure</Label>
                    <p className="text-sm text-muted-foreground">
                      {transaction.retryCount} retries attempted
                    </p>
                  </div>
                  <Switch
                    id="auto-retry"
                    checked={transaction.autoRetryEnabled}
                    onCheckedChange={() => toggleAutoRetry(transaction)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Status Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get updates on this transaction
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={transaction.notificationEnabled}
                    onCheckedChange={() => toggleNotifications(transaction)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1 gap-2" onClick={handleBulkApprove}>
                <CheckCircle className="h-4 w-4" />
                Approve Now
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleBulkExpedite}
              >
                <Zap className="h-4 w-4" />
                Expedite
              </Button>
              <Button variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Hold
              </Button>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4 pt-4">
              <h4 className="font-semibold text-lg">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Transaction Initiated</p>
                    <p className="text-sm text-muted-foreground">
                      {format(subDays(new Date(transaction.date), 1), "PPpp")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Verification Started</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), "PPpp")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">Currently Processing</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated {format(new Date(), "pp")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (isLoading) {
    return (
      <Card className="border">
        <CardHeader className="pb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border">
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Pending Transactions
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitor, manage, and expedite pending transactions
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <Label htmlFor="auto-refresh" className="text-sm">
              Auto-refresh
            </Label>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              //   toast({
              //     title: "Refreshing",
              //     description: "Updating pending transactions",
              //   })
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Total
                </p>
                <p className="text-2xl font-bold mt-2">
                  {new Intl.NumberFormat("en-ET", {
                    style: "currency",
                    currency: "ETB",
                    minimumFractionDigits: 0,
                  }).format(totalAmount)}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {pendingTransactions.length} transactions
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  High Priority
                </p>
                <p className="text-2xl font-bold mt-2">{highPriorityCount}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Needs attention
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  High Risk
                </p>
                <p className="text-2xl font-bold mt-2">{highRiskCount}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {averageRiskScore.toFixed(0)} avg score
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Delayed
                </p>
                <p className="text-2xl font-bold mt-2">{delayedCount}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Past expected time
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Timer className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Auto-retry
                </p>
                <p className="text-2xl font-bold mt-2">{autoRetryCount}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Automatic retry enabled
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-600" />
                  <span className="font-medium">
                    {selectedRows.length} pending transaction
                    {selectedRows.length !== 1 ? "s" : ""} selected
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {new Intl.NumberFormat("en-ET", {
                      style: "currency",
                      currency: "ETB",
                      minimumFractionDigits: 0,
                    }).format(
                      selectedRows.reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </Badge>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  {selectedRows.filter((t) => t.riskScore > 70).length} high
                  risk
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 border-amber-200"
                    >
                      Bulk Actions
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      Actions for {selectedRows.length} items
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleBulkApprove}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleBulkExpedite}
                      className="gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Expedite Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Pause className="h-4 w-4" />
                      Hold Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport} className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2">
                      <Bell className="h-4 w-4" />
                      Enable Notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.resetRowSelection()}
                  className="gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Pending Transactions</CardTitle>
              <CardDescription>
                {pendingTransactions.length} transactions pending •{" "}
                {highPriorityCount} high priority • {delayedCount} delayed
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={clearAllFilters}
              >
                <RefreshCw className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pending transactions..."
                  value={globalFilter ?? ""}
                  onChange={(e) => {
                    setGlobalFilter(String(e.target.value))
                    updateActiveFilters()
                  }}
                  className="pl-10"
                />
                {globalFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setGlobalFilter("")
                      updateActiveFilters()
                    }}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Date Range Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Date Range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <div className="flex gap-2">
                      {["today", "week", "month", "year"].map((range) => (
                        <Button
                          key={range}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDateFilter(range as any)}
                          className="capitalize"
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={{
                      from: dateRange.from,
                      to: dateRange.to,
                    }}
                    onSelect={(range) => {
                      setDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                      updateActiveFilters()
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {/* Priority Filter */}
              <DropdownMenu onOpenChange={updateActiveFilters}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Priority
                    {table.getColumn("priority")?.getFilterValue() && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                      >
                        {
                          (
                            table
                              .getColumn("priority")
                              ?.getFilterValue() as string[]
                          ).length
                        }
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["urgent", "high", "medium", "low"].map((priority) => (
                    <DropdownMenuCheckboxItem
                      key={priority}
                      checked={(
                        table
                          .getColumn("priority")
                          ?.getFilterValue() as string[]
                      )?.includes(priority)}
                      onCheckedChange={(checked) => {
                        const currentFilter =
                          (table
                            .getColumn("priority")
                            ?.getFilterValue() as string[]) || []
                        if (checked) {
                          table
                            .getColumn("priority")
                            ?.setFilterValue([...currentFilter, priority])
                        } else {
                          table
                            .getColumn("priority")
                            ?.setFilterValue(
                              currentFilter.filter((v) => v !== priority)
                            )
                        }
                        updateActiveFilters()
                      }}
                      className="gap-2 justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            priority === "urgent"
                              ? "bg-red-500"
                              : priority === "high"
                              ? "bg-amber-500"
                              : priority === "medium"
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        />
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {
                          pendingTransactions.filter(
                            (t) => t.priority === priority
                          ).length
                        }
                      </Badge>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Risk Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Risk Level
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Risk Score</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-3">
                    <Slider
                      defaultValue={[0, 100]}
                      max={100}
                      step={1}
                      className="w-full"
                      onValueChange={(value) => {
                        // Filter logic for risk score range
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-1 text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-amber-50 dark:bg-amber-950/20"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="whitespace-nowrap"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                      const transaction = row.original
                      const isDelayed = isBefore(
                        new Date(transaction.expectedCompletion),
                        new Date()
                      )

                      return (
                        <TableRow
                          key={row.id}
                          className={cn(
                            "group hover:bg-amber-50/50 dark:hover:bg-amber-950/10",
                            row.getIsSelected() && "bg-primary/5",
                            isDelayed && "bg-red-50/50 dark:bg-red-950/10"
                          )}
                          data-state={row.getIsSelected() && "selected"}
                          onClick={(e) => {
                            if (
                              !(e.target as HTMLElement).closest(
                                '[role="checkbox"], button'
                              )
                            ) {
                              setSelectedTransaction(transaction)
                              setSheetOpen(true)
                            }
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="whitespace-nowrap"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={tableColumns.length}
                        className="h-48 text-center"
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-3">
                            <CheckCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium">
                              No pending transactions
                            </p>
                            <p className="text-sm text-muted-foreground">
                              All transactions have been processed
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              pending transactions
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page
                </span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue
                      placeholder={String(table.getState().pagination.pageSize)}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from(
                    { length: Math.min(5, table.getPageCount()) },
                    (_, i) => {
                      const pageNumber =
                        table.getState().pagination.pageIndex + i - 2
                      if (
                        pageNumber >= 0 &&
                        pageNumber < table.getPageCount()
                      ) {
                        return (
                          <Button
                            key={pageNumber}
                            variant={
                              table.getState().pagination.pageIndex ===
                              pageNumber
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => table.setPageIndex(pageNumber)}
                            className={cn(
                              "h-8 w-8",
                              table.getState().pagination.pageIndex ===
                                pageNumber && "bg-primary"
                            )}
                          >
                            {pageNumber + 1}
                          </Button>
                        )
                      }
                      return null
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full">
          {selectedTransaction && (
            <TransactionDetailsSheet transaction={selectedTransaction} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
