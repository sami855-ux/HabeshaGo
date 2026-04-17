import React from "react"
import {
  Car,
  MapPin,
  Shield,
  Wifi,
  Plug,
  Award,
  BatteryCharging,
} from "lucide-react"

interface SessionControlsProps {
  session: any
  walletBalance: number
  onPauseResume: () => void
  onStop: () => void
}

const SessionControls: React.FC<SessionControlsProps> = ({
  session,
  walletBalance,
  onPauseResume,
  onStop,
}) => {
  const BatteryGauge = ({ percentage }: { percentage: number }) => (
    <div className="relative">
      <div className="w-32 h-16 bg-gray-200 rounded-t-full rounded-b-sm overflow-hidden relative">
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-emerald-400 transition-all duration-500"
          style={{ height: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-800">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <div className="w-2 h-4 bg-gray-300 rounded-r absolute -right-2 top-4" />
    </div>
  )

  const PauseIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )

  const StopIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  )

  return (
    <>
      {/* Vehicle Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Your Vehicle</h2>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-900">
                {session.vehicleInfo.model}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Battery: {session.vehicleInfo.batteryCapacity} kWh
              </p>
            </div>
            <BatteryGauge percentage={session.vehicleInfo.currentBattery} />
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Current Range</span>
              <span className="font-medium text-gray-900">
                {Math.round(session.vehicleInfo.estimatedRange)} mi
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Charger Type</span>
              <span className="font-medium text-gray-900">
                {session.connectorType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Target Energy</span>
              <span className="font-medium text-gray-900">
                {session.targetEnergy} kWh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Controls */}
      {session.status !== "completed" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Plug className="w-4 h-4 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Session Controls</h2>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <button
              onClick={onPauseResume}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                session.status === "charging"
                  ? "bg-amber-200 text-amber-700 hover:bg-amber-100 border border-amber-100"
                  : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              }`}
            >
              {session.status === "charging" ? (
                <>
                  <PauseIcon className="w-4 h-4" />
                  Pause Charging
                </>
              ) : (
                <>
                  <BatteryCharging className="w-4 h-4" />
                  Resume Charging
                </>
              )}
            </button>

            <button
              onClick={onStop}
              className="w-full py-3 rounded-xl font-medium bg-red-200 text-red-700 hover:bg-red-100 border border-red-100 transition-all flex items-center justify-center gap-2"
            >
              <StopIcon className="w-4 h-4" />
              Stop Charging
            </button>
          </div>
        </div>
      )}

      {/* Station Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Station Details</h2>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {session.stationName}
            </p>
            <p className="text-sm text-gray-500">{session.chargerId}</p>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500">{session.address}</p>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">ISO 15118</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">OCPP 2.0.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Support Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Need assistance?</p>
            <p className="text-sm text-gray-600 mt-0.5">
              24/7 support available
            </p>
            <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SessionControls
