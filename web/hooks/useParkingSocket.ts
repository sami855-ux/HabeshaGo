"use client";

import { useEffect } from "react";
import { connectSocket } from "@/services/index";
import { useDispatch } from "react-redux";

import { reservationRealtime } from "@/store/slices/parkingUserSlice";
import { updateSlotRealtime } from "@/store/slices/parkingAdminSlice";

export default function useSocket(userId, lotId) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const socket = connectSocket(userId);

    // ✅ NEW: join parking lot
    if (lotId) {
      socket.emit("joinParkingLot", lotId);
    }

    // =============================
    // 🔥 USER EVENTS
    // =============================
    socket.on("parking:reservation:created", (data) => {
      dispatch(reservationRealtime(data));
    });

    // =============================
    // 🔥 SLOT REALTIME
    // =============================
    socket.on("parking:slot:update", (data) => {
      dispatch(updateSlotRealtime(data));
    });

    // =============================
    // CLEANUP
    // =============================
    return () => {
      if (lotId) {
        socket.emit("leaveParkingLot", lotId);
      }

      socket.off("parking:reservation:created");
      socket.off("parking:slot:update");

      socket.disconnect();
    };
  }, [userId, lotId, dispatch]);
}
