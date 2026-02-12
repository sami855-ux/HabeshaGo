import { redis } from "../config/redis.js"

// Key pattern helper
const latestVehicleKey = (vehicleId) => `vehicle:latest:${vehicleId}`

// Save latest location
export const setLatestVehicleLocation = async (
  vehicleId,
  location,
  expireSec = 300,
) => {
  try {
    const res = await redis.set(
      latestVehicleKey(vehicleId),
      JSON.stringify(location),
      {
        ex: expireSec,
      },
    )
  } catch (error) {
    console.error(`Failed to save latest vehicle ${vehicleId} in Redis`, error)
  }
}

// Get latest location
export const getLatestVehicleLocation = async (vehicleId) => {
  try {
    const data = await redis.get(latestVehicleKey(vehicleId))

    if (!data) return null

    // if Redis returned a string, parse it; if already object, use as-is
    if (typeof data === "string") {
      try {
        return JSON.parse(data)
      } catch (err) {
        console.warn(
          `Invalid JSON in Redis for vehicle ${vehicleId}, returning raw value`,
          data,
        )
        return data
      }
    }

    return data
  } catch (error) {
    console.error(
      `Failed to fetch latest vehicle ${vehicleId} from Redis`,
      error,
    )
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

// const testVehicleRedis = async () => {
//   clearAllVehicleCache()
// }

// // Run test
// testVehicleRedis()
