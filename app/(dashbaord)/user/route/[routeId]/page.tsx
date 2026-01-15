"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/index";
import { fetchRoutes } from "@/store/slices/routeslice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RouteListPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { routes, loading, error } = useSelector(
    (state: RootState) => state.route
  );

  useEffect(() => {
    dispatch(fetchRoutes());
  }, [dispatch]);

  if (loading) return <p className="text-center mt-10">Loading routes...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Bus Routes</h1>

      {routes.map((route) => (
        <Card key={route.id} className="p-4 flex justify-between items-center">
          <div>
            <h2 className="font-semibold">{route.name}</h2>
            <p>
              {route.origin} → {route.destination} ({route.distanceKm} km,{" "}
              {route.estimatedTimeMin} min)
            </p>

            {/* ✅ Use optional chaining and route.midPoints */}
            {route.midPoints?.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Midpoints: {route.midPoints.map((mp) => mp.name).join(", ")}
              </p>
            )}
          </div>

          <Button onClick={() => alert(`Track route ${route.name} on map!`)}>
            Track Route
          </Button>
        </Card>
      ))}
    </div>
  );
}
