"use client"

import { MapPin, Navigation, Search, Filter } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { cn } from "../../../../lib/utils";
import dynamic from "next/dynamic";

const MapSection = dynamic(() => import("../../../../components/MapSection"), {
  ssr: false,
});

const mockLots = [
  {
    id: "1",
    name: "Bole Airport Parking",
    address: "Bole International Airport",
    latitude: 8.9779,
    longitude: 38.7993,
    totalSlots: 250,
    availableSlots: 90,
    distance: "1.2 km",
  },
  {
    id: "2",
    name: "Edna Mall Parking",
    address: "Bole, near Edna Mall",
    latitude: 8.9981,
    longitude: 38.787,
    totalSlots: 180,
    availableSlots: 60,
    distance: "0.8 km",
  },
  {
    id: "3",
    name: "Merkato Central Parking",
    address: "Addis Ketema, Merkato",
    latitude: 9.0333,
    longitude: 38.75,
    totalSlots: 300,
    availableSlots: 120,
    distance: "2.5 km",
  },
  {
    id: "4",
    name: "Mexico Square Parking",
    address: "Mexico Square",
    latitude: 9.0108,
    longitude: 38.7613,
    totalSlots: 140,
    availableSlots: 45,
    distance: "1.5 km",
  },
];

export default function MapView() {
  const getOccupancyRate = (total: number, available: number) => {
    return ((total - available) / total) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Map View</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            View all parking lots on the map
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search location..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Map Placeholder */}
         <div className="h-[500px]">
            <MapSection lots={mockLots} />
          </div>

          {/* Map Legend */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Low Occupancy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">High Occupancy</span>
            </div>
          </div>
        </div>

        {/* Nearby Lots List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Nearby Parking Lots</h3>
          {mockLots.map((lot) => {
            const occupancyRate = getOccupancyRate(lot.totalSlots, lot.availableSlots);
            return (
              <div
                key={lot.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    occupancyRate >= 80 ? "bg-red-100 dark:bg-red-900/30" :
                    occupancyRate >= 50 ? "bg-orange-100 dark:bg-orange-900/30" :
                    "bg-green-100 dark:bg-green-900/30"
                  )}>
                    <MapPin className={cn(
                      "h-5 w-5",
                      occupancyRate >= 80 ? "text-red-600 dark:text-red-400" :
                      occupancyRate >= 50 ? "text-orange-600 dark:text-orange-400" :
                      "text-green-600 dark:text-green-400"
                    )} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{lot.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Navigation className="h-3 w-3" />
                      {lot.address}
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Available</span>
                        <span className="font-medium">{lot.availableSlots}/{lot.totalSlots}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            occupancyRate >= 80 ? "bg-red-500" :
                            occupancyRate >= 50 ? "bg-orange-500" :
                            "bg-green-500"
                          )}
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{lot.distance} away</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Directions
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
