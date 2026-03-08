"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Users, Armchair, Shield, Crown, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ================= TYPES ================= */

interface Seat {
  id: string;
  number: string;
  type: "standard" | "premium" | "disabled";
  status: "available" | "booked" | "disabled";
  price: number;
  recommended?: boolean;
}

/* ================= COMPONENT ================= */

export function SeatSelection() {
  const router = useRouter();

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  /* ================= DUMMY SEATS ================= */

  const seats: Seat[] = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const row = Math.floor(i / 4) + 1;
      const col = String.fromCharCode(65 + (i % 4));
      const number = `${row}${col}`;

      const types: Seat["type"][] = ["standard", "premium", "disabled"];
      const type = types[Math.floor(Math.random() * 3)];

      const status: Seat["status"] = i % 6 === 0 ? "booked" : "available";

      const price = type === "premium" ? 200 : type === "standard" ? 100 : 0;

      return {
        id: number,
        number,
        type,
        status,
        price,
        recommended: [12, 13, 20, 21].includes(i),
      };
    });
  }, []);

  /* ================= HANDLERS ================= */

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== "available") return;

    setSelectedSeats((prev) =>
      prev.includes(seat.id)
        ? prev.filter((id) => id !== seat.id)
        : [...prev, seat.id]
    );
  };

  const selectedSeatsData = seats.filter((s) => selectedSeats.includes(s.id));

  const totalPrice = selectedSeatsData.reduce(
    (sum, seat) => sum + seat.price,
    0
  );

  const serviceFee = 49;
  const discount = selectedSeatsData.length * 20;
  const finalPrice = totalPrice + serviceFee - discount;

  /* ================= CONFIRM ================= */

  const handleConfirmSelection = () => {
    if (selectedSeats.length === 0) {
      alert("Select your seat");
      return;
    }

    // ✅ TEMP STORAGE (can be Redux later)
    localStorage.setItem(
      "tempBooking",
      JSON.stringify({
        seats: selectedSeatsData,
        totalPrice: finalPrice,
      })
    );

    setShowModal(false);
    router.push("/user/payment");
  };

  /* ================= UI ================= */

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-orange-500 to-amber-500"
      >
        Open Seat Selection
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-screen max-w-screen-2xl max-h-[95vh] overflow-y-auto px-6">
          <DialogHeader>
            <DialogTitle>Select Your Seats</DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ================= LEFT ================= */}
            <div className="lg:col-span-2">
              {/* Driver */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                  <Shield className="size-4" />
                  Driver’s Cabin
                </div>
                <div className="w-32 h-4 bg-gray-800 mx-auto mt-2 rounded-t-lg" />
              </div>

              {/* Seats */}
              <div className="grid grid-cols-4 gap-4">
                {seats.map((seat, index) => {
                  const isSelected = selectedSeats.includes(seat.id);

                  return (
                    <motion.div
                      key={seat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.01 }}
                    >
                      <button
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status !== "available"}
                        className={`relative w-full aspect-square rounded-xl flex items-center justify-center transition
                          ${
                            seat.status === "booked"
                              ? "bg-gray-300 cursor-not-allowed"
                              : isSelected
                              ? "bg-orange-500 text-white"
                              : seat.type === "premium"
                              ? "bg-purple-100 border-2 border-purple-300"
                              : "bg-blue-50 border-2 border-blue-200"
                          }`}
                      >
                        <Armchair className="size-6" />
                        <span className="absolute bottom-1 text-xs">
                          {seat.number}
                        </span>

                        {seat.recommended && seat.status === "available" && (
                          <Badge className="absolute -top-2 -right-2 bg-green-500">
                            <Zap className="size-3 mr-1" /> Best
                          </Badge>
                        )}

                        {seat.status === "booked" && (
                          <User className="absolute size-8 text-gray-500" />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ================= RIGHT ================= */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Selected */}
                <div className="rounded-xl bg-muted p-4">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Users className="size-4" />
                    Selected Seats ({selectedSeats.length})
                  </h4>

                  {selectedSeatsData.length ? (
                    selectedSeatsData.map((seat) => (
                      <div
                        key={seat.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <Armchair className="size-4" />
                          {seat.number}
                          {seat.type === "premium" && (
                            <Crown className="size-3 text-yellow-500" />
                          )}
                        </span>
                        <span>ETB {seat.price}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No seats selected
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="rounded-xl border p-4">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-bold">ETB {finalPrice}</span>
                  </div>
                </div>

                {/* Actions */}
                <Button
                  onClick={handleConfirmSelection}
                  disabled={!selectedSeats.length}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
                >
                  Confirm Selection
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
