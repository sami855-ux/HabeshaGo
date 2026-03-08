"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { axiosInstance } from "@/services/axiosInstance";
import {SeatSelection}  from "@/components/bus/SeatSelection";
import BookingForm from "@/components/booking/BookingForm";

export default function BookingPage({ userId }: { userId: string }) {
  const params = useParams();
  const busId = Number(params.busId);

  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 👉 NEW STATE: selected seats
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await axiosInstance.get(`/buses/${busId}`);
        setBus(res.data);
      } catch (err) {
        console.error("Failed to fetch bus", err);
      } finally {
        setLoading(false);
      }
    };

    if (busId) fetchBus();
  }, [busId]);

  if (loading) return <p className="p-6">Loading bus info...</p>;
  if (!bus) return <p className="p-6">Bus not found</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Bus Info */}
      <div className="bg-card rounded-xl p-4 border">
        <h1 className="text-2xl font-bold">{bus.name}</h1>
        <p className="text-muted-foreground">
          {bus.from} → {bus.to}
        </p>
      </div>

      {/* ================= SEAT SELECTION ================= */}
      <div className="bg-card rounded-xl p-6 border">
        <h2 className="text-xl font-semibold mb-2">Select Seats</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose your preferred seats before continuing
        </p>

        <SeatSelection
          availableSeats={bus.seats || []}
          selectedSeats={selectedSeats}
          onChange={setSelectedSeats}
        />
      </div>

      {/* ================= BOOKING FORM ================= */}
      {selectedSeats.length > 0 && (
        <div className="bg-card rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4">
            Passenger & Payment Details
          </h2>

          <BookingForm
            userId={userId}
            busId={busId}
            selectedSeats={selectedSeats}
          />
        </div>
      )}
    </div>
  );
}
