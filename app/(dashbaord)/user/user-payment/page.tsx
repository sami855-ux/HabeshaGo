"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table"
import {
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Download,
  Filter,
  X,
} from "lucide-react"

import { StatusBadge } from "@/components/user-dashboard/payment/StatusBadge"
import { MethodIcon } from "@/components/user-dashboard/payment/MethodIcon"
import { FlowBadge } from "@/components/user-dashboard/payment/FlowBadge"
import { FilterSheet } from "@/components/user-dashboard/payment/FilterSheet"
import { BulkActionsBar } from "@/components/user-dashboard/payment/BulkActionsBar"
import { ConfirmDialog } from "@/components/user-dashboard/payment/ConfirmDialog"
import { TableSkeleton } from "@/components/user-dashboard/payment/TableSkeleton"
import { SummaryCards } from "@/components/user-dashboard/payment/SummaryCards"
import { usePayments } from "@/hooks/usePayments"
import type { Payment, BulkAction, ConfirmDialogState } from "@/types/payment"
import { Button } from "@/components/ui/button"

// Format Currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format Date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function PaymentsPage() {
  const {
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
  } = usePayments()

  // State
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    message: "",
    action: "",
    type: "danger",
  })

  // Get selected rows
  const selectedRows = useMemo(() => {
    return Object.keys(rowSelection).map(
      (index) => filteredData[parseInt(index)],
    )
  }, [rowSelection, filteredData])

  // Table columns definition
  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <button
            onClick={() => table.toggleAllRowsSelected()}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {table.getIsAllRowsSelected() ? (
              <span className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-white text-xs">
                ✓
              </span>
            ) : table.getIsSomeRowsSelected() ? (
              <span className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-white text-xs">
                -
              </span>
            ) : (
              <span className="w-4 h-4 border border-gray-300 rounded block" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <button
            onClick={() => row.toggleSelected()}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {row.getIsSelected() ? (
              <span className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-white text-xs">
                ✓
              </span>
            ) : (
              <span className="w-4 h-4 border border-gray-300 rounded block" />
            )}
          </button>
        ),
        size: 40,
      },
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 font-medium"
            onClick={() => column.toggleSorting()}
          >
            <span className="font-geist">ID</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4" />
            )}
          </button>
        ),
        cell: ({ row }) => <span className=" text-sm">#{row.original.id}</span>,
        size: 80,
      },
      {
        accessorKey: "reference",
        header: "Reference",
        cell: ({ row }) => (
          <span className=" text-sm">{row.original.reference}</span>
        ),
      },
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.user.name || "N/A"}</div>
            <div className="text-xs text-gray-500">
              {row.original.user.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 font-medium"
            onClick={() => column.toggleSorting()}
          >
            <span>Amount</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {formatCurrency(row.original.amount, row.original.currency)}
          </div>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <MethodIcon method={row.original.method} />
            <span className="text-sm">
              {row.original.method.replace("_", " ")}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "flow",
        header: "Flow",
        cell: ({ row }) => <FlowBadge flow={row.original.flow} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            className="flex items-center space-x-1 font-medium"
            onClick={() => column.toggleSorting()}
          >
            <span>Date</span>
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="w-4 h-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <ArrowUpDown className="w-4 h-4" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-sm">{formatDate(row.original.createdAt)}</div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end space-x-2">
            <Link href={`/payments/${row.original.id}`}>
              <Button variant={"default"} className="cursor-pointer">
                <Eye className="w-4 h-4" /> View
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    [],
  )

  // Table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Handle bulk actions
  const handleBulkAction = (action: BulkAction) => {
    const selectedCount = selectedRows.length

    switch (action) {
      case "delete":
        setConfirmDialog({
          isOpen: true,
          title: "Delete Payments",
          message: `Are you sure you want to delete ${selectedCount} selected ${selectedCount === 1 ? "payment" : "payments"}? This action cannot be undone.`,
          action: "delete",
          type: "danger",
        })
        break

      case "refund":
        setConfirmDialog({
          isOpen: true,
          title: "Process Refund",
          message: `Are you sure you want to refund ${selectedCount} selected ${selectedCount === 1 ? "payment" : "payments"}?`,
          action: "refund",
          type: "warning",
        })
        break

      case "cancel":
        setConfirmDialog({
          isOpen: true,
          title: "Cancel Payments",
          message: `Are you sure you want to cancel ${selectedCount} selected ${selectedCount === 1 ? "payment" : "payments"}?`,
          action: "cancel",
          type: "warning",
        })
        break

      case "export":
        console.log("Exporting:", selectedRows)
        alert(`Exporting ${selectedCount} payments`)
        break

      case "archive":
        console.log("Archiving:", selectedRows)
        alert(`Archiving ${selectedCount} payments`)
        break

      case "print":
        console.log("Printing:", selectedRows)
        alert(`Printing receipts for ${selectedCount} payments`)
        break

      case "email":
        console.log("Emailing:", selectedRows)
        alert(`Emailing details for ${selectedCount} payments`)
        break

      case "export-csv":
        console.log("Exporting CSV:", selectedRows)
        alert(`Exporting ${selectedCount} payments as CSV`)
        break

      case "tag":
        console.log("Adding tag to:", selectedRows)
        alert(`Adding tag to ${selectedCount} payments`)
        break

      case "verify":
        console.log("Verifying:", selectedRows)
        alert(`Verifying ${selectedCount} payments`)
        break

      default:
        console.log("Unknown action:", action)
    }
  }

  // Handle confirm action
  const handleConfirmAction = () => {
    const { action } = confirmDialog
    const selectedIds = new Set(selectedRows.map((p) => p.id))

    switch (action) {
      case "delete":
        // In a real app, you would call an API
        const updatedData = data.filter((item) => !selectedIds.has(item.id))
        setRowSelection({})
        alert(`Deleted ${selectedRows.length} payments`)
        break

      case "refund":
        alert(`Refunded ${selectedRows.length} payments`)
        break

      case "cancel":
        alert(`Cancelled ${selectedRows.length} payments`)
        break
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground">
              Financial Activity
            </p>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-sm text-muted-foreground">
              View completed payments, track pending transactions, and manage
              all travel-related charges.
            </p>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px space-x-8">
            {[
              "all",
              "pending",
              "success",
              "failed",
              "cancelled",
              "refunded",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-3 px-1 border-b-2 font-semibold text-sm capitalize transition-colors relative
                  ${
                    activeTab === tab
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.replace("_", " ")}
                {tab !== "all" && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {data.filter((p) => p.status.toLowerCase() === tab).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by reference, user, or ID..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className={`
                  flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors relative
                  ${
                    activeFilterCount > 0
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {}}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg ray-200 overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-geist font-medium text-gray-500 uppercase tracking-wider"
                            style={{ width: header.getSize() }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`
                          hover:bg-gray-50 transition-colors
                          ${row.getIsSelected() ? "bg-blue-50" : ""}
                        `}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      1}{" "}
                    to{" "}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                      filteredData.length,
                    )}{" "}
                    of {filteredData.length} results
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: table.getPageCount() },
                        (_, i) => i + 1,
                      )
                        .slice(
                          Math.max(
                            0,
                            table.getState().pagination.pageIndex - 2,
                          ),
                          Math.min(
                            table.getPageCount(),
                            table.getState().pagination.pageIndex + 3,
                          ),
                        )
                        .map((page) => (
                          <button
                            key={page}
                            onClick={() => table.setPageIndex(page - 1)}
                            className={`
                              w-8 h-8 rounded-lg text-sm font-medium transition-colors
                              ${
                                table.getState().pagination.pageIndex ===
                                page - 1
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }
                            `}
                          >
                            {page}
                          </button>
                        ))}
                    </div>

                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        table.setPageIndex(table.getPageCount() - 1)
                      }
                      disabled={!table.getCanNextPage()}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Empty State */}
        {!loading && filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payments found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filter criteria
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Bulk Actions Bar */}
        {Object.keys(rowSelection).length > 0 && (
          <BulkActionsBar
            selectedCount={Object.keys(rowSelection).length}
            onClearSelection={() => setRowSelection({})}
            onBulkAction={handleBulkAction}
          />
        )}

        {/* Filter Sheet */}
        <FilterSheet
          isOpen={isFilterSheetOpen}
          onClose={() => setIsFilterSheetOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() =>
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirm={handleConfirmAction}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
        />

        {/* Summary Cards */}
        <SummaryCards data={data} />
      </div>
    </div>
  )
}
