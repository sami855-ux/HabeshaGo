import { ChargingStationsContent } from "@/components/ev/charging-stations-content"
import { Suspense } from "react";

export default function ChargingStationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChargingStationsContent />
    </Suspense>
  );
}