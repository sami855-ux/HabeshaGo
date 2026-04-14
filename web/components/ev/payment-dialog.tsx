"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreditCard, Wallet, Coins, CheckCircle, Zap } from "lucide-react"

interface ChargingPoint {
  id: number
  slotNumber: string
  connectorType: string
}

interface SavedCard {
  id: number
  last4: string
  brand: string
  expiry: string
}

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentStep: "confirm" | "processing" | "success"
  stationName: string
  selectedPoint: ChargingPoint | null | undefined
  energyKwh: number
  totalAmount: number
  applyPoints: boolean
  pointsToUseAmount: number
  paymentMethod: "wallet" | "points" | "card"
  walletBalance: number
  pointsBalance: number
  savedCards: SavedCard[]
  selectedCardId: number | null
  setSelectedCardId: (id: number | null) => void
  useNewCard: boolean
  setUseNewCard: (value: boolean) => void
  cardDetails: { number: string; expiry: string; cvc: string; name: string }
  setCardDetails: (details: any) => void
  onConfirmPayment: () => void
}

const formatCurrency = (amount: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function PaymentDialog({
  open,
  onOpenChange,
  paymentStep,
  stationName,
  selectedPoint,
  energyKwh,
  totalAmount,
  applyPoints,
  pointsToUseAmount,
  paymentMethod,
  walletBalance,
  pointsBalance,
  savedCards,
  selectedCardId,
  setSelectedCardId,
  useNewCard,
  setUseNewCard,
  cardDetails,
  setCardDetails,
  onConfirmPayment,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {paymentStep === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                </div>
                Confirm Payment
              </DialogTitle>
              <DialogDescription>
                Review your charging session details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Station</span>
                  <span className="font-medium">{stationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Charging Point</span>
                  <span className="font-medium">
                    {selectedPoint?.slotNumber} ({selectedPoint?.connectorType})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Energy</span>
                  <span className="font-medium">{energyKwh} kWh</span>
                </div>
                {applyPoints && pointsToUseAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Discount</span>
                    <span>-{formatCurrency(pointsToUseAmount)}</span>
                  </div>
                )}
                <Separator className="bg-orange-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-orange-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Select Card</Label>
                    <Button
                      variant="link"
                      className="text-orange-600 h-auto p-0"
                      onClick={() => setUseNewCard(!useNewCard)}
                    >
                      {useNewCard ? "Use saved card" : "+ Add new card"}
                    </Button>
                  </div>

                  {!useNewCard ? (
                    <div className="space-y-2">
                      {savedCards.map((card) => (
                        <div
                          key={card.id}
                          className={`flex items-center justify-between border-2 rounded-xl p-3 cursor-pointer transition-all ${
                            selectedCardId === card.id
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200"
                          }`}
                          onClick={() => setSelectedCardId(card.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <CreditCard className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {card.brand} •••• {card.last4}
                              </div>
                              <div className="text-xs text-gray-500">
                                Expires {card.expiry}
                              </div>
                            </div>
                          </div>
                          <RadioGroupItem
                            value={card.id.toString()}
                            id={`card-${card.id}`}
                            checked={selectedCardId === card.id}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        placeholder="Card Number"
                        value={cardDetails.number}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            number: e.target.value,
                          })
                        }
                        className="rounded-xl"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              expiry: e.target.value,
                            })
                          }
                          className="rounded-xl"
                        />
                        <Input
                          placeholder="CVC"
                          type="password"
                          value={cardDetails.cvc}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cvc: e.target.value,
                            })
                          }
                          className="rounded-xl"
                        />
                      </div>
                      <Input
                        placeholder="Cardholder Name"
                        value={cardDetails.name}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            name: e.target.value,
                          })
                        }
                        className="rounded-xl"
                      />
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                  <Wallet className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm">Paying with EV Wallet</p>
                  <p className="font-bold text-xl">
                    {formatCurrency(walletBalance)} available
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Sufficient balance
                  </p>
                </div>
              )}

              {paymentMethod === "points" && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 text-center">
                  <Coins className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm">Using Loyalty Points</p>
                  <p className="font-bold text-xl">
                    {Math.min(
                      Math.floor(pointsBalance),
                      Math.ceil(totalAmount / 0.01),
                    ).toLocaleString()}{" "}
                    points
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Remaining:{" "}
                    {(
                      pointsBalance -
                      Math.min(pointsBalance, totalAmount / 0.01)
                    ).toLocaleString()}{" "}
                    pts
                  </p>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirmPayment}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl"
              >
                Confirm & Pay
              </Button>
            </DialogFooter>
          </>
        )}

        {paymentStep === "processing" && (
          <div className="text-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600 animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mt-4">Processing Payment</h3>
            <p className="text-gray-500 text-sm mt-1">
              Please don't close this window
            </p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Payment Successful!</h3>
            <p className="text-gray-500 mt-2">
              Your charging session has been confirmed
            </p>
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                Session ID:{" "}
                <span className="font-mono font-bold">
                  EV-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
