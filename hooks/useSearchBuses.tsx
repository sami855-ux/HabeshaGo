import { searchBuses } from "@/service/bus"
import { useQuery } from "@tanstack/react-query"

export const useSearchBuses = (start: string, end: string) => {
  return useQuery({
    queryKey: ["buses", start, end],
    queryFn: () => searchBuses(start, end),
    enabled: false,
  })
}
