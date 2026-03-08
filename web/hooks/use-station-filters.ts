import { ChargingStation } from "@/types/ev"
import { useState, useMemo } from "react";

interface Filters {
  status: string;
  city: string;
  search: string;
}

export function useStationFilters(stations: ChargingStation[]) {
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    city: "all",
    search: "",
  });

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      // Filter by status
      if (filters.status !== "all" && station.status !== filters.status) {
        return false;
      }

      // Filter by city
      if (filters.city !== "all" && station.city !== filters.city) {
        return false;
      }

      // Search by name
      if (filters.search && !station.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [stations, filters]);

  return {
    filters,
    setFilters,
    filteredStations,
  };
}