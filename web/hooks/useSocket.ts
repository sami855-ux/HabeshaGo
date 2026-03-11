import { useEffect, useState } from "react"
import { getSocket } from "@/services/socket"
import { Bus } from "@/types/map-user"

export function useSocket() {
  const [buses, setBuses] = useState<Bus[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socket = getSocket()

    socket.connect()

    socket.on("connect", () => {
      setIsConnected(true)
      console.log("Socket connected")
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
      console.log("Socket disconnected")
    })

    socket.on("buses:update", (updatedBuses: Bus[]) => {
      setBuses(updatedBuses)
    })

    socket.on("bus:movement", (busUpdate: Bus) => {
      setBuses((prev) => {
        const index = prev.findIndex((b) => b.id === busUpdate.id)
        if (index === -1) {
          return [...prev, busUpdate]
        }
        const updated = [...prev]
        updated[index] = busUpdate
        return updated
      })
    })

    return () => {
      socket.off("buses:update")
      socket.off("bus:movement")
      socket.disconnect()
    }
  }, [])

  return { buses, isConnected }
}
