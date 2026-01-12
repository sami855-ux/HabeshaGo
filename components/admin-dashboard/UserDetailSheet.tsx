// components/UserDetailSheet.tsx
"use client"

import { useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Eye,
  Mail,
  Phone,
  Shield,
  Wallet,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Car,
  Bus,
  ParkingSquare,
  CreditCard,
  Globe,
  User2,
} from "lucide-react"
import { format } from "date-fns"
import type { User, Theme, BadgeTheme } from "@/types/user"
import { getStatusBadge, getRoleBadge } from "@/lib/badge-utils"

interface UserDetailSheetProps {
  user: User | null
  theme?: Theme
  badgeTheme?: BadgeTheme
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailSheet({
  user,
  theme = "light",
  badgeTheme = "default",
  open,
  onOpenChange,
}: UserDetailSheetProps) {
  // Reset sheet when closed
  useEffect(() => {
    if (!open) {
      // Optional: reset any internal state here if needed
    }
  }, [open])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return format(new Date(dateString), "PPP p")
  }

  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-800 border-green-200 gap-1"
      >
        <CheckCircle className="h-3 w-3" />
        Verified
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1"
      >
        <AlertTriangle className="h-3 w-3" />
        Not Verified
      </Badge>
    )
  }

  // Don't render if no user
  if (!user) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-3">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <div className="relative">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-20 w-20 rounded-full border-4 border-background"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-4 border-background">
                  <User2 className="h-10 w-10 text-primary" />
                </div>
              )}
              {user.isSuspended && (
                <div className="absolute -top-1 -right-1">
                  <AlertTriangle className="h-5 w-5 text-red-500 fill-red-100" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">
                  {user.name || "Unnamed User"}
                </h2>
                {getRoleBadge(user.role, badgeTheme)}
                {user.isSuspended && getStatusBadge("suspended", badgeTheme)}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {user.email || "No email"}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {user.phone || "No phone"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User2 className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <p className="font-mono text-sm">{user.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Account Created
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(user.updatedAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Suspension Info */}
              {user.isSuspended && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      Account Suspended
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Suspended At
                      </p>
                      <p>{formatDate(user.suspendedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Suspended By
                      </p>
                      <p>{user.suspendedBy || "System"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reason</p>
                      <p className="text-red-600">
                        {user.suspensionReason || "No reason provided"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Verification</p>
                      <p className="text-sm text-muted-foreground">
                        Email address confirmation status
                      </p>
                    </div>
                    {getVerificationBadge(user.emailVerified)}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Phone Verification</p>
                      <p className="text-sm text-muted-foreground">
                        Phone number confirmation status
                      </p>
                    </div>
                    {getVerificationBadge(user.phoneVerified)}
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Extra layer of security
                      </p>
                    </div>
                    {user.twoFactorEnabled ? (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-800 border-gray-200"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              {/* Ride Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Ride Bookings
                    <Badge variant="secondary" className="ml-2">
                      {user.bookings?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.bookings && user.bookings.length > 0 ? (
                    <div className="space-y-2">
                      {user.bookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">Booking #{booking.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.createdAt)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              booking.status === "COMPLETED"
                                ? "default"
                                : booking.status === "CONFIRMED"
                                ? "secondary"
                                : booking.status === "PENDING"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No ride bookings</p>
                  )}
                </CardContent>
              </Card>

              {/* Minibus Reservations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bus className="h-4 w-4" />
                    Minibus Reservations
                    <Badge variant="secondary" className="ml-2">
                      {user.minibusReservations?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.minibusReservations &&
                  user.minibusReservations.length > 0 ? (
                    <div className="space-y-2">
                      {user.minibusReservations.slice(0, 3).map((res) => (
                        <div
                          key={res.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">Seat {res.seat}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(res.date)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              res.status === "CONFIRMED"
                                ? "default"
                                : res.status === "PENDING"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {res.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No minibus reservations
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Parking Reservations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ParkingSquare className="h-4 w-4" />
                    Parking Reservations
                    <Badge variant="secondary" className="ml-2">
                      {user.parkingReservations?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.parkingReservations &&
                  user.parkingReservations.length > 0 ? (
                    <div className="space-y-2">
                      {user.parkingReservations.slice(0, 3).map((res) => (
                        <div key={res.id} className="p-3 rounded-lg border">
                          <p className="font-medium">Slot {res.slotNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(res.startTime)} -{" "}
                            {formatDate(res.endTime)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No parking reservations
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Wallet Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.wallet ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold">
                            {user.wallet.balance.toLocaleString()}{" "}
                            {user.wallet.currency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Current Balance
                          </p>
                        </div>
                        <CreditCard className="h-12 w-12 text-primary/20" />
                      </div>
                      <div>
                        <p className="font-medium">Wallet ID</p>
                        <p className="font-mono text-sm">{user.wallet.id}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No wallet information available
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Connected Accounts */}
              {user.accounts && user.accounts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Connected Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {user.accounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Globe className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium capitalize">
                                {account.provider}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {account.providerAccountId}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">Connected</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1">
              Edit User
            </Button>
            {user.isSuspended ? (
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Unsuspend User
              </Button>
            ) : (
              <Button variant="destructive" className="flex-1">
                Suspend User
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
