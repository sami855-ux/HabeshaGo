"use client";

import { ArrowLeft, Lock } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function PaymentPIN({
  amount,
  onBack,
  onPaymentSuccess,
}: PaymentPINProps) {
  const [pin, setPin] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const PIN_LENGTH = 6;

  /* ================= KEEP LATEST PIN (fix Enter bug) ================= */
  const pinRef = useRef(pin);

  useEffect(() => {
    pinRef.current = pin;
  }, [pin]);

  /* ================= INPUT ================= */
  const handlePinInput = (digit: string) => {
    if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + digit);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleSubmit = async () => {
    const currentPin = pinRef.current;

    if (currentPin.length !== PIN_LENGTH) {
      setError(`Please enter a ${PIN_LENGTH}-digit PIN`);
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      await onPaymentSuccess(currentPin);
      setPin("");
    } catch (err: any) {
      setError(err?.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ================= KEYBOARD SUPPORT ================= */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing) return;

      // numbers
      if (e.key >= "0" && e.key <= "9") {
        handlePinInput(e.key);
      }

      // delete
      if (e.key === "Backspace") {
        handleDelete();
      }

      // submit
      if (e.key === "Enter") {
        const currentPin = pinRef.current;

        if (currentPin.length === PIN_LENGTH) {
          handleSubmit();
        } else {
          setError(`Please enter a ${PIN_LENGTH}-digit PIN`);
        }
      }

      // back
      if (e.key === "Escape") {
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProcessing]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-200">

      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          disabled={isProcessing}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold">Enter PIN</h2>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {/* AMOUNT */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 mb-6 text-center">
            <Lock className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Confirm Payment</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              ${amount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your {PIN_LENGTH}-digit PIN
            </p>
          </div>

          {/* PIN DOTS */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 mb-4">

            <div className="flex justify-center gap-3 mb-6">
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
                    pin.length > i
                      ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30"
                      : "border-gray-300 dark:border-zinc-700"
                  }`}
                >
                  {pin.length > i && (
                    <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 dark:text-red-400 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* KEYPAD */}
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6,7,8,9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  disabled={isProcessing}
                  className="h-14 rounded-lg border border-gray-200 dark:border-zinc-700 font-semibold text-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  {num}
                </button>
              ))}

              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="h-14 rounded-lg border border-gray-200 dark:border-zinc-700 font-semibold text-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                ←
              </button>

              <button
                onClick={() => handlePinInput("0")}
                disabled={isProcessing}
                className="h-14 rounded-lg border border-gray-200 dark:border-zinc-700 font-semibold text-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                0
              </button>

              <button
                onClick={handleSubmit}
                disabled={isProcessing || pin.length !== PIN_LENGTH}
                className="h-14 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-zinc-700"
              >
                {isProcessing ? "..." : "✓"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}