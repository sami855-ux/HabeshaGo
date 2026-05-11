"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeView } from "@/components/user-parking/QRCodeView";
import { useDispatch } from "react-redux";
import { checkInReservation } from "@/store/slices/parkingUserSlice";

export default function QRCodePage() {
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId");
  const lotId = searchParams.get("lotId");
  const slotId = searchParams.get("slotId");

  if (!bookingId || !lotId || !slotId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <p className="text-gray-700 dark:text-gray-300">Invalid QR data</p>
      </div>
    );
  }

  const handleStartSession = async () => {
    try {
      const res = await dispatch(checkInReservation(bookingId)).unwrap();

      const sessionId = res?.id;

      if (!sessionId) {
        throw new Error("Session not created");
      }

      router.push(`/user/parking/session/active?sessionId=${sessionId}`);
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-zinc-950">
      <QRCodeView
        bookingId={bookingId}
        lotName="Parking Lot"
        slotNumber={slotId}
        onBack={() =>
          router.push(
            `/user/parking/booking/confirm?lotId=${lotId}&slotId=${slotId}`,
          )
        }
        onStartSession={handleStartSession}
      />
    </div>
  );
}
