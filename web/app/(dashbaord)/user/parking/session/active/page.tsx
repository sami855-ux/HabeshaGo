"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";

import { ActiveSession } from "@/components/user-parking/ActiveSession";
import {
  fetchMySessions,
  checkOutReservation,
} from "@/store/slices/parkingUserSlice";

export default function ActiveSessionPage() {
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("sessionId");

  const { sessions, loading } = useSelector((state: any) => state.parkingUser);

  useEffect(() => {
    dispatch(fetchMySessions());
  }, [dispatch]);

  const session = useMemo(() => {
    return sessions.find((s: any) => s.id === sessionId);
  }, [sessions, sessionId]);

  if (loading || !session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <p className="text-gray-700 dark:text-gray-300">Loading session...</p>
      </div>
    );
  }

  const handleEndSession = async () => {
    try {
      await dispatch(
        checkOutReservation(session.parkingReservationId),
      ).unwrap();

      router.push(`/user/parking/checkout?sessionId=${session.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-zinc-950">
      <ActiveSession
        lotName={session.slot.parkingLot.name}
        lotAddress={session.slot.parkingLot.address}
        slotNumber={session.slot.slotNumber}
        pricePerHour={session.slot.parkingLot.pricePerMinute * 60}
        startTime={session.entryTime}
        onEndSession={handleEndSession}
      />
    </div>
  );
}
