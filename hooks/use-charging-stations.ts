import { getEVStations } from "@/services/ev.api"
import { useQuery } from "@tanstack/react-query"

export function useChargingStations() {
  return useQuery({
    queryKey: ["charging-stations"],
    queryFn: getEVStations,
  });
}