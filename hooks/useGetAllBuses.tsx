import { fetchAllBuses } from "@/services/bus.api"
import { useQuery } from "@tanstack/react-query"

export const useAllBusesQuery = () => {
  return useQuery({
    queryKey: ["all_buses"],
    queryFn: fetchAllBuses,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // retry once on failure
  })
}
