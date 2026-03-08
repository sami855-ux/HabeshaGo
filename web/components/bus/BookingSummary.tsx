"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Bus,
  User,
  CreditCard,
  Wallet,
  Shield,
  Ticket,
  Gift,
  ArrowRight,
} from "lucide-react"

export function BookingSummary() {
  const [promoCode, setPromoCode] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")

  const bookingDetails = {
    route: "New York, NY → Boston, MA",
    bus: "Express Deluxe • AC Sleeper",
    date: "Dec 15, 2024 • 08:30 AM",
    seats: ["12A", "12B"],
    duration: "5h 15m",
    distance: "320 km",
  }

  const fareBreakdown = {
    baseFare: 200,
    serviceFee: 49,
    convenienceFee: 30,
    tax: 45,
    discount: 40,
    total: 284,
  }

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "wallet", name: "Digital Wallet", icon: Wallet },
    { id: "upi", name: "UPI Payment", icon: Shield },
    { id: "netbanking", name: "Net Banking", icon: Ticket },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          View Booking Summary
          <ArrowRight className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto px-6">
        <SheetHeader>
          <SheetTitle>Booking Summary</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Route Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Route Details</h4>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                Confirmed
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Bus className="size-5 text-orange-500" />
                <div>
                  <p className="font-medium">{bookingDetails.route}</p>
                  <p className="text-sm text-gray-500">{bookingDetails.bus}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{bookingDetails.date}</p>
                </div>
                <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Seats</p>
                  <div className="flex gap-1">
                    {bookingDetails.seats.map((seat) => (
                      <Badge key={seat} variant="secondary">
                        {seat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold">Fare Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(fareBreakdown).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-center py-2"
                >
                  <span className="capitalize text-gray-600 dark:text-gray-300">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span
                    className={`font-medium ${
                      key === "discount"
                        ? "text-green-600"
                        : key === "total"
                          ? "text-lg font-bold"
                          : ""
                    }`}
                  >
                    {key === "discount" ? "-" : ""}₹{value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Code */}
          <div className="space-y-3">
            <h4 className="font-bold">Promo Code</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button variant="outline">
                <Gift className="size-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer">
                WELCOME20
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                TRAVEL15
              </Badge>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-bold">Payment Method</h4>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div
                    className={`p-2 rounded ${
                      paymentMethod === method.id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <method.icon className="size-4" />
                  </div>
                  <span className="font-medium">{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Final Payment */}
          <div className="sticky bottom-0 pt-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold">₹{fareBreakdown.total}</p>
              </div>
              <Button className="px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                Pay Now
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield className="size-4" />
              <span>Secure payment • SSL encrypted</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
