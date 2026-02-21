import { io } from "socket.io-client"

// Replace with your actual backend URL
const SOCKET_URL = "https://habeshago-v1.onrender.com"

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  withCredentials: true,
})
