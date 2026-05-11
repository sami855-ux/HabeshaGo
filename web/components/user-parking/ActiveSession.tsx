"use client";

import { Clock, MapPin, Car, DollarSign, Timer } from "lucide-react";
import { useEffect, useState } from "react";

interface ActiveSessionProps {
  lotName: string;
  lotAddress: string;
  slotNumber: string;
  pricePerHour: number;
  startTime: Date | string | number;
  onEndSession: () => void;
}

export function ActiveSession({
  lotName,
  lotAddress,
  slotNumber,
  pricePerHour,
  startTime,
  onEndSession,
}: ActiveSessionProps) {
  const [duration, setDuration] = useState(0);
  const [cost, setCost] = useState(0);

  const safeStartTime = new Date(startTime);
  const isValidDate = !isNaN(safeStartTime.getTime());

  useEffect(() => {
    if (!isValidDate) return;

    const interval = setInterval(() => {
      const now = new Date();

      const diffSeconds = Math.floor(
        (now.getTime() - safeStartTime.getTime()) / 1000,
      );

      setDuration(diffSeconds);

      const minutes = Math.max(1, Math.ceil(diffSeconds / 60));
      const calculatedCost = (pricePerHour / 60) * minutes;

      setCost(calculatedCost);
    }, 1000);

    return () => clearInterval(interval);
  }, [safeStartTime, pricePerHour, isValidDate]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isValidDate) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400 bg-gray-50 dark:bg-zinc-950">
        Invalid start time. Please restart session.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="bg-green-600 text-white px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <h2 className="font-semibold">Active Parking Session</h2>
        </div>
        <p className="text-sm text-green-100">Your parking is in progress</p>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-auto p-4">
        {/* TIMER */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 mb-4 text-center">
          <Timer className="w-16 h-16 mx-auto text-green-600 mb-4" />

          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {formatDuration(duration)}
          </div>

          <p className="text-gray-600 dark:text-gray-400">Time Elapsed</p>
        </div>

        {/* DETAILS */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4 mb-4">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
            Session Details
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {lotName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lotAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Slot {slotNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Started at
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {safeStartTime.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Rate: ${pricePerHour}/hour
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COST */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-900 dark:text-blue-300">
                Current Cost
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${cost.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>

          <p className="text-xs text-blue-800 dark:text-blue-200 mt-2">
            Billed per minute • Final amount calculated at checkout
          </p>
        </div>
      </div>

      {/* ACTION */}
      <div className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 p-4">
        <button
          onClick={onEndSession}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          End Session & Checkout
        </button>
      </div>
    </div>
  );
}
