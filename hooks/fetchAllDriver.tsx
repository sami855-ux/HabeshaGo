import { fetchAllDriver } from "@/services/driver.api"
import { useQuery } from "@tanstack/react-query"

export const useDriversQuery = () => {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: fetchAllDriver,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // retry once on failure
  })
}
