"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connectSocket } from "@/services/socket";
import { initSocketListeners } from "@/services/socketListner";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = connectSocket();

    initSocketListeners(dispatch);

    return () => {
      socket.disconnect();
    };
  }, []);

  return <>{children}</>;
}
