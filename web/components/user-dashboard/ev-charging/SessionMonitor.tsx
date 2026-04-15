import React from "react"
import {
  Target,
  BatteryCharging,
  Wifi,
  TrendingUp,
  Car,
  MapPin,
  Shield,
  Award,
  Zap,
  Activity,
  Leaf,
} from "lucide-react"

interface SessionMonitorProps {
  session: any
  timeElapsed: string
  targetReached: boolean
  remainingToTarget: number
  targetProgress: number
}

const SessionMonitor: React.FC<SessionMonitorProps> = ({
  session,
  timeElapsed,
  targetReached,
  remainingToTarget,
  targetProgress,
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

  return (
    <>
      {/* Target Progress Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Energy Target</h2>
            <span className="text-xs text-gray-500 ml-auto">
              {session.targetEnergy} kWh limit
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium text-gray-900">
              {session.chargingStats.energyDelivered} / {session.targetEnergy}{" "}
              kWh
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`rounded-full h-3 transition-all duration-500 ${
                targetReached
                  ? "bg-blue-500"
                  : "bg-gradient-to-r from-green-500 to-emerald-400"
              }`}
              style={{ width: `${Math.min(100, targetProgress)}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-gray-400">0 kWh</span>
            <span className="text-gray-400">{session.targetEnergy} kWh</span>
          </div>
          {!targetReached && remainingToTarget > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              ≈{" "}
              {(
                (remainingToTarget / session.chargingStats.currentPower) *
                60
              ).toFixed(0)}{" "}
              minutes remaining
            </p>
          )}
        </div>
      </div>

      {/* Main Power Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <BatteryCharging className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Live Charging Stats
              </h2>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Wifi className="w-3 h-3" />
              <span>Live</span>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(session.chargingStats.currentPower)}
                <span className="text-lg text-gray-500"> kW</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Power</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {session.chargingStats.voltage}
                <span className="text-lg text-gray-500"> V</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Voltage</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {session.chargingStats.current}
                <span className="text-lg text-gray-500"> A</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Current</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 font-mono">
                {timeElapsed}
              </p>
              <p className="text-xs text-gray-500 mt-1">Time Elapsed</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Charging Speed</span>
              <span className="font-medium text-gray-900">
                {Math.round(session.chargingStats.currentPower)} /{" "}
                {session.chargingStats.maxPower} kW
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-full h-3 transition-all duration-500"
                style={{
                  width: `${(session.chargingStats.currentPower / session.chargingStats.maxPower) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Energy & Cost Card */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Energy Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-500">Energy Delivered</span>
              <span className="text-2xl font-bold text-gray-900">
                {session.chargingStats.energyDelivered}
                <span className="text-base text-gray-500"> kWh</span>
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-500">Session Cost</span>
              <span className="text-2xl font-bold text-gray-900">
                ETB {session.chargingStats.sessionCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-500">Rate</span>
              <span className="text-lg font-semibold text-gray-900">
                ETB {session.pricePerKwh}/kWh
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">
              Environmental Impact
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-500">CO₂ Saved</span>
              <span className="text-2xl font-bold text-gray-900">
                {session.chargingStats.carbonSaved}
                <span className="text-base text-gray-500"> kg</span>
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-500">Equivalent Trees</span>
              <span className="text-2xl font-bold text-gray-900">
                {(session.chargingStats.carbonSaved * 0.05).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-500">Gasoline Saved</span>
              <span className="text-lg font-semibold text-gray-900">
                {(session.chargingStats.energyDelivered * 0.03).toFixed(2)} gal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charging Curve */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Charging Curve</h3>
          <span className="text-xs text-gray-400 ml-auto">Power vs Time</span>
        </div>
        <div className="h-48 flex items-end gap-1">
          {[65, 72, 78, 85, 92, 88, 82, 76, 71, 68, 66, 64].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-green-400 to-emerald-500 rounded-t transition-all duration-300"
                style={{ height: `${height}%` }}
              />
              <span className="text-[10px] text-gray-400">{i + 1}m</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-gray-400">
          <span>0 min</span>
          <span>5 min</span>
          <span>10 min</span>
          <span>15 min</span>
          <span>20 min</span>
        </div>
      </div>
    </>
  )
}

export default SessionMonitor
