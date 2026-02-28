import { NewChargingStationForm } from "@/components/ev/new-station-form"
import { NewChargingStationSkeleton } from "@/components/ev/new-station-form-skeleton"
import { Suspense } from "react";

export default function NewChargingStationPage() {
  return (
    <Suspense fallback={<NewChargingStationSkeleton/>}>
      <NewChargingStationForm />
    </Suspense>
  );
}