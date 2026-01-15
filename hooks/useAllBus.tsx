import { fetchAllBuses } from "@/services/bus.api"
import { useQuery } from "@tanstack/react-query"
import { Bus } from "@/types/bus"

export const useAllBuses = (filters = {}) => {
  return useQuery({
    queryKey: ["buses", filters],
    queryFn: async () => {
      const response = await fetchAllBuses(filters)

      // Return only non-deleted buses, similar to your previous filter
      return response.data.filter((bus: Bus) => !bus.isDeleted)
    },
    refetchOnWindowFocus: false,
  })
}
