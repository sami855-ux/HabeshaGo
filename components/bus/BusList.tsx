"use client";

import { useState, useMemo } from "react";
import {
  Bus,
  Users,
  MapPin,
  ChevronDown,
  ArrowRight,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { selectBus } from "@/store/slices/bus.Slice";

export function BusList() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { buses } = useSelector((state: RootState) => state.bus);

  const [expandedBus, setExpandedBus] = useState<number | null>(null);

  // Map buses for UI
  const uiBuses = useMemo(() => {
    return buses.map((bus: any) => {
      const routePoints = [
        bus.route?.origin,
        ...(bus.route?.midPoints?.map((p: any) => p.name) ?? []),
        bus.route?.destination,
      ].filter(Boolean);

      return {
        id: bus.id,
        operator: bus.driver?.name ?? "Verified Operator",
        busNumber: bus.busNumber,
        departure: bus.departureTime || "08:00",
        arrival: bus.arrivalTime || "13:00",
        duration: "5h",
        availableSeats: bus.capacity,
        rating: 4.3,
        routePoints,
      };
    });
  }, [buses]);

  // Handle "Book Now" click → go to BookingForm page
  const handleBookNow = (bus: any) => {
    // Optionally save selected bus in Redux
    dispatch(selectBus(bus));
    router.push(`/user/booking/${bus.id}`);
  };

  return (
    <div className="space-y-4">
      {uiBuses.map((bus) => {
        const origin = bus.routePoints[0];
        const destination = bus.routePoints[bus.routePoints.length - 1];

        return (
          <Card key={bus.id} className="border border-border/50">
            <CardContent className="p-6 space-y-4">
              {/* HEADER */}
              <div className="flex items-center gap-3">
                <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Bus className="size-6 text-primary" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold">{bus.operator}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{bus.busNumber}</Badge>
                    <Badge className="bg-green-600">Verified</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <Star className="size-4 text-yellow-500" />
                  {bus.rating}
                </div>
              </div>

              {/* ROUTE */}
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                <span className="font-medium">{origin}</span>
                <ArrowRight className="size-4 text-muted-foreground" />
                <span className="font-medium">{destination}</span>
              </div>

              {/* META */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {bus.departure} → {bus.arrival}
                </span>
                <span>{bus.duration}</span>
                <span className="flex items-center gap-1">
                  <Users className="size-4" />
                  {bus.availableSeats} seats
                </span>
              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/user/route/${bus.route?.id || bus.id}`)
                  }
                >
                  View Details
                  <ChevronDown
                    className={cn(
                      "ml-2 size-4 transition-transform",
                      expandedBus === bus.id && "rotate-180"
                    )}
                  />
                </Button>

                <Button onClick={() => handleBookNow(bus)}>Book Now</Button>
              </div>

              {/* DETAILS */}
              {expandedBus === bus.id && (
                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MapPin className="size-4" />
                    Route Stops
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {bus.routePoints.map((p, i) => (
                      <Badge key={i} variant="outline">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
