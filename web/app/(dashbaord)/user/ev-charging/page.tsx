"use client"

import dynamic from "next/dynamic";

const EVChargingDashboard = dynamic(
  () => import("@/components/user-dashboard/ev-charging/EVChargingDashboard").then(mod => mod.EVChargingDashboard),
  { ssr: false }
);

export default function Page() {
  return <EVChargingDashboard />;
}