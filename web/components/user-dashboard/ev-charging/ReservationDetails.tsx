import React from "react"
import { Zap, Clock, MapPin } from "lucide-react"

interface ReservationDetailsProps {
  reservation: {
    stationName: string
    chargerId: string
    connectorType: string
    reservedDate: string
    reservedTime: string
    address: string
    pricePerKwh: number
    validUntil: string
  }
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({
  reservation,
}) => {
  const isReservationExpired = new Date(reservation.validUntil) < new Date()

  return (
    <div className="sticky top-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Reservation</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isReservationExpired
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {isReservationExpired ? "Expired" : "Active"}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Station */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Station
              </p>
              <p className="font-semibold text-gray-900">
                {reservation.stationName}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {reservation.chargerId} • {reservation.connectorType}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Reserved Time
              </p>
              <p className="font-semibold text-gray-900">
                {new Date(reservation.reservedDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  },
                )}{" "}
                at {reservation.reservedTime}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Location
              </p>
              <p className="text-sm text-gray-700">{reservation.address}</p>
            </div>
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Estimated rate</span>
              <span className="font-semibold text-gray-900">
                ${reservation.pricePerKwh}/kWh
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationDetails
