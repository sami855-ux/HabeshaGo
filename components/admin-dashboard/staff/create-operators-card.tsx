"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, ParkingSquare, Zap, UserPlus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import CreateOperatorDialog from "./create-operator-dialog"
import { useState } from "react"
import { Role } from "./create-operator-dialog"

export default function CreateOperatorsCard() {
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
        "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      role: "PARKING_OPERATOR" as Role,
      icon: ParkingSquare,
      label: "Add Parking Operator",
      description: "Manage parking facilities",
      color:
        "bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      role: "EV_OPERATOR" as Role,
      icon: Zap,
      label: "Add EV Operator",
      description: "Handle charging stations",
      color:
        "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ]

  return (
    <>
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {createButtons.map((button) => (
              <Button
                key={button.role}
                variant="outline"
                className={cn(
                  "w-full justify-start h-auto py-4 px-4 border transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                  button.color
                )}
                onClick={() => handleCreateClick(button.role)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", button.color)}>
                    <button.icon className={cn("h-5 w-5", button.iconColor)} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{button.label}</p>
                    <p className="text-xs opacity-75">{button.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </div>
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Need to add multiple operators?
            </p>
            <Button variant="ghost" className="w-full text-sm" size="sm">
              Import from CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <CreateOperatorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedRole={selectedRole}
      />
    </>
  )
}
