import { axiosInstance } from "./axiosInstance"

export const getReservationById = async (id: number | null) => {
  try {
    const res = await axiosInstance.get(`/ev/reservation/${id}`)

    return res.data?.data
  } catch (error: any) {
    console.error("Error fetching reservation:", error)

    throw new Error(
      error?.response?.data?.message || "Failed to fetch reservation",
    )
  }
}
export const verifyChargerCode = async (payload: {
  code: string
  stationId?: number
}) => {
  try {
    console.log("🔍 Verifying charger with payload:", payload)

    const response = await axiosInstance.post("/ev/reservation/verify", payload)

    console.log("✅ Charger verification response:", response.data)

    return response.data
  } catch (error: any) {
    console.error(
      "❌ Charger verification error:",
      error?.response?.data || error?.message,
    )
    throw new Error(error?.response?.data?.message || "Verification failed")
  }
}
