import { useEffect, useRef, useState, useCallback } from "react"
import { getSocket } from "@/services/socket"
import { Bus } from "@/types/map-user"
import { axiosInstance } from "@/services/axiosInstance"

type UseSocketProps = {
  vehicleIds: number[]
}

export function useSocket({ vehicleIds }: UseSocketProps) {
  const [buses, setBuses] = useState<Map<number, Bus>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const joinedRef = useRef(false)
  // store bus details keyed by vehicleId for quick lookup
  const busDetailsRef = useRef<Map<number, BusDetail>>(new Map())

  // fetch bus details from API
  useEffect(() => {
    if (vehicleIds.length === 0) return

    const fetchBusDetails = async () => {
      try {
        console.log("Fetching bus details for vehicleIds:", vehicleIds)
        const { data } = await axiosInstance.get("/buses/by-vehicle-ids", {
          params: { vehicleIds: vehicleIds.join(",") },
        })

        const detailMap = new Map<number, BusDetail>()
        data.data.forEach((bus: BusDetail) => {
          if (bus.vehicleId) {
            detailMap.set(bus.vehicleId, bus)
          }
        })
        busDetailsRef.current = detailMap
        console.log(
          "Bus details map built:",
          Object.fromEntries(detailMap), // converts Map → plain object so console shows contents
        )

        // if we already have locations, merge details in
        setBuses((prev) => {
          if (prev.size === 0) return prev
          const next = new Map(prev)
          next.forEach((bus, vehicleId) => {
            const detail = detailMap.get(vehicleId)
            if (detail) {
              next.set(vehicleId, { ...bus, ...mapDetailToBus(detail) })
            }
          })
          return next
        })
      } catch (err) {
        console.error("Failed to fetch bus details", err)
      }
    }

    fetchBusDetails()
  }, [vehicleIds])

  // ─── socket
  const joinMap = useCallback(() => {
    if (joinedRef.current || vehicleIds.length === 0) return
    const socket = getSocket()
    socket.emit("joinMap", vehicleIds)
    joinedRef.current = true
  }, [vehicleIds])

  useEffect(() => {
    if (vehicleIds.length === 0) return

    const socket = getSocket()
    socket.connect()

    socket.on("connect", () => {
      setIsConnected(true)
      console.log("Socket connected")
      joinMap()
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
      joinedRef.current = false
      console.log("Socket disconnected")
    })

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message)
    })

    // map:init
    socket.on("map:init", (locations: VehicleLocation[]) => {
      console.log("map:init received:", locations)

      console.log(
        "Current busDetailsRef:",
        Object.fromEntries(busDetailsRef.current),
      )

      const map = new Map<number, Bus>()

      locations.forEach((loc) => {
        console.log(
          "Trying to get detail for vehicleId:",
          loc.vehicleId,
          "type:",
          typeof loc.vehicleId,
        )

        const detail = busDetailsRef.current.get(Number(loc.vehicleId))

        console.log("Found detail:", detail)

        const mappedBus = mapLocationToBus(loc, detail)

        console.log("Mapped bus:", mappedBus)

        map.set(Number(loc.vehicleId), mappedBus)
      })

      console.log("Final buses map:", Array.from(map.entries()))

      setBuses(new Map(map))
    })

    // map:vehicleUpdate
    socket.on("map:vehicleUpdate", (loc: VehicleLocation) => {
      setBuses((prev) => {
        const next = new Map(prev)
        const detail = busDetailsRef.current.get(loc.vehicleId)
        // if bus already exists, preserve its details
        const existing = prev.get(loc.vehicleId)
        next.set(loc.vehicleId, {
          ...(existing ?? mapLocationToBus(loc, detail)),
          // always update live fields
          location: { lat: loc.lat, lng: loc.lng },
          speed: loc.speed,
          heading: loc.heading,
          accuracy: loc.accuracy,
          timestamp: loc.timestamp,
        })
        return next
      })
    })

    socket.on("map:error", (err: { message: string }) => {
      console.error("Map socket error:", err.message)
    })

    if (socket.connected) joinMap()

    return () => {
      socket.emit("leaveMap")
      joinedRef.current = false
      socket.off("connect")
      socket.off("disconnect")
      socket.off("connect_error")
      socket.off("map:init")
      socket.off("map:vehicleUpdate")
      socket.off("map:error")
      socket.disconnect()
    }
  }, [vehicleIds, joinMap])

  useEffect(() => {
    console.log(
      "Current buses state:",
      Array.from(buses.entries()).map(([id, bus]) => ({
        vehicleId: id,
        ...bus,
      })),
    )
  }, [buses])

  return { buses: Array.from(buses.values()), isConnected }
}

// types

type VehicleLocation = {
  vehicleId: number
  lat: number
  lng: number
  speed: number | null
  heading: number | null
  accuracy: number | null
  timestamp: string
}

type BusDetail = {
  id: number
  busNumber: string
  capacity: number
  status: string
  driverId: string | null
  routeId: number | null
  averageRating: number
  totalRatings: number
  currentStop: string | null
  nextDestination: string | null
  isActive: boolean
  departureTime: string | null
  estimatedArrival: number | null
  delayMinutes: number
  lastServiceDate: string | null
  nextServiceDate: string | null
  vehicleId: number | null
  driver: { id: string; name: string } | null
  route: { id: number; name: string } | null
}

// mappers

const mapLocationToBus = (loc: VehicleLocation, detail?: BusDetail): Bus => ({
  // ─── required, always from location ──────────────────────────────────────
  id: String(loc.vehicleId),
  location: {
    lat: loc.lat,
    lng: loc.lng,
  },
  speed: loc.speed,
  heading: loc.heading,
  accuracy: loc.accuracy,
  timestamp: loc.timestamp,

  // ─── from bus detail, fallback to null if not loaded yet ─────────────────
  busNumber: detail?.busNumber ?? null,
  capacity: detail?.capacity ?? null,
  status: detail?.status ?? null,
  averageRating: detail?.averageRating ?? null,
  totalRatings: detail?.totalRatings ?? null,
  currentStop: detail?.currentStop ?? null,
  nextDestination: detail?.nextDestination ?? null,
  isActive: detail?.isActive ?? null,
  departureTime: detail?.departureTime ?? null,
  estimatedArrival: detail?.estimatedArrival ?? null,
  delayMinutes: detail?.delayMinutes ?? null,
  driverName: detail?.driver?.user?.name ?? "Samuel tale",
  driverId: detail?.driver?.id,
  routeName: detail?.route?.name ?? null,
})

const mapDetailToBus = (detail: BusDetail): Partial<Bus> => ({
  busNumber: detail.busNumber,
  capacity: detail.capacity,
  status: detail.status,
  averageRating: detail.averageRating,
  totalRatings: detail.totalRatings,
  currentStop: detail.currentStop,
  nextDestination: detail.nextDestination,
  isActive: detail.isActive,
  departureTime: detail.departureTime,
  estimatedArrival: detail.estimatedArrival,
  delayMinutes: detail.delayMinutes,
  driverName: detail.driver?.name ?? null,
  routeName: detail.route?.name ?? null,
})
