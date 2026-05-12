import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId) => {
  socket = io("http://localhost:5000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);

    // Join user room
    socket.emit("joinUserNotification", userId);
  });

  return socket;
};

export const getSocket = () => socket;