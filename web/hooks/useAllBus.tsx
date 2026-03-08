import { fetchAllBuses } from "@/services/bus.api"
import { useQuery } from "@tanstack/react-query"

export const useAllBuses = (filters = {}) => {
  return useQuery({
    queryKey: ["buses", filters],
    queryFn: fetchAllBuses,
    refetchOnWindowFocus: false,
  })
}
