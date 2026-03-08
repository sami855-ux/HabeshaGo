import { useQuery } from "@tanstack/react-query"
import { getAllMidpoints } from "@/services/bus.api"

/**
 * Custom hook to fetch all midpoints
 * Returns data, loading state, and error state
 */
export const useGetAllMidpoints = () => {
  return useQuery<string[], Error>({
    queryKey: ["all_midpoints"],
    queryFn: getAllMidpoints,
  })
}
