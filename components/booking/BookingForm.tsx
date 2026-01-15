"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBookingThunk } from "@/store/slices/booking.Slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RootState } from "@/store/index";
import { useRouter } from "next/navigation";

interface BookingFormProps {
  userId: string;
  busId: number;
  availableSeats: number[];
}

export default function BookingForm({
  userId,
  busId,
  availableSeats,
}: BookingFormProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, booking, error } = useSelector(
    (state: RootState) => state.booking
  );

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [payNow, setPayNow] = useState(true); // default wallet payment

  const toggleSeat = (seat: number) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return alert("Select at least one seat");

    const result: any = await dispatch(
      createBookingThunk({ userId, busId, seatNumbers: selectedSeats, payNow })
    );

    if (result.payload?.id) {
      // redirect to Payment Success page
      router.push(
        `/payment/success?bookingId=${result.payload.id}&transactionId=${
          result.payload.paymentId
        }&total=${result.payload.amount}&from=${result.payload.from}&to=${
          result.payload.to
        }&date=${result.payload.date}&time=${
          result.payload.time
        }&seats=${selectedSeats.join(",")}`
      );
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Select Seats</h2>
      <div className="grid grid-cols-8 gap-2">
        {availableSeats.map((seat) => (
          <Button
            key={seat}
            variant={selectedSeats.includes(seat) ? "default" : "outline"}
            onClick={() => toggleSeat(seat)}
          >
            {seat}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Input
          type="checkbox"
          checked={payNow}
          onChange={(e) => setPayNow(e.target.checked)}
        />
        <span>Pay Now using Wallet</span>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <Button
        onClick={handleBooking}
        disabled={loading || selectedSeats.length === 0}
      >
        {loading ? "Booking..." : `Book ${selectedSeats.length} Seat(s)`}
      </Button>
    </div>
  );
}
