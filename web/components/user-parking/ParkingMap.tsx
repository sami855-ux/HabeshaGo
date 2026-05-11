import { MapPin } from "lucide-react";
import { ParkingLot } from "@/lib/type";

interface ParkingMapProps {
  lots: ParkingLot[];
  onSelectLot: (lot: ParkingLot) => void;
}

export function ParkingMap({ lots, onSelectLot }: ParkingMapProps) {
  const normalizeCoordinate = (lat: number, lng: number) => {
    const minLat = 37.77;
    const maxLat = 37.79;
    const minLng = -122.43;
    const maxLng = -122.4;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div className="h-full w-full relative bg-gradient-to-br from-blue-50 to-green-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="bg-white rounded-lg shadow-md px-4 py-2">
          <p className="text-sm font-semibold text-gray-700">
            San Francisco, CA
          </p>
          <p className="text-xs text-gray-500">Downtown Area</p>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-4xl max-h-4xl">
          {lots.map((lot) => {
            const pos = normalizeCoordinate(lot.lat, lot.lng);
            const availabilityPercent =
              (lot.availableSlots / lot.totalSlots) * 100;
            const markerColor =
              availabilityPercent > 50
                ? "bg-green-600"
                : availabilityPercent > 20
                  ? "bg-yellow-600"
                  : "bg-red-600";

            return (
              <div
                key={lot.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => onSelectLot(lot)}
              >
                <div
                  className={`${markerColor} rounded-full p-3 shadow-lg hover:scale-110 transition-transform`}
                >
                  <MapPin className="w-6 h-6 text-white" />
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-3 min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <h3 className="font-semibold text-sm mb-1">{lot.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{lot.address}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-600 font-semibold">
                      {lot.availableSlots} / {lot.totalSlots} slots
                    </span>
                    <span className="text-blue-600 font-semibold">
                      ${lot.pricePerHour}/hr
                    </span>
                  </div>
                </div>

                <div
                  className={`absolute left-1/2 -translate-x-1/2 -top-8 ${markerColor} text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap`}
                >
                  {lot.availableSlots}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-md p-3 z-10">
        <div className="flex items-center justify-around text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            <span className="text-gray-700">High Availability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
            <span className="text-gray-700">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full"></div>
            <span className="text-gray-700">Low</span>
          </div>
        </div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}
