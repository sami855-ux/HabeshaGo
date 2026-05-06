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
