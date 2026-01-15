"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Settings,
  Shield,
  Activity,
  Bell,
  Car,
  ParkingSquare,
  Zap,
  UserPlus,
  Download,
  Upload,
  ArrowLeft,
} from "lucide-react"
import OperatorsTable from "@/components/admin-dashboard/staff/operators-table"
import CreateOperatorDialog from "@/components/admin-dashboard/staff/create-operator-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { type Role } from "@/types/operator"
import { useRouter } from "next/navigation"

export default function OperatorsManagement() {
  const router = useRouter()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const handleCreateClick = (role: Role) => {
    setSelectedRole(role)
    setDialogOpen(true)
  }

  const createButtons = [
    {
      role: "DRIVER" as Role,
      icon: Car,
      label: "Add Driver",
      description: "Assign to buses and routes",
      color:
        "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      role: "PARKING_OPERATOR" as Role,
      icon: ParkingSquare,
      label: "Add Parking Operator",
      description: "Manage parking facilities",
      color:
        "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      role: "EV_OPERATOR" as Role,
      icon: Zap,
      label: "Add EV Operator",
      description: "Handle charging stations",
      color:
        "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      role: "STAFF" as Role,
      icon: UserPlus,
      label: "Add Staff Member",
      description: "Administrative and support staff",
      color:
        "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950/30",
      iconColor: "text-gray-600 dark:text-gray-400",
    },
  ]

  return (
    <div className="min-h-screen p-0 bg-background rounded-xl">
      {/* Header */}
      <header className="border-none bg-card sticky top-0 z-40">
        <div className=" mx-auto px-4 py-4 sm:px-6 bg-background rounded-t-xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Staff & Operator Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage drivers, parking operators, EV charging operators and
                  staff
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:px-6">
        {/* Stats Cards - Updated with neutral colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Operators
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">68.9% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Duty</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Actions
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Operators Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <p className="text-sm text-muted-foreground">
                Add new operators to the system
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {createButtons.map((button) => (
              <Button
                key={button.role}
                variant="outline"
                className={cn(
                  "h-auto py-4 px-4 border cursor-pointer flex flex-col items-start gap-2 hover:shadow"
                  // button.color
                )}
                onClick={() => handleCreateClick(button.role)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background">
                    <button.icon className={cn("h-5 w-5", button.iconColor)} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{button.label}</p>
                    <p className="text-xs opacity-75">{button.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Recent Activity & Table Section */}
        <div className="mb-8">
          <Card className="w-full border-none">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">All Operators</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage and monitor all staff and operators in the system
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <OperatorsTable />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t bg-card">
        <div className="container mx-auto px-4 py-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Transport System Admin. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Terms of Service
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Support
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Create Operator Dialog */}
      <CreateOperatorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedRole={selectedRole}
      />
    </div>
  )
}
