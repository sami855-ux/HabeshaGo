import { useQuery } from "@tanstack/react-query"
import { getAllVehicles } from "@/services/vehicle.api"

export const useAllVehicles = (filters = {}) => {
  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: getAllVehicles,
    refetchOnWindowFocus: false,
  })
}
