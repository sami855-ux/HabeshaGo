"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUpDown,
  Copy,
  Check,
  MoreHorizontal,
  Receipt,
  Eye,
} from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return format(new Date(row.getValue("date")), "dd MMM yyyy")
    },
  },
  {
    accessorKey: "referenceId",
    header: "Reference ID",
    cell: ({ row }) => {
      const [copied, setCopied] = useState(false)
      const referenceId = row.getValue("referenceId") as string

      const handleCopy = () => {
        navigator.clipboard.writeText(referenceId)
        setCopied(true)
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return <span className="font-medium">{type}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="px-0 hover:bg-transparent"
          >
            Amount (ETB)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-ET", {
        style: "currency",
        currency: "ETB",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as string
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/50" />
          {method}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      const statusConfig = {
        SUCCESS: {
          variant: "success" as const,
          label: "Success",
        },
        PENDING: {
          variant: "warning" as const,
          label: "Pending",
        },
        FAILED: {
          variant: "destructive" as const,
          label: "Failed",
        },
      }

      const config = statusConfig[status as keyof typeof statusConfig]

      return (
        <Badge variant={config.variant} className="font-medium">
          {config.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original
      const [isOpen, setIsOpen] = useState(false)

      return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => console.log("View details:", transaction.id)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                transaction.hasReceipt &&
                console.log("Download receipt:", transaction.id)
              }
              disabled={!transaction.hasReceipt}
              className={
                !transaction.hasReceipt ? "opacity-50 cursor-not-allowed" : ""
              }
            >
              <Receipt className="mr-2 h-4 w-4" />
              Download receipt
              {!transaction.hasReceipt && " (Not available)"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
