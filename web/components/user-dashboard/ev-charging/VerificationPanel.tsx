import React, { useState } from "react"
import {
  QrCode,
  Key,
  Loader2,
  CheckCircle,
  AlertCircle,
  BatteryCharging,
  Smartphone,
  Plug,
} from "lucide-react"

interface VerificationPanelProps {
  reservation: any
  isReservationExpired: boolean
  isVerified: boolean
  onVerificationSuccess: (method: "qr" | "manual") => void
  onStartCharging: () => void
  onBack: () => void
}

const VerificationPanel: React.FC<VerificationPanelProps> = ({
  reservation,
  isReservationExpired,
  isVerified,
  onVerificationSuccess,
  onStartCharging,
  onBack,
}) => {
  const [verificationMethod, setVerificationMethod] = useState<
    "qr" | "manual" | null
  >(null)
  const [manualCode, setManualCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const handleVerifyQR = async () => {
    setIsVerifying(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsVerifying(false)
    onVerificationSuccess("qr")
  }

  const handleVerifyManual = async () => {
    if (!manualCode.trim()) return
    setIsVerifying(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsVerifying(false)
    onVerificationSuccess("manual")
  }

  const handleStartChargingClick = () => {
    setIsStarting(true)
    onStartCharging()
  }

  if (isReservationExpired) {
    return (
      <div className="mb-6 p-5 bg-amber-50 rounded-2xl border border-amber-100">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">Reservation expired</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your reservation window has passed. Please create a new
              reservation to charge.
            </p>
            <button
              onClick={onBack}
              className="mt-3 text-sm font-medium text-amber-800 hover:text-amber-900 underline-offset-2 underline cursor-pointer"
            >
              Find available stations →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isVerified
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {isVerified ? <CheckCircle className="w-4 h-4" /> : "1"}
          </div>
          <span
            className={`text-sm ${isVerified ? "text-gray-900 font-medium" : "text-gray-500"}`}
          >
            Verify
          </span>
        </div>
        <div
          className={`flex-1 h-px ${isVerified ? "bg-green-200" : "bg-gray-200"}`}
        />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-gray-200 text-gray-600">
            2
          </div>
          <span className="text-sm text-gray-500">Charge</span>
        </div>
      </div>

      {/* Verification Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Verify at charger
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Confirm your presence at the station to unlock the charger
          </p>
        </div>

        <div className="p-6">
          {!isVerified ? (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setVerificationMethod("qr")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                    verificationMethod === "qr"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      verificationMethod === "qr"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <QrCode
                      className={`w-6 h-6 ${
                        verificationMethod === "qr"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">Scan QR Code</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Quick & secure
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setVerificationMethod("manual")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                    verificationMethod === "manual"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      verificationMethod === "manual"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Key
                      className={`w-6 h-6 ${
                        verificationMethod === "manual"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">Enter Code</p>
                    <p className="text-xs text-gray-500 mt-0.5">Manual entry</p>
                  </div>
                </button>
              </div>

              {verificationMethod === "qr" && (
                <div className="bg-gray-50 rounded-xl p-6 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-20 h-20 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center mb-4">
                    <QrCode className="w-12 h-12 text-gray-800" />
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    Scan the QR code displayed on the charger screen
                  </p>
                  <button
                    onClick={handleVerifyQR}
                    disabled={isVerifying}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        Open Scanner
                      </>
                    )}
                  </button>
                </div>
              )}

              {verificationMethod === "manual" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                  <button
                    onClick={handleVerifyManual}
                    disabled={isVerifying || manualCode.length !== 6}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                </div>
              )}

              {!verificationMethod && (
                <div className="text-center py-4">
                  <Plug className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Select a verification method to continue
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100 animate-in fade-in zoom-in duration-300">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Charger verified</p>
                <p className="text-sm text-green-600">
                  {verificationMethod === "qr"
                    ? "QR code verified"
                    : "Code accepted"}{" "}
                  — Ready to start
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Start Charging Button */}
      <button
        onClick={handleStartChargingClick}
        disabled={!isVerified || isStarting}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
          !isVerified || isStarting
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
        }`}
      >
        {isStarting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Starting session...
          </>
        ) : (
          <>
            <BatteryCharging className="w-5 h-5" />
            Start Charging
          </>
        )}
      </button>
    </div>
  )
}

export default VerificationPanel
