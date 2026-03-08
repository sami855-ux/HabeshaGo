"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BusIcon,
  Users,
  MapPin,
  ArrowUpDown,
  MoreVertical,
  Eye,
  Edit,
  Wrench,
  Trash2,
  UserCog,
  Ban,
} from "lucide-react"
import type { Bus } from "@/types/bus"
import {
  ColorfulStatusBadge,
  ColorfulUnassignedBadge,
  ColorfulNoRouteBadge,
} from "./badge-utils"
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
import { useRouter } from "next/navigation"

export const columns: ColumnDef<Bus>[] = [
  {
    accessorKey: "busNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent font-medium"
      >
        Bus Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <BusIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.busNumber}</span>
      </div>
    ),
  },
  {
    accessorKey: "capacity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent font-medium"
      >
        Capacity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.capacity} seats</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent font-medium"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <ColorfulStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "driverName",
    header: "Driver",
    cell: ({ row }) => (
      <div>
        {row.original.driverName ? (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.driverName}</span>
            <span className="text-xs text-muted-foreground">
              ID: {row.original.driverId?.slice(0, 8)}...
            </span>
          </div>
        ) : (
          <ColorfulUnassignedBadge />
        )}
      </div>
    ),
  },
  {
    accessorKey: "routeName",
    header: "Route",
    cell: ({ row }) => (
      <div>
        {row.original.routeName ? (
          <Badge variant="secondary">Route {row.original.routeName}</Badge>
        ) : (
          <ColorfulNoRouteBadge />
        )}
      </div>
    ),
  },
  {
    accessorKey: "currentStop",
    header: "Current Stop",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.currentStop || "N/A"}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const bus = row.original
      const router = useRouter()

      const handleViewDetails = () => {
        router.push(`/admin/manage-bus/${bus.id}`)
      }

      const handleEdit = () => {
        router.push(`/admin/buses/${bus.id}/edit`)
      }

      const handleSetMaintenance = () => {
        console.log("Set maintenance for bus:", bus.id)
        // Add API call here
      }

      const handleAssignDriver = () => {
        console.log("Assign driver to bus:", bus.id)
        // Add API call here
      }

      const handleDeactivate = () => {
        console.log("Deactivate bus:", bus.id)
        // Add API call here
      }

      const handleDelete = () => {
        console.log("Delete bus:", bus.id)
        // Add API call here with confirmation dialog
      }

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleViewDetails}
                  className="flex items-center gap-2 h-8 px-3 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Bus Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2 h-8 px-3"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Bus Information</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSetMaintenance}>
                <Wrench className="mr-2 h-4 w-4" />
                <span>Set Maintenance</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleAssignDriver}>
                <UserCog className="mr-2 h-4 w-4" />
                <span>Assign Driver</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDeactivate}>
                <Ban className="mr-2 h-4 w-4" />
                <span>Deactivate Bus</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Bus</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
