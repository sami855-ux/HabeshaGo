"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Armchair, Crown, CheckCircle } from "lucide-react";

interface Seat {
  id: string;
  number: string;
  type: "standard" | "premium" | "disabled";
  price: number;
}

interface BookingData {
  seats: Seat[];
  totalPrice: number;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [serviceFee, setServiceFee] = useState(49);
  const [discountPerSeat, setDiscountPerSeat] = useState(20);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    const tempBooking = localStorage.getItem("tempBooking");
    if (tempBooking) {
      setBooking(JSON.parse(tempBooking));
    } else {
      // If no booking data, redirect back to bus selection
      router.push("/user/bus");
    }
  }, [router]);

  if (!booking) {
    return <p className="text-center mt-10">Loading booking data...</p>;
  }

  const { seats, totalPrice } = booking;
  const discount = seats.length * discountPerSeat;
  const finalPrice = totalPrice + serviceFee - discount;

  const handleConfirmPayment = () => {
    // Here you can push the data to your backend
    // For now, just simulate success
    setPaymentConfirmed(true);

    // Optional: Clear temporary booking
    localStorage.removeItem("tempBooking");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Payment Summary</h1>

      {paymentConfirmed && (
        <Card className="mb-6 border-green-500 border-2">
          <CardContent className="flex items-center gap-3 text-green-600">
            <CheckCircle className="size-6" />
            <span>Payment Successful!</span>
          </CardContent>
        </Card>
      )}

      {/* Selected Seats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Selected Seats ({seats.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {seats.map((seat) => (
            <div
              key={seat.id}
              className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Armchair className="size-5" />
                <span>Seat {seat.number}</span>
                {seat.type === "premium" && (
                  <Crown className="size-4 text-yellow-500" />
                )}
              </div>
              <span className="font-bold">ETB {seat.price}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Fare Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Fare Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Base Fare</span>
            <span>ETB {totalPrice}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee</span>
            <span>ETB {serviceFee}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-ETB {discount}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>ETB {finalPrice}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 flex-1"
          onClick={handleConfirmPayment}
          disabled={paymentConfirmed}
        >
          {paymentConfirmed ? "Paid" : "Confirm Payment"}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/user/bus")}
          disabled={paymentConfirmed}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
