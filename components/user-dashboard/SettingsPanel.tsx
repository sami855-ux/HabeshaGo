"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Bell,
  Bus,
  Clock3,
  CreditCard,
  Download,
  Fingerprint,
  Gift,
  Globe2,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Navigation,
  Receipt,
  Shield,
  Smartphone,
  Timer,
  ToggleLeft,
  Trash2,
  User,
  Wallet,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { TwoFactorAuthModal } from "../two-factor-auth-modal"
import { DeviceModal } from "./DeviceModal"

type ToggleKey =
  | "twoFA"
  | "push"
  | "email"
  | "paymentAlerts"
  | "arrivalAlerts"
  | "delayAlerts"
  | "lowBalance"
  | "promotions"
  | "emergency"
  | "autoRecharge"
  | "quickPay"
  | "offlineQr"
  | "panicLock"
  | "anonymousTracking"
  | "locationHistory"
  | "commuteReminders"
  | "trafficUpdates"

const deviceInventory = [
  {
    id: 1,
    name: "iPhone 14 Pro",
    location: "Addis Ababa",
    lastSeen: "2 mins ago",
  },
  { id: 2, name: "MacBook Air", location: "Adama", lastSeen: "Yesterday" },
  { id: 3, name: "Pixel Tablet", location: "Bahir Dar", lastSeen: "Last week" },
]

export default function SettingsPanel() {
  //2fa
  const [isEmail2FAModalOpen, setIsEmail2FAModalOpen] = useState(false)
  const [isSMS2FAModalOpen, setIsSMS2FAModalOpen] = useState(false)
  const [isAuthenticator2FAModalOpen, setIsAuthenticator2FAModalOpen] =
    useState(false)

  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    twoFA: true,
    push: true,
    email: true,
    paymentAlerts: true,
    arrivalAlerts: true,
    delayAlerts: false,
    lowBalance: true,
    promotions: false,
    emergency: true,
    autoRecharge: false,
    quickPay: true,
    offlineQr: false,
    panicLock: false,
    anonymousTracking: false,
    locationHistory: true,
    commuteReminders: true,
    trafficUpdates: true,
  })

  const [topUpMethod, setTopUpMethod] = useState("wallet")
  const [language, setLanguage] = useState("en")
  const [theme, setTheme] = useState("system")
  const [timeFormat, setTimeFormat] = useState("24h")
  const [minBalance, setMinBalance] = useState(300)
  const [dailyLimit, setDailyLimit] = useState(2000)
  const [monthlyLimit, setMonthlyLimit] = useState(25000)
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)
  const [showPanicModal, setShowPanicModal] = useState(false)

  const handleToggle = (key: ToggleKey) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const deviceCount = useMemo(() => deviceInventory.length, [])

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground">
              Settings
            </p>
            <h1 className="text-2xl font-bold">Control center</h1>
            <p className="text-sm text-muted-foreground">
              Configure account security, payments, alerts, and preferences in
              one place.
            </p>
          </div>
          <Badge variant="secondary" className="gap-2">
            <Shield className="size-4" />
            Secure defaults applied
          </Badge>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="size-5 text-primary" />
                Account & Access
              </CardTitle>
              <CardDescription>
                Protect your account and manage where you are signed in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <SettingToggle
                icon={<Fingerprint className="size-4 text-primary" />}
                title="Two-Factor Authentication (2FA)"
                description="Require OTP on login and sensitive actions."
                enabled={toggles.twoFA}
                onChange={() => {
                  handleToggle("twoFA")
                  setIsEmail2FAModalOpen(!toggles.twoFA)
                }}
              />

              <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Active sessions</p>
                    <p className="text-sm text-muted-foreground">
                      {deviceCount} device(s) signed in
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeviceModal(true)}
                    >
                      <Smartphone className="size-4 mr-1.5" />
                      View devices
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      <LogOut className="size-4 mr-1.5" />
                      Logout all
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Security questions</p>
                    <p className="text-sm text-muted-foreground">
                      Update fallback verification answers.
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setShowSecurityModal(true)}>
                    <KeyRound className="size-4 mr-1.5" />
                    Update
                  </Button>
                </div>
              </div>

              <SettingToggle
                icon={<AlertTriangle className="size-4 text-amber-500" />}
                title="Temporary panic lock"
                description="Lock account for 30 minutes and halt payments."
                enabled={toggles.panicLock}
                onChange={() => setShowPanicModal(true)}
              />

              <SettingToggle
                icon={<User className="size-4 text-muted-foreground" />}
                title="Deactivate account"
                description="Pause your account and hide your profile."
                enabled={false}
                disabled
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="size-5 text-primary" />
                Wallet & Payments
              </CardTitle>
              <CardDescription>
                Configure top-ups, limits, and quick-pay experiences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <LimitControl
                label="Auto-recharge minimum balance"
                value={minBalance}
                onChange={(value) => setMinBalance(value)}
                icon={<ToggleLeft className="size-4 text-primary" />}
              />
              <LimitControl
                label="Monthly spending limit"
                value={monthlyLimit}
                onChange={(value) => setMonthlyLimit(value)}
                icon={<CreditCard className="size-4 text-primary" />}
                max={100000}
              />

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setShowPinModal(true)}>
                  <Shield className="size-4 mr-2" />
                  Set/update transaction PIN
                </Button>
                <Button variant="outline">
                  <CreditCard className="size-4 mr-2" />
                  Saved cards & banks
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 justify-between min-w-[180px]"
                >
                  <Receipt className="size-4 mr-2" />
                  <span>Download statements (PDF/CSV)</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="size-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose where and when we should alert you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SettingToggle
                  icon={<Smartphone className="size-4 text-primary" />}
                  title="Push notifications"
                  enabled={toggles.push}
                  onChange={() => handleToggle("push")}
                />
                <SettingToggle
                  icon={<Mail className="size-4 text-primary" />}
                  title="Email alerts"
                  enabled={toggles.email}
                  onChange={() => handleToggle("email")}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SettingToggle
                  compact
                  icon={<Wallet className="size-4 text-primary" />}
                  title="Payment confirmations"
                  enabled={toggles.paymentAlerts}
                  onChange={() => handleToggle("paymentAlerts")}
                />
                <SettingToggle
                  compact
                  icon={<Bus className="size-4 text-primary" />}
                  title="Bus arrival reminders"
                  enabled={toggles.arrivalAlerts}
                  onChange={() => handleToggle("arrivalAlerts")}
                />
                <SettingToggle
                  compact
                  icon={<Timer className="size-4 text-primary" />}
                  title="Trip delay alerts"
                  enabled={toggles.delayAlerts}
                  onChange={() => handleToggle("delayAlerts")}
                />
                <SettingToggle
                  compact
                  icon={<AlertTriangle className="size-4 text-amber-500" />}
                  title="Emergency service alerts"
                  enabled={toggles.emergency}
                  onChange={() => handleToggle("emergency")}
                />
                <SettingToggle
                  compact
                  icon={<Wallet className="size-4 text-primary" />}
                  title="Wallet low-balance alerts"
                  enabled={toggles.lowBalance}
                  onChange={() => handleToggle("lowBalance")}
                />
                <SettingToggle
                  compact
                  icon={<Gift className="size-4 text-primary" />}
                  title="Promotional messages"
                  enabled={toggles.promotions}
                  onChange={() => handleToggle("promotions")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="size-5 text-primary" />
                Transport Preferences
              </CardTitle>
              <CardDescription>
                Keep your journeys personalized.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Favorite routes</Label>
                  <Input placeholder="Add route names or IDs" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred boarding points</Label>
                  <Input placeholder="E.g., Megenagna, Sar Bet" />
                </div>
                <div className="space-y-2">
                  <Label>Preferred drop-off points</Label>
                  <Input placeholder="E.g., Bole Dildiy, Piassa" />
                </div>
                <SettingToggle
                  compact
                  icon={<Clock3 className="size-4 text-primary" />}
                  title="Daily commute reminders"
                  enabled={toggles.commuteReminders}
                  onChange={() => handleToggle("commuteReminders")}
                />
                <SettingToggle
                  compact
                  icon={<Navigation className="size-4 text-primary" />}
                  title="Live traffic updates"
                  enabled={toggles.trafficUpdates}
                  onChange={() => handleToggle("trafficUpdates")}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe2 className="size-5 text-primary" />
                Language, Region & Display
              </CardTitle>
              <CardDescription>
                Localize and theme your experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">Amharic</SelectItem>
                    <SelectItem value="om">Afaan Oromo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time format</Label>
                <Select value={timeFormat} onValueChange={setTimeFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 rounded-lg border bg-muted/30 p-4">
                <p className="font-medium flex items-center gap-2">
                  <Laptop className="size-4 text-primary" />
                  Preview
                </p>
                <p className="text-sm text-muted-foreground">
                  Changes apply instantly across dashboard, receipts, and trip
                  views.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="size-5 text-primary" />
                Privacy & Data
              </CardTitle>
              <CardDescription>Control data usage and exports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SettingToggle
                  icon={<Fingerprint className="size-4 text-primary" />}
                  title="Anonymous trip tracking"
                  description="Hide identifiers while collecting insights."
                  enabled={toggles.anonymousTracking}
                  onChange={() => handleToggle("anonymousTracking")}
                />
                <SettingToggle
                  icon={<MapPin className="size-4 text-primary" />}
                  title="Disable location history"
                  description="Stop storing precise locations."
                  enabled={!toggles.locationHistory}
                  onChange={() => handleToggle("locationHistory")}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  <Download className="size-4 mr-2" />
                  <span>Download personal data</span>
                </Button>
                <Button variant="destructive">
                  <Trash2 className="size-4 mr-2" />
                  <span>Request data deletion</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <DeviceModal open={showDeviceModal} onOpenChange={setShowDeviceModal} />
        <PinModal open={showPinModal} onOpenChange={setShowPinModal} />
        <SecurityModal
          open={showSecurityModal}
          onOpenChange={setShowSecurityModal}
        />
        <PanicModal open={showPanicModal} onOpenChange={setShowPanicModal} />
      </div>

      <TwoFactorAuthModal
        open={isEmail2FAModalOpen}
        onOpenChange={setIsEmail2FAModalOpen}
        onVerified={() => {}}
        userId="user_123"
        otpRequestEndpoint="/api/auth/otp/request"
        otpVerifyEndpoint="/api/auth/otp/verify"
        otpMethod="email"
        actionName="password change"
        title="Enable Two-Factor Authentication"
        description="Add an extra layer of security to your account by verifying your identity with a one-time code sent to your email."
      />
    </>
  )
}

function SettingToggle({
  icon,
  title,
  description,
  enabled,
  onChange,
  compact,
  disabled,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  enabled: boolean
  onChange?: () => void
  compact?: boolean
  disabled?: boolean
}) {
  return (
    <div
      className="flex items-start justify-between gap-3 rounded-lg border p-3"
      aria-disabled={disabled}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {!compact && description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {compact && description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  )
}

function LimitControl({
  label,
  value,
  onChange,
  icon,
  max = 10000,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  icon: React.ReactNode
  max?: number
}) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            {icon}
          </div>
          <p className="font-medium">{label}</p>
        </div>
        <span className="text-sm font-semibold text-foreground">
          {value.toLocaleString()} ETB
        </span>
      </div>
      <Slider
        value={[value]}
        max={max}
        min={0}
        step={50}
        onValueChange={(val) => onChange(val[0])}
      />
      <div className="flex items-center gap-3 py-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-32"
        />
        <p className="text-xs text-muted-foreground">Drag or type to adjust.</p>
      </div>
    </div>
  )
}

// function DeviceModal({
//   open,
//   onOpenChange,
// }: {
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Active sessions</DialogTitle>
//           <DialogDescription>
//             Review devices currently signed in and end any that look unfamiliar.
//           </DialogDescription>
//         </DialogHeader>
//         <div className="space-y-3">
//           {deviceInventory.map((device) => (
//             <div
//               key={device.id}
//               className="flex items-center justify-between rounded-lg border p-3"
//             >
//               <div className="flex items-center gap-3">
//                 <Smartphone className="size-4 text-primary" />
//                 <div>
//                   <p className="font-medium">{device.name}</p>
//                   <p className="text-xs text-muted-foreground">
//                     {device.location} - {device.lastSeen}
//                   </p>
//                 </div>
//               </div>
//               <Button variant="outline" size="sm">
//                 Logout
//               </Button>
//             </div>
//           ))}
//         </div>
//         <DialogFooter className="sm:justify-start">
//           <Button variant="destructive" className="w-full sm:w-auto">
//             Logout all devices
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

function PinModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set transaction PIN</DialogTitle>
          <DialogDescription>
            Create a 4-6 digit PIN for payments and wallet transfers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="pin">New PIN</Label>
            <Input id="pin" type="password" placeholder="••••" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPin">Confirm PIN</Label>
            <Input id="confirmPin" type="password" placeholder="••••" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Save PIN</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SecurityModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update security questions</DialogTitle>
          <DialogDescription>
            Use answers only you know to help verify identity when needed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Question 1</Label>
            <Input placeholder="Your first school?" />
          </div>
          <div className="space-y-1">
            <Label>Question 2</Label>
            <Input placeholder="Favorite local dish?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Save answers</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PanicModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activate panic lock</DialogTitle>
          <DialogDescription>
            Temporarily lock your account, stop outgoing payments, and sign out
            sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4" />
            <p className="text-sm">
              You can unlock after 30 minutes or by contacting support with ID.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive">Lock now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
