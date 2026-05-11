import { ArrowLeft, MapPin, Clock, DollarSign, Car } from "lucide-react";

interface BookingConfirmationProps {
  lotName: string;
  lotAddress: string;
  slotNumber: string;
  pricePerHour: number;
  onBack: () => void;
  onConfirm: () => void;
}

export function BookingConfirmation({
  lotName,
  lotAddress,
  slotNumber,
  pricePerHour,
  onBack,
  onConfirm,
}: BookingConfirmationProps) {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950 text-gray-900 dark:text-white">
      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold">Confirm Booking</h2>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4 mb-4">
          <h3 className="font-semibold mb-3">Booking Details</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">{lotName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lotAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium">Slot {slotNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium">Start Time</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upon QR Code Scan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium">${pricePerHour}/hour</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Billed per minute
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            How it works
          </h4>

          <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <li className="flex gap-2">
              <span className="font-semibold">1.</span>
              <span>Reserve your slot and get a QR code</span>
            </li>

            <li className="flex gap-2">
              <span className="font-semibold">2.</span>
              <span>
                Scan the QR code at the parking lot to start your session
              </span>
            </li>

            <li className="flex gap-2">
              <span className="font-semibold">3.</span>
              <span>
                End your session when leaving and pay from your wallet
              </span>
            </li>
          </ol>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 p-4">
        <button
          onClick={onConfirm}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Reserve Slot & Get QR Code
        </button>
      </div>
    </div>
  );
}
