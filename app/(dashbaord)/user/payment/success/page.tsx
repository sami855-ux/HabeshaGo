"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  QrCode,
  Download,
  Wallet,
  Copy,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-confetti";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [copied, setCopied] = useState(false);

  // Get booking info from query params
  const bookingDetails = {
    bookingId: searchParams.get("bookingId") || "ET0000",
    transactionId: searchParams.get("transactionId") || "TXN0000",
    total: searchParams.get("total") || 0,
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    date: searchParams.get("date") || "",
    time: searchParams.get("time") || "",
    seats: (searchParams.get("seats") || "").split(","),
    paymentMethod: "Wallet",
  };

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingDetails.bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoHome = () => router.push("/");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 overflow-hidden rounded-2xl">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="size-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="size-12 text-green-600" />
          </motion.div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Enjoy your ride! Receipt sent to your email.
          </p>

          <div className="flex flex-col items-center gap-3">
            <div className="text-sm text-muted-foreground">Booking ID</div>
            <div className="flex items-center gap-3">
              <div className="font-mono text-2xl font-bold bg-muted px-4 py-2 rounded-lg">
                {bookingDetails.bookingId}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyBookingId}
                className="gap-2"
              >
                <Copy className="size-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <Card className="border-2 border-green-500/20 shadow-lg">
            <CardHeader>
              <CardTitle>Booking Confirmed</CardTitle>
              <CardDescription>
                Your e-ticket has been generated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">From:</span>{" "}
                  {bookingDetails.from}
                </div>
                <div>
                  <span className="font-semibold">To:</span> {bookingDetails.to}
                </div>
                <div>
                  <span className="font-semibold">Date & Time:</span>{" "}
                  {bookingDetails.date} • {bookingDetails.time}
                </div>
                <div>
                  <span className="font-semibold">Seats:</span>{" "}
                  {bookingDetails.seats.join(", ")}
                </div>
                <div>
                  <span className="font-semibold">Total Paid:</span> ETB{" "}
                  {bookingDetails.total}
                </div>
                <div>
                  <span className="font-semibold">Payment Method:</span>{" "}
                  {bookingDetails.paymentMethod}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full" size="lg" onClick={handleGoHome}>
                <Home className="mr-2 size-5" />
                Back to Home
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
