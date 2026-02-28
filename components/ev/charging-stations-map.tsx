"use client";

import { useRef, useState } from "react";

import { MapPin, Zap, Power, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChargingStation } from "@/types/ev"
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChargingStationsMapProps {
  stations: ChargingStation[];
}

// Simple mock map component - in production, use a real map library like Leaflet or Google Maps
export function ChargingStationsMap({ stations }: ChargingStationsMapProps) {
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Mock coordinates for visualization
  const center = { lat: 40.7128, lng: -74.0060 };

  return (
    <Card className="relative h-[600px] overflow-hidden">
      {/* Mock Map Background */}
      <div 
        ref={mapRef}
        className="absolute inset-0 bg-linear-to-br from-slate-100 to-slate-200"
      >
        {/* Grid overlay to simulate map */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #ccc 1px, transparent 1px),
            linear-gradient(to bottom, #ccc 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Station Markers */}
      {stations.map((station) => (
        <button
          key={station.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
          style={{
            left: `${((station.lng - center.lng) / 10) * 50 + 50}%`,
            top: `${((center.lat - station.lat) / 10) * 50 + 50}%`,
          }}
          onClick={() => setSelectedStation(station)}
        >
          <div className={cn(
            "p-1 rounded-full transition-all group-hover:scale-110",
            station.status === "ACTIVE" ? "bg-green-500" : 
            station.status === "MAINTENANCE" ? "bg-yellow-500" : "bg-gray-500"
          )}>
            <MapPin className="h-6 w-6 text-white" />
          </div>
          
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
            <div className="bg-white rounded-lg shadow-lg p-2 whitespace-nowrap">
              <p className="font-semibold">{station.name}</p>
              <p className="text-sm text-muted-foreground">{station.city}</p>
            </div>
          </div>
        </button>
      ))}

      {/* Station Info Card */}
      {selectedStation && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <Card className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{selectedStation.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStation.address}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedStation.city}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedStation(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={cn(
                  selectedStation.status === "ACTIVE" ? "bg-green-500" : 
                  selectedStation.status === "MAINTENANCE" ? "bg-yellow-500" : "bg-gray-500"
                )}>
                  {selectedStation.status}
                </Badge>
                {selectedStation.isVerified && (
                  <Badge variant="outline" className="border-blue-500 text-blue-700">
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <Zap className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute top-4 left-4">
        <Card className="p-2">
          <div className="text-sm font-medium mb-2">Status</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs">Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-xs">Inactive</span>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
}