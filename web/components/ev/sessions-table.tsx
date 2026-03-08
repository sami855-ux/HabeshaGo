// components/charging-stations/sessions-table.tsx
"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Download,
  Clock,
  Zap,
  DollarSign,
  Battery,
  Calendar,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { format, formatDistance } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChargingSession {
  id: number;
  vehicleId: number;
  stationId: number;
  chargingPointId: number;
  startTime: string;
  endTime?: string | null;
  meterStart?: string | null;
  meterEnd?: string | null;
  energyConsumedKwh?: string | null;
  durationMinutes?: number | null;
  energyCost?: string | null;
  timeCost?: string | null;
  idleFee?: string | null;
  totalCost?: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionsTableProps {
  sessions: ChargingSession[];
  showStationInfo?: boolean;
}

export function SessionsTable({ sessions, showStationInfo = false }: SessionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const statusConfig = {
    ACTIVE: { 
      icon: Zap, 
      color: "text-green-500", 
      bg: "bg-green-100", 
      badge: "bg-green-500 text-white",
      label: "Active" 
    },
    COMPLETED: { 
      icon: Battery, 
      color: "text-blue-500", 
      bg: "bg-blue-100", 
      badge: "bg-blue-500 text-white",
      label: "Completed" 
    },
    CANCELLED: { 
      icon: Clock, 
      color: "text-gray-500", 
      bg: "bg-gray-100", 
      badge: "bg-gray-500 text-white",
      label: "Cancelled" 
    },
  };

  const columns: ColumnDef<ChargingSession>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Session ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">#{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "userId",
      header: "User",
      cell: ({ row }) => {
        const userId = row.getValue("userId") as string;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                {userId.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">User {userId.slice(0, 8)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "chargingPointId",
      header: "Charger",
      cell: ({ row }) => (
        <Badge variant="outline">CP-{row.getValue("chargingPointId")}</Badge>
      ),
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Start Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const startTime = row.getValue("startTime") as string;
        return (
          <div className="flex flex-col">
            <span className="text-sm">{format(new Date(startTime), "MMM dd, yyyy")}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(startTime), "hh:mm a")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "endTime",
      header: "End Time",
      cell: ({ row }) => {
        const endTime = row.getValue("endTime") as string | null;
        if (!endTime) return <Badge variant="outline">In Progress</Badge>;
        return (
          <div className="flex flex-col">
            <span className="text-sm">{format(new Date(endTime), "MMM dd, yyyy")}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(endTime), "hh:mm a")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "durationMinutes",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const duration = row.getValue("durationMinutes") as number | null;
        if (!duration) return <span className="text-muted-foreground">—</span>;
        
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">
              {hours > 0 ? `${hours}h ` : ''}{minutes}min
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "energyConsumedKwh",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Energy
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const energy = row.getValue("energyConsumedKwh") as string | null;
        if (!energy) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-1">
            <Battery className="h-3 w-3 text-muted-foreground" />
            <span>{parseFloat(energy).toFixed(1)} kWh</span>
          </div>
        );
      },
    },
    {
      accessorKey: "totalCost",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-semibold"
        >
          Total Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const cost = row.getValue("totalCost") as string | null;
        if (!cost) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-1 font-medium">
            <span>ETB {parseFloat(cost).toFixed(2)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusConfig;
        const StatusIcon = statusConfig[status]?.icon || Clock;
        return (
          <Badge className={statusConfig[status]?.badge}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig[status]?.label || status}
          </Badge>
        );
      },
    },
    {
      id: "breakdown",
      header: "Cost Breakdown",
      cell: ({ row }) => {
        const session = row.original;
        const breakdown = [];
        
        if (session.energyCost) {
          breakdown.push(`Energy: $${parseFloat(session.energyCost).toFixed(2)}`);
        }
        if (session.timeCost) {
          breakdown.push(`Time: $${parseFloat(session.timeCost).toFixed(2)}`);
        }
        if (session.idleFee && parseFloat(session.idleFee) > 0) {
          breakdown.push(`Idle: $${parseFloat(session.idleFee).toFixed(2)}`);
        }
        
        return (
          <div className="text-xs text-muted-foreground">
            {breakdown.join(' • ') || '—'}
          </div>
        );
      },
    },
    {
      id: "meter",
      header: "Meter Reading",
      cell: ({ row }) => {
        const session = row.original;
        if (!session.meterStart && !session.meterEnd) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="text-xs">
            <div>Start: {session.meterStart || '—'} kWh</div>
            <div>End: {session.meterEnd || '—'} kWh</div>
          </div>
        );
      },
    },
  ];

  // Filter sessions based on status
  const filteredSessions = sessions.filter(session => {
    if (statusFilter === "all") return true;
    return session.status === statusFilter;
  });

  const table = useReactTable({
    data: filteredSessions,
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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Calculate summary statistics
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter(s => s.status === "ACTIVE").length;
  const completedSessions = sessions.filter(s => s.status === "COMPLETED").length;
  const totalRevenue = sessions.reduce((sum, s) => sum + (parseFloat(s.totalCost || "0")), 0);
  const totalEnergy = sessions.reduce((sum, s) => sum + (parseFloat(s.energyConsumedKwh || "0")), 0);
  const avgDuration = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / (sessions.length || 1);

  return (
    <Card className="p-6 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Charging Sessions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all charging sessions
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2" />
                    <p>No sessions found</p>
                    <p className="text-sm">No charging sessions have been recorded yet</p>
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
          Showing {table.getRowModel().rows.length} of {filteredSessions.length} sessions
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
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}