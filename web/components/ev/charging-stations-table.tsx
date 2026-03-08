// components/charging-stations/charging-stations-table.tsx
"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Power,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Gauge,
  DollarSign,
  Battery,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ChargingStation } from "@/types/ev";
import { useRouter } from "next/navigation"

// Extended type for display purposes
interface ExtendedChargingStation extends ChargingStation {
  totalChargers: number;
  availableChargers: number;
  occupiedChargers: number;
  revenueToday: number;
  energyDelivered: number;
  utilizationRate: number;
}

interface ChargingStationsTableProps {
  data: ChargingStation[];
  selectedStations: string[];
  setSelectedStations: (stations: string[]) => void;
  filters: any;
  setFilters: (filters: any) => void;
}

export function ChargingStationsTable({
  data,
  selectedStations,
  setSelectedStations,
  filters,
  setFilters,
}: ChargingStationsTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Calculate real-time metrics from charging points
  const enrichedData = useMemo(() => {
    return data.map(station => {
      const chargingPoints = station.chargingPoints || [];
      const totalChargers = chargingPoints.length;
      const availableChargers = chargingPoints.filter(cp => cp.status === "AVAILABLE").length;
      const occupiedChargers = chargingPoints.filter(cp => cp.status === "OCCUPIED").length;
      const utilizationRate = totalChargers > 0 ? (occupiedChargers / totalChargers) * 100 : 0;
      
      // Calculate today's revenue from sessions
      const today = new Date().toDateString();
      const todaysSessions = station.sessions?.filter(session => 
        new Date(session.startTime).toDateString() === today
      ) || [];
      const revenueToday = todaysSessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const energyDelivered = todaysSessions.reduce((sum, session) => sum + (session.energy || 0), 0);

      return {
        ...station,
        totalChargers,
        availableChargers,
        occupiedChargers,
        revenueToday,
        energyDelivered,
        utilizationRate,
      };
    });
  }, [data]);

  const columns: ColumnDef<ExtendedChargingStation>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Station Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue("name")}</span>
            {row.original.isVerified && (
              <CheckCircle2 className="h-4 w-4 text-blue-500" title="Verified" />
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{row.original.address || "No address"}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span>{row.getValue("city") || "N/A"}</span>
      ),
    },
    {
      id: "chargers",
      header: "Chargers",
      columns: [
        {
          accessorKey: "totalChargers",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="font-semibold"
            >
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => (
            <div className="text-center font-medium">{row.getValue("totalChargers")}</div>
          ),
        },
        {
          accessorKey: "availableChargers",
          header: "Available",
          cell: ({ row }) => (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {row.getValue("availableChargers")}
            </Badge>
          ),
        },
        {
          accessorKey: "occupiedChargers",
          header: "Occupied",
          cell: ({ row }) => (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              {row.getValue("occupiedChargers")}
            </Badge>
          ),
        },
        {
          accessorKey: "utilizationRate",
          header: ({ column }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="font-semibold"
            >
              Utilization
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }) => {
            const rate = row.getValue("utilizationRate") as number;
            return (
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      rate > 80 ? "bg-red-500" : rate > 50 ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-sm">{rate.toFixed(0)}%</span>
              </div>
            );
          },
        },
      ],
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={cn(
              "gap-1",
              status === "ACTIVE" && "bg-green-500",
              status === "INACTIVE" && "bg-gray-500",
              status === "MAINTENANCE" && "bg-yellow-500"
            )}
          >
            {status === "ACTIVE" && <CheckCircle2 className="h-3 w-3" />}
            {status === "INACTIVE" && <XCircle className="h-3 w-3" />}
            {status === "MAINTENANCE" && <AlertCircle className="h-3 w-3" />}
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "energyDelivered",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          <Battery className="h-4 w-4 mr-1" />
          Energy
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(row.getValue("energyDelivered"))} kWh
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          <Clock className="h-4 w-4 mr-1" />
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(row.getValue("createdAt")), "hh:mm a")}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const station = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/admin/infrastructure/ev-stations/${station.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Edit", station.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit station
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Manage chargers", station.id)}>
                <Gauge className="mr-2 h-4 w-4" />
                Manage chargers
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log("Toggle status", station.id)}>
                <Power className="mr-2 h-4 w-4" />
                {station.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => console.log("Delete", station.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete station
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: enrichedData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card className="p-4 border-none shadow-none">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or address..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.city}
            onValueChange={(value) => setFilters({ ...filters, city: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {Array.from(new Set(data.map(s => s.city).filter(Boolean))).map(city => (
                <SelectItem key={city} value={city || ""}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
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
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Search className="h-8 w-8 mb-2" />
                    <p>No stations found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}