import { redis } from "../config/redis.js"
import prisma from "../prisma/client.js"

// Key pattern helper
const latestVehicleKey = (vehicleId) => `vehicle:latest:${vehicleId}`
export const vehicleExistsKey = (vehicleId) => `vehicle:exists:${vehicleId}`
// Save latest location
export const setLatestVehicleLocation = async (
  vehicleId,
  location,
  expireSec = 300,
) => {
  try {
    const payload = {
      vehicleId: location.vehicleId,
      lat: location.lat,
      lng: location.lng,
      speed: location.speed,
      heading: location.heading,
      accuracy: location.accuracy,
      timestamp: location.createdAt,
    }

    await redis.set(latestVehicleKey(vehicleId), JSON.stringify(payload), {
      ex: expireSec,
    })
  } catch (error) {
    console.error(`Failed to save latest vehicle ${vehicleId} in Redis`, error)
  }
}

// Get latest location
export const getLatestVehicleLocation = async (vehicleId) => {
  try {
    const key = latestVehicleKey(vehicleId)

    // ─── 1. Try Redis first ─────────────────────────────
    const data = await redis.get(key)

    if (data) {
      if (typeof data === "string") {
        try {
          return JSON.parse(data)
        } catch (err) {
          console.warn(`Invalid JSON in Redis for vehicle ${vehicleId}`, data)

          return null
        }
      }

      return data
    }

    //  2. Redis miss → fallback to database 
    console.log(`Redis miss for vehicle ${vehicleId}, fetching from DB`)

    const latestLocation = await prisma.vehicleLocation.findFirst({
      where: {
        vehicleId: Number(vehicleId),
      },
      orderBy: {
        recordedAt: "desc",
      },
    })

    // no location in DB
    if (!latestLocation) {
      console.log(`No DB location found for vehicle ${vehicleId}`)

      return null
    }

    // ─── 3. Transform to expected socket format ─────────
    const formattedLocation = {
      vehicleId: latestLocation.vehicleId,
      lat: latestLocation.lat,
      lng: latestLocation.lng,
      speed: latestLocation.speed,
      heading: latestLocation.heading,
      accuracy: latestLocation.accuracy,
      timestamp: latestLocation.recordedAt,
    }

    // ─── 4. Repopulate Redis cache ──────────────────────
    await redis.set(key, JSON.stringify(formattedLocation))

    console.log(
      `Loaded location from DB and cached in Redis`,
      formattedLocation,
    )

    return formattedLocation
  } catch (error) {
    console.error(`Failed to fetch latest vehicle ${vehicleId}`, error)

    return null
  }
}

// Optional: delete location (e.g., Vehicle decommissioned or removed)
export const deleteLatestVehicleLocation = async (vehicleId) => {
  try {
    await redis.del(latestVehicleKey(vehicleId))
  } catch (error) {
    console.error(`Failed to delete vehicle ${vehicleId} from Redis`, error)
  }
}

export const clearAllVehicleCache = async () => {
  try {
    // get all keys matching pattern
    const keys = await redis.keys("vehicle:latest:*")

    if (keys.length === 0) return

    // delete all keys
    await redis.del(keys)

    console.log(`Cleared ${keys.length} vehicle caches`)
  } catch (error) {
    console.error("Failed to clear vehicle caches", error)
  }
}

export const checkVehicleExists = async (vehicleId) => {
  try {
    // 1. check Redis cache first
    const cached = await redis.get(vehicleExistsKey(vehicleId))
    if (cached !== null) return true

    // 2. not cached — hit DB once
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    })

    if (!vehicle) return false

    // 3. cache result for 24 hours so DB is never hit again for this vehicle
    await redis.set(vehicleExistsKey(vehicleId), 1, { ex: 86400 })
    return true
  } catch (error) {
    console.error(`Failed to check vehicle existence for ${vehicleId}`, error)
    // fail open — if Redis/DB is down, let the request through
    return true
  }
}

// const testVehicleRedis = async () => {
//   clearAllVehicleCache()
// }

// // Run test
// testVehicleRedis()
