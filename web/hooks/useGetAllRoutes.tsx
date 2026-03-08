import { fetchAllRoutes } from "@/services/route.api"
import { useQuery } from "@tanstack/react-query"

export const useAllRoutesQuery = () => {
  return useQuery({
    queryKey: ["routes"],
    queryFn: fetchAllRoutes,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // retry once on failure
  })
}
