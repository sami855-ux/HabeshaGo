"use client"

import { useState } from "react"
import {
  Wallet,
  Shield,
  Lock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  BadgeCheck,
  Gift,
  Timer,
  Bell,
  HelpCircle,
  ShieldCheck,
  HeartPulse,
  Umbrella,
  AlertCircle,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function PaymentPage() {
  const router = useRouter()

  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [walletPin, setWalletPin] = useState("")
  const [addTravelProtection, setAddTravelProtection] = useState(true)
  const [addCancellationProtection, setAddCancellationProtection] =
    useState(true)

  const bookingDetails = {
    from: "New York",
    to: "Boston",
    date: "Dec 15, 2024",
    time: "08:30 AM",
    duration: "5h 15m",
    bus: "Express Travels ET-7890",
    seats: ["A1", "A2"],
    operator: "Express Travels",
    baseFare: 1299,
    taxes: 259,
    convenienceFee: 49,
    discount: -200,
    travelProtection: addTravelProtection ? 99 : 0,
    cancellationProtection: addCancellationProtection ? 149 : 0,
    total:
      1407 +
      (addTravelProtection ? 99 : 0) +
      (addCancellationProtection ? 149 : 0),
  }

  const handleWalletPayment = () => {
    if (walletPin.length !== 6) {
      alert("Please enter your 6-digit wallet PIN")
      return
    }

    setProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)
      router.push("/user/payment/success")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 rounded-2xl">
      <div className="container mx-auto py-8 max-w-7xl px-4 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Complete Payment</h1>
                <p className="text-muted-foreground mt-1">
                  Secure wallet payment · Travel protection included
                </p>
              </div>
              <Badge variant="outline" className="gap-2">
                <Timer className="size-3" />
                10:45 min left
              </Badge>
            </div>

            {/* Wallet Payment Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="size-5" />
                    Wallet Payment
                  </CardTitle>
                  <Badge variant="secondary" className="gap-2">
                    <Sparkles className="size-3" />
                    Fast Checkout
                  </Badge>
                </div>
                <CardDescription>
                  Enter your secure PIN to complete payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* PIN Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base">Wallet PIN</Label>
                    <Input
                      type="password"
                      placeholder="Enter 6-digit PIN"
                      value={walletPin}
                      onChange={(e) => setWalletPin(e.target.value)}
                      className="h-14 text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit PIN you set for your wallet
                    </p>
                  </div>

                  {/* Security Info */}
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <Lock className="size-4" />
                    <span>Your PIN is encrypted for maximum security</span>
                  </div>
                </div>

                {/* Forgot PIN */}
                <div className="text-center">
                  <Button variant="link" className="text-sm">
                    Forgot wallet PIN? Reset it here
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Guarantee */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BadgeCheck className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">
                      Payment Security Guarantee
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your payment is protected with bank-level encryption. We
                      never store your PIN.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="space-y-4">
            {/* Booking Summary Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Summary</span>
                  <Badge variant="secondary" className="gap-2">
                    <Wallet className="size-3" />
                    Wallet Payment
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Route Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {bookingDetails.from}
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {bookingDetails.to}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{bookingDetails.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{bookingDetails.time}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {bookingDetails.duration}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {bookingDetails.seats.length} seats
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Fare</span>
                      <span>ETB {bookingDetails.baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Taxes & Fees
                      </span>
                      <span>ETB {bookingDetails.taxes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-grotesk">
                        Convenience Fee
                      </span>
                      <span>ETB {bookingDetails.convenienceFee}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount Applied</span>
                      <span>ETB {bookingDetails.discount}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-lg">Total Amount</div>
                        <div className="text-sm text-muted-foreground">
                          Including protection plans
                        </div>
                      </div>
                      <div className="text-3xl font-bold">
                        ETB {bookingDetails.total}
                      </div>
                    </div>

                    {addTravelProtection && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                        <ShieldCheck className="size-4" />
                        <span>
                          Your trip is protected with travel insurance
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Security Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <Shield className="size-4 text-green-600 font-grotesk" />
                      <span className="text-xs">Payment Protected</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <Lock className="size-4 text-blue-600" />
                      <span className="text-xs">PIN Encrypted</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mt-4 text-xs text-muted-foreground">
                    <Checkbox id="terms" className="mt-0.5" />
                    <Label htmlFor="terms" className="cursor-pointer">
                      I agree to the Terms of Service, Privacy Policy, and
                      authorize this charge
                    </Label>
                  </div>

                  {/* Pay Button */}
                  <Button
                    size="lg"
                    className="w-full mt-6 cursor-pointer"
                    onClick={handleWalletPayment}
                    disabled={processing || walletPin.length !== 6}
                  >
                    {processing ? (
                      <>
                        <div className="size-5 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 size-5" />
                        Pay ETB {bookingDetails.total}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Need Help Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Need Help?</div>
                    <p className="text-sm text-muted-foreground">
                      24/7 customer support available
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 gap-2">
                  <HelpCircle className="size-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Travel Protection Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Why Add Protection?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="size-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="size-3 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Trip Delay Coverage:</span>
                    <span className="text-muted-foreground">
                      {" "}
                      Get compensated for delays
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="size-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="size-3 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Medical Assistance:</span>
                    <span className="text-muted-foreground">
                      {" "}
                      24/7 emergency support
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="size-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="size-3 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Full Refund:</span>
                    <span className="text-muted-foreground">
                      {" "}
                      Cancel anytime for 100% refund
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
