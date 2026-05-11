import { ArrowLeft, Wallet } from "lucide-react";

export function Checkout({
  lotName,
  slotNumber,
  duration,
  totalCost,
  walletBalance,
  onBack,
  onProceedToPayment,
}: CheckoutProps) {
  const hasEnoughBalance = walletBalance >= totalCost;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-200">
      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold">Checkout</h2>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-auto p-4">
        {/* SESSION SUMMARY */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4 mb-4">
          <h3 className="font-semibold mb-3">Session Summary</h3>

          <div className="space-y-3">
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
              <span className="text-gray-600 dark:text-gray-400">Duration</span>
              <span className="font-medium">{duration}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4 mb-4">
          <h3 className="font-semibold mb-3">Payment Breakdown</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Parking Fee
              </span>
              <span className="font-medium">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Service Fee
              </span>
              <span className="font-medium">$0.00</span>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-800 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total Amount</span>
                <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* WALLET */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Wallet className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <h3 className="font-semibold">Wallet Balance</h3>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">
              Available Balance
            </span>
            <span
              className={`font-bold text-xl ${
                hasEnoughBalance
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ${walletBalance.toFixed(2)}
            </span>
          </div>

          {!hasEnoughBalance && (
            <div className="mt-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-400">
                Insufficient balance. Please add funds to your wallet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ACTION */}
      <div className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 p-4">
        <button
          onClick={onProceedToPayment}
          disabled={!hasEnoughBalance}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed"
        >
          {hasEnoughBalance ? "Proceed to Payment" : "Add Funds to Wallet"}
        </button>
      </div>
    </div>
  );
}
