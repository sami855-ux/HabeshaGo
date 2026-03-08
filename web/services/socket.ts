import { io, Socket } from "socket.io-client"

// Replace with your actual backend URL
const SOCKET_URL = "http://localhost:5000"

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
  withCredentials: true,
})
