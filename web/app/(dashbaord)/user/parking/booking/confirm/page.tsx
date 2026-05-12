"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import { BookingConfirmation } from "@/components/user-parking/BookingConfirm";

import {
  fetchParkingLots,
  fetchAvailableSlots,
  createReservation,
} from "@/store/slices/parkingUserSlice";

export default function BookingConfirmPage() {
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const searchParams = useSearchParams();

  const lotId = searchParams.get("lotId");
  const slotId = searchParams.get("slotId");

  const { lots, slots } = useSelector((state: any) => state.parkingUser);

  // ✅ LOAD DATA
  useEffect(() => {
    dispatch(fetchParkingLots());

    if (lotId) {
      dispatch(fetchAvailableSlots(lotId));
    }
  }, [dispatch, lotId]);

  const lot = lots.find((l: any) => l.id === lotId);
  const slot = slots.find((s: any) => s.id === slotId);

  if (!lot || !slot) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Invalid booking details</p>
      </div>
    );
  }

  // ✅ REAL BOOKING (API)
  const handleConfirm = async () => {
    try {
      const res = await dispatch(createReservation({ lotId, slotId })).unwrap();

      console.log("RES:", res);

      const bookingId = res.id;

      if (!bookingId) throw new Error("No booking ID");

      router.push(
        `/user/parking/booking/qr?bookingId=${bookingId}&lotId=${lotId}&slotId=${slotId}`,
      );
    } catch (err: any) {
      console.error(err);
      alert("Booking failed. Check console.");
    }
  };

  return (
    <BookingConfirmation
      lotName={lot.name}
      lotAddress={lot.address || "Unknown"}
      slotNumber={slot.slotNumber}
      pricePerHour={lot.pricePerMinute || 0}
      onBack={() => router.push(`/user/parking/${lotId}`)}
      onConfirm={handleConfirm}
    />
  );
}