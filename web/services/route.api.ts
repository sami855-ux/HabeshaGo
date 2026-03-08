import { axiosInstance } from "./axiosInstance"
import { Route, CreateRouteDto, UpdateRouteDto } from "@/types/route"

// Fetch all routes
export const fetchAllRoutes = async () => {
  try {
    const response = await axiosInstance.get("/route")
    // response.data will have { success, message, data }
    console.log("Route data", response.data)
    return response.data
  } catch (error: any) {
    console.error("Error fetching routes:", error)
    return {
      success: false,
      message: "Failed to fetch routes",
      error: error.message,
    }
  }
}

// Create a new route
export const createRoute = async (routeData: CreateRouteDto) => {
  try {
    const response = await axiosInstance.post("/route", routeData)
    return response.data
  } catch (error: any) {
    console.error("Error creating route:", error)
    return {
      success: false,
      message: "Failed to create route",
      error: error.message,
    }
  }
}

// Update an existing route by ID
export const updateRoute = async (id: string, routeData: UpdateRouteDto) => {
  try {
    const response = await axiosInstance.put(`/route/${id}`, routeData)
    return response.data
  } catch (error: any) {
    console.error("Error updating route:", error)
    return {
      success: false,
      message: "Failed to update route",
      error: error.message,
    }
  }
}

export const getRouteStats = async () => {
  try {
    const response = await axiosInstance.get("/route/stats")
    return response.data.data
  } catch (error: any) {
    console.error("Error fetching route stats:", error)
    return {
      success: false,
      message: "Failed to fetch route stats",
      error: error.message,
    }
  }
}

export const fetchAllRoutesSimple = async () => {
  try {
    const response = await axiosInstance.get("/route")

    return response.data.data.map((route: any) => ({
      id: route.id,
      name: route.name,
      origin: route.origin,
      destination: route.destination,
      distanceKm: route.distanceKm ?? 0,
      estimatedTimeMin: route.estimatedTimeMin ?? 0,

      // NEW: convert midPoints -> stops
      stops:
        route.midPoints
          ?.sort((a: any, b: any) => a.order - b.order)
          .map((point: any) => point.name) ?? [],
    }))
  } catch (error: any) {
    console.error("Error fetching routes:", error)

    return {
      success: false,
      message: "Failed to fetch routes",
      error: error.message,
    }
  }
}


export const getRouteById = async (routeId: string) => {
  try {
    const res = await axiosInstance.get(`/route/${routeId}`)

    if (res.data.success) {
      return res.data.data
    } else {
      return {}
    }
  } catch (error) {
    console.error("Error fetching routes:", error)

    return {}
  }
}
