"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QRCode } from "react-qrcode-logo";
import { Loader } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId") || "N/A";
  const paymentId = searchParams.get("paymentId") || "N/A";
  const total = searchParams.get("total") || "0";
  const seats = searchParams.get("seats")?.split(",") || [];

  const qrValue = JSON.stringify({ bookingId, paymentId, seats, total });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full flex flex-col md:flex-row overflow-hidden">
        {/* Left Side - Booking Info */}
        <div className="flex-1 p-8 bg-gradient-to-b from-orange-50 to-amber-50">
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            Payment Successful!
          </h1>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-semibold">Booking ID:</span> {bookingId}
            </p>
            <p>
              <span className="font-semibold">Payment ID:</span> {paymentId}
            </p>
            <p>
              <span className="font-semibold">Seats:</span> {seats.join(", ")}
            </p>
            <p className="font-bold text-lg mt-2">Total Paid: {total} ETB</p>
          </div>
          <Button
            className="mt-6 bg-gradient-to-r from-orange-500 to-amber-500"
            onClick={() => router.push("/user/bus")}
          >
            Back to Bus List
          </Button>
        </div>

        {/* Right Side - QR Code */}
        <div className="flex items-center justify-center p-8 bg-gray-100">
          <QRCode
            value={qrValue}
            size={180}
            fgColor="#16a34a"
            bgColor="#f9fafb"
            quietZone={10}
            logoImage=""
          />
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Show this QR code at the bus counter for boarding.
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-green-600" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}