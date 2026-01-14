import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import type { Bus } from "@/types/bus"
import { columns } from "./columns"

interface BusTableProps {
  buses: Bus[]
  isMobile: boolean
  selectedRows: Record<string, boolean>
  onSelectRow: (id: number, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
}

export default function BusTable({ 
  buses, 
  isMobile, 
  selectedRows, 
  onSelectRow, 
  onSelectAll 
}: BusTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  // Add select column to columns
  const tableColumns: ColumnDef<Bus>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => onSelectAll(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows[row.original.id]}
          onCheckedChange={(value) => onSelectRow(row.original.id, !!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    ...columns,
  ]

  const table = useReactTable({
    data: buses,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isMobile) {
    return (
      <div>
        {buses.map((bus) => (
          <MobileBusCard
            key={bus.id}
            bus={bus}
            isSelected={!!selectedRows[bus.id]}
            onSelect={(id) => onSelectRow(id, !selectedRows[id])}
          />
        ))}
        {buses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No buses found</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50"
                  data-state={selectedRows[row.original.id] && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  No buses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import MobileBusCard from "./MobileBusCard"