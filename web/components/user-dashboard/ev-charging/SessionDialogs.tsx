import React from "react"
import { X, Loader2, BatteryCharging, CheckCircle } from "lucide-react"
import CompletionDialog from "@/components/user-dashboard/ev-charging/CompletionDialog"
import InsufficientFundsDialog from "@/components/user-dashboard/ev-charging/InsufficientFundsDialog"
import { ModernAlert } from "@/components/ui/modern-alert"

interface SessionDialogsProps {
  showTargetReachedDialog: boolean
  showResumeDialog: boolean
  showCompletionDialog: boolean
  showInsufficientFundsDialog: boolean
  showModernAlert: boolean
  session: any
  timeElapsed: string
  walletBalance: number
  finalCost: number
  resumeAmount: number
  isDialogLoading: boolean
  alertConfig: { type: string; onConfirm: () => void } | null
  onCloseTargetDialog: () => void
  onResumeFromTarget: () => void
  onCloseResumeDialog: () => void
  onResumeAmountChange: (amount: number) => void
  onConfirmResume: () => void
  onCloseCompletionDialog: () => void
  onCloseInsufficientFundsDialog: () => void
  onAddFunds: () => void
  onCloseModernAlert: () => void
  onConfirmModernAlert: () => void
  setIsDialogLoading: (loading: boolean) => void
}

const SessionDialogs: React.FC<SessionDialogsProps> = ({
  showTargetReachedDialog,
  showResumeDialog,
  showCompletionDialog,
  showInsufficientFundsDialog,
  showModernAlert,
  session,
  timeElapsed,
  walletBalance,
  finalCost,
  resumeAmount,
  isDialogLoading,
  alertConfig,
  onCloseTargetDialog,
  onResumeFromTarget,
  onCloseResumeDialog,
  onResumeAmountChange,
  onConfirmResume,
  onCloseCompletionDialog,
  onCloseInsufficientFundsDialog,
  onAddFunds,
  onCloseModernAlert,
  onConfirmModernAlert,
  setIsDialogLoading,
}) => {
  const getAlertTitle = () => {
    if (!alertConfig) return ""
    switch (alertConfig.type) {
      case "pause":
        return "Pause Charging Session"
      case "stop":
        return "Stop Charging Session"
      case "resume":
        return "Resume Charging Session"
      default:
        return ""
    }
  }

  const getAlertDescription = () => {
    if (!alertConfig) return ""
    switch (alertConfig.type) {
      case "pause":
        return "Are you sure you want to pause your charging session? You can resume it at any time."
      case "stop":
        return "Are you sure you want to stop your charging session? This will complete the session and charge your wallet for the energy delivered."
      case "resume":
        return "Are you sure you want to resume your charging session? Additional charges will apply based on your target energy."
      default:
        return ""
    }
  }

  const getAlertConfirmLabel = () => {
    if (!alertConfig) return ""
    switch (alertConfig.type) {
      case "pause":
        return "Pause Session"
      case "stop":
        return "Stop Session"
      case "resume":
        return "Resume Session"
      default:
        return ""
    }
  }

  const getAlertType = () => {
    if (!alertConfig) return "warning"
    switch (alertConfig.type) {
      case "pause":
        return "warning"
      case "stop":
        return "danger"
      case "resume":
        return "info"
      default:
        return "warning"
    }
  }

  return (
    <>
      {/* Target Reached Dialog */}
      {showTargetReachedDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Target Reached!
              </h2>
              <p className="text-gray-500 mt-2">
                Your charging target of {session.targetEnergy} kWh has been
                reached. The session has been automatically stopped.
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Energy Delivered</span>
                  <span className="font-medium text-gray-900">
                    {session.chargingStats.energyDelivered} kWh
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Total Cost</span>
                  <span className="font-medium text-gray-900">
                    ${session.chargingStats.sessionCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Time Elapsed</span>
                  <span className="font-medium text-gray-900">
                    {timeElapsed}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={onCloseTargetDialog}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={onResumeFromTarget}
                className="flex-1 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Resume Charging
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Dialog - Add more energy */}
      {showResumeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Continue Charging
                </h2>
                <button
                  onClick={onCloseResumeDialog}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-500">
                Your target has been reached. How much more energy would you
                like to add?
              </p>
              <div className="mt-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional Energy (kWh)
                </label>
                <div className="flex gap-3">
                  {[5, 10, 15, 20, 40].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => onResumeAmountChange(amount)}
                      className={`flex-1 py-2 rounded-xl font-medium transition ${
                        resumeAmount === amount
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      +{amount}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">New Total Target</span>
                    <span className="font-medium text-gray-900">
                      {session.targetEnergy + resumeAmount} kWh
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Est. Additional Cost</span>
                    <span className="font-medium text-gray-900">
                      ${(resumeAmount * session.pricePerKwh).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Wallet Balance</span>
                    <span
                      className={`font-medium ${
                        walletBalance >= resumeAmount * session.pricePerKwh
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${walletBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 p-4 flex gap-3">
              <button
                onClick={onCloseResumeDialog}
                className="flex-1 py-2.5 rounded-xl font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmResume}
                className="flex-1 py-2.5 rounded-xl font-medium bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <BatteryCharging className="w-4 h-4" />
                Pay & Resume (+$
                {(resumeAmount * session.pricePerKwh).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Dialog */}
      <CompletionDialog
        isOpen={showCompletionDialog}
        onClose={onCloseCompletionDialog}
        energyDelivered={session.chargingStats.energyDelivered}
        totalCost={finalCost}
        timeElapsed={timeElapsed}
        walletBalance={walletBalance}
      />

      {/* Insufficient Funds Dialog */}
      <InsufficientFundsDialog
        isOpen={showInsufficientFundsDialog}
        onClose={onCloseInsufficientFundsDialog}
        requiredAmount={resumeAmount * session.pricePerKwh}
        currentBalance={walletBalance}
        onAddFunds={onAddFunds}
      />

      {/* Modern Alert for Confirmations */}
      <ModernAlert
        open={showModernAlert}
        onOpenChange={onCloseModernAlert}
        title={getAlertTitle()}
        description={getAlertDescription()}
        type={getAlertType() as any}
        confirmLabel={getAlertConfirmLabel()}
        onConfirm={onConfirmModernAlert}
        isConfirming={isDialogLoading}
        confirmText="Processing..."
      />
    </>
  )
}

export default SessionDialogs
