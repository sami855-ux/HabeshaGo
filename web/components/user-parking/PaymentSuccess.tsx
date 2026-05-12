import { CheckCircle, Download, Share2, Home } from "lucide-react";

export function PaymentSuccess({
  amount,
  lotName,
  slotNumber,
  duration,
  transactionId,
  onBackToHome,
}: PaymentSuccessProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-200">
      
      {/* HEADER */}
      <div className="bg-green-600 text-white px-4 py-3">
        <h2 className="font-semibold">Payment Successful</h2>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">

          {/* SUCCESS CARD */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 mb-4 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>

            <h3 className="font-bold text-2xl mb-2">Payment Complete!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your parking fee has been successfully paid
            </p>

            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
              ${amount.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Paid from Wallet
            </p>
          </div>

          {/* DETAILS */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4 mb-4">
            <h4 className="font-semibold mb-3">Transaction Details</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Transaction ID
                </span>
                <span className="font-medium">{transactionId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Parking Lot
                </span>
                <span className="font-medium">{lotName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Slot Number
                </span>
                <span className="font-medium">{slotNumber}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Duration
                </span>
                <span className="font-medium">{duration}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Date & Time
                </span>
                <span className="font-medium">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mb-4">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800">
              <Download className="w-4 h-4" />
              Download Receipt
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* BACK BUTTON */}
          <button
            onClick={onBackToHome}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}