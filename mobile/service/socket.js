import { io, Socket } from "socket.io-client"

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io("https://habeshago-pro-v1.onrender.com", {
      transports: ["websocket"],
      autoConnect: false,
    })
  }
  return socket
}
