"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Zap, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  fetchParkingLots,
  fetchSlotsByLot,
  createSlots,
  updateSlotStatus,
  deleteSlot,
} from "@/store/slices/parkingAdminSlice";

// ✅ SOCKET HOOK
import useSocket from "@/hooks/useParkingSocket";

export default function Slots() {
  const dispatch = useDispatch<any>();

  // ✅ MUST match slice name
  const { lots, slots, loading } = useSelector((state: any) => state.parking);

  const safeSlots = Array.isArray(slots) ? slots : [];

  const [selectedLot, setSelectedLot] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    prefix: "",
    count: "",
    slotType: "CAR",
    floor: 1,
    section: "A",
    isEV: false,
    hasCharger: false,
  });

  // 🔥 REPLACE WITH REAL USER ID FROM AUTH
  const userId = "admin-demo-id";

  // ✅ REALTIME HOOK
  useSocket(userId, selectedLot);

  /* ================= LOAD ================= */
  useEffect(() => {
    dispatch(fetchParkingLots());
  }, [dispatch]);

  useEffect(() => {
    if (selectedLot) {
      dispatch(fetchSlotsByLot(selectedLot));
    }
  }, [selectedLot, dispatch]);

  /* ================= STATUS UI ================= */
  const getStatusBadge = (status: string) => {
    const map: any = {
      AVAILABLE: "bg-green-100 text-green-800",
      OCCUPIED: "bg-red-100 text-red-800",
      RESERVED: "bg-yellow-100 text-yellow-800",
      MAINTENANCE: "bg-gray-100 text-gray-700",
    };

    return <Badge className={`${map[status]} font-medium`}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const map: any = {
      CAR: "bg-blue-100 text-blue-700",
      BIKE: "bg-purple-100 text-purple-700",
      TRUCK: "bg-orange-100 text-orange-700",
    };

    return <Badge className={map[type]}>{type}</Badge>;
  };

  /* ================= CREATE ================= */
  const handleCreateSlots = async (e: any) => {
    e.preventDefault();

    if (!selectedLot) {
      alert("Please select a parking lot first");
      return;
    }

    const slotsData = Array.from({ length: Number(formData.count) }).map(
      (_, i) => ({
        slotNumber: `${formData.prefix}-${i + 1}`,
        slotType: formData.slotType,
        status: "AVAILABLE",
        floor: formData.floor,
        section: formData.section,
        isEV: formData.isEV,
        hasCharger: formData.hasCharger,
      }),
    );

    try {
      await dispatch(
        createSlots({ lotId: selectedLot, slots: slotsData }),
      ).unwrap();

      // ✅ REFRESH (optional but safe)
      dispatch(fetchSlotsByLot(selectedLot));

      setIsDialogOpen(false);
    } catch (err) {
      console.error("Create slots error:", err);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    const ok = confirm("Delete?");
    if (!ok) return;

    await dispatch(deleteSlot(id)).unwrap();

    dispatch(fetchSlotsByLot(selectedLot));
  };

  /* ================= TOGGLE ================= */
  const toggleStatus = (slot: any) => {
    dispatch(
      updateSlotStatus({
        slotId: slot.id,
        status: slot.status === "AVAILABLE" ? "OCCUPIED" : "AVAILABLE",
      }),
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Smart Parking Slots</h1>
          <p className="text-gray-500 text-sm">
            Airport-level parking control system (Real-time)
          </p>
        </div>

        {/* CREATE */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedLot}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Slots
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Smart Slots</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateSlots} className="space-y-4">
              <div>
                <Label>Prefix</Label>
                <Input
                  value={formData.prefix}
                  onChange={(e) =>
                    setFormData({ ...formData, prefix: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Number of Slots</Label>
                <Input
                  type="number"
                  value={formData.count}
                  onChange={(e) =>
                    setFormData({ ...formData, count: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Slot Type</Label>
                <Select
                  value={formData.slotType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, slotType: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select slot type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="CAR">🚗 Car</SelectItem>
                    <SelectItem value="BIKE">🏍 Bike</SelectItem>
                    <SelectItem value="TRUCK">🚚 Truck</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Floor</Label>
                <Input
                  type="number"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floor: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Section</Label>
                <Input
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full">
                Generate Slots
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LOT SELECT */}
      <Card className="p-4">
        <Label>Select Parking Lot</Label>

        <Select value={selectedLot} onValueChange={setSelectedLot}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select lot" />
          </SelectTrigger>

          <SelectContent>
            {lots?.map((lot: any) => (
              <SelectItem key={lot.id} value={lot.id}>
                🚗 {lot.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* GRID */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {safeSlots.map((slot: any) => (
            <Card
              key={slot.id}
              className={`p-4 space-y-3 border transition hover:shadow-xl ${
                slot.isEV ? "border-green-400 shadow-green-100" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">{slot.slotNumber}</h2>
                {getStatusBadge(slot.status)}
              </div>

              <div>{getTypeBadge(slot.slotType)}</div>

              <div className="text-sm text-gray-600">
                <p>📍 Floor {slot.floor}</p>
                <p>🏷 Section {slot.section}</p>
              </div>

              <div className="flex gap-2 text-xs">
                {slot.isEV && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Zap className="w-3 h-3" /> EV
                  </span>
                )}
                {slot.hasCharger && (
                  <span className="text-blue-600">⚡ Charger</span>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleStatus(slot)}
                >
                  Toggle
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(slot.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
