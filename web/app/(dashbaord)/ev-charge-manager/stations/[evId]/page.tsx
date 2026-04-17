import { SingleStationPage } from "@/components/ev/single-station-page"
import { Suspense } from "react"

export default function Page({ params }: { params: { evId: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SingleStationPage stationId={parseInt(params.evId)} />
    </Suspense>
  )
}
