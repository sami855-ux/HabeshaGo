"use client";

import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Share2 } from "lucide-react";

interface QRCodeViewProps {
  bookingId: string;
  lotName: string;
  slotNumber: string;
  onBack: () => void;
  onStartSession: () => void;
}

export function QRCodeView({
  bookingId,
  lotName,
  slotNumber,
  onBack,
  onStartSession,
}: QRCodeViewProps) {
  const qrData = JSON.stringify({
    bookingId,
    lotName,
    slotNumber,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-gray-900 dark:text-white">
          Your QR Code
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 text-center">
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {lotName}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Slot {slotNumber}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg inline-block mb-4">
            <QRCodeSVG value={qrData} size={200} level="H" />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Booking ID: {bookingId}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Scan this code at the parking lot entrance
          </p>

          <div className="flex gap-2 mt-4 justify-center">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-900 mt-4 max-w-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Your reservation is valid for 15 minutes.
            Please scan the QR code at the parking lot to start your session.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 p-4">
        <button
          onClick={onStartSession}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Simulate: Start Session
        </button>
      </div>
    </div>
  );
}
