"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ✅ UPDATED IMPORT (NEW ARCHITECTURE)
import {
  fetchParkingLots,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
} from "@/store/slices/parkingAdminSlice";

export default function ParkingLots() {
  const dispatch = useDispatch();

  // ✅ UPDATED STATE PATH
  const { lots, loading } = useSelector((state) => state.parking);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    totalSlots: "",
    pricePerMinute: "",
    hasSecurity: false,
  });

  // FETCH
  useEffect(() => {
    dispatch(fetchParkingLots());
  }, [dispatch]);

  // FILTER
  const filteredLots = (lots || []).filter((lot) =>
    lot?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      totalSlots: "",
      pricePerMinute: "",
      hasSecurity: false,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      totalSlots: Number(formData.totalSlots),
      pricePerMinute: Number(formData.pricePerMinute),
    };

    if (editingLot) {
      dispatch(updateParkingLot({ id: editingLot.id, data: payload }));
    } else {
      dispatch(createParkingLot(payload));
    }

    setIsDialogOpen(false);
    setEditingLot(null);
    resetForm();
  };

  const handleEdit = (lot) => {
    setEditingLot(lot);

    setFormData({
      name: lot.name || "",
      description: lot.description || "",
      address: lot.address || "",
      city: lot.city || "",
      latitude: lot.latitude?.toString() || "",
      longitude: lot.longitude?.toString() || "",
      totalSlots: lot.totalSlots?.toString() || "",
      pricePerMinute: lot.pricePerMinute?.toString() || "",
      hasSecurity: lot.hasSecurity || false,
    });

    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this parking lot?")) {
      dispatch(deleteParkingLot(id));
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Parking Lots</h1>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingLot(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lot
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editingLot ? "Edit Parking Lot" : "Create Parking Lot"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <Input
                placeholder="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />

              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                />
                <Input
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Total Slots"
                  value={formData.totalSlots}
                  onChange={(e) =>
                    setFormData({ ...formData, totalSlots: e.target.value })
                  }
                />
              </div>

              <Input
                placeholder="Price / Minute"
                value={formData.pricePerMinute}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerMinute: e.target.value })
                }
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.hasSecurity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hasSecurity: e.target.checked,
                    })
                  }
                />
                Has Security
              </label>

              <Button type="submit" className="w-full">
                {editingLot ? "Update Lot" : "Create Lot"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH */}
      <Card className="p-4">
        <Input
          placeholder="Search parking lots..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* LIST */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLots.map((lot) => (
            <Card key={lot.id} className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">{lot.name}</h3>
              </div>

              <p className="text-sm text-gray-500">
                {lot.address}, {lot.city}
              </p>

              <p className="text-sm">
                Slots: {lot.availableSlots}/{lot.totalSlots}
              </p>

              <p className="text-sm">💰 {lot.pricePerMinute} / min</p>

              <p className="text-sm">
                Security: {lot.hasSecurity ? "Yes" : "No"}
              </p>

              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => handleEdit(lot)}>
                  <Edit className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(lot.id)}
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
