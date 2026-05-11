import { ArrowLeft, Car } from "lucide-react";

interface SlotSelectionProps {
  lotName: string;
  slots: any[];
  selectedSlot: any;
  onSelectSlot: (slot: any) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function SlotSelection({
  lotName,
  slots,
  selectedSlot,
  onSelectSlot,
  onBack,
  onContinue,
}: SlotSelectionProps) {

  const getSlotColor = (slot: any) => {
    if (slot.status === "OCCUPIED")
      return "bg-gray-300 cursor-not-allowed";

    if (slot.status === "RESERVED")
      return "bg-yellow-200 cursor-not-allowed";

    if (selectedSlot?.id === slot.id)
      return "bg-blue-600 text-white";

    return "bg-green-100 hover:bg-green-200 cursor-pointer";
  };

  const getSlotIcon = (type: string) => {
    switch (type) {
      case "EV":
        return "⚡";
      case "BIKE":
        return "🏍";
      case "TRUCK":
        return "🚚";
      default:
        return "🚗";
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* HEADER */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
        <button onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h2 className="font-semibold">Select Parking Slot</h2>
          <p className="text-sm text-gray-600">{lotName}</p>
        </div>
      </div>

      {/* GRID */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-4 gap-3 mb-6">

          {slots.map((slot: any) => (
            <button
              key={slot.id}
              onClick={() =>
                slot.status === "AVAILABLE" && onSelectSlot(slot)
              }
              disabled={slot.status !== "AVAILABLE"}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center transition ${getSlotColor(slot)}`}
            >
              <Car className="w-6 h-6 mb-1" />

              {/* ✅ FIXED FIELD */}
              <span className="text-sm font-semibold">
                {slot.slotNumber}
              </span>

              {/* ✅ FIXED FIELD */}
              {slot.slotType !== "CAR" && (
                <span className="text-xs mt-1">
                  {getSlotIcon(slot.slotType)}
                </span>
              )}
            </button>
          ))}

        </div>

        {/* LEGEND */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Legend</h3>

          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-green-100 rounded" />
              Available
            </div>

            <div className="flex gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded" />
              Occupied
            </div>

            <div className="flex gap-2">
              <div className="w-6 h-6 bg-yellow-200 rounded" />
              Reserved
            </div>

            <div className="flex gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded" />
              Selected
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      {selectedSlot && (
        <div className="bg-white border-t p-4">
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Continue to Booking
          </button>
        </div>
      )}
    </div>
  );
}