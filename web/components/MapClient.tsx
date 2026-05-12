"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// fix icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Lot = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSlots: number;
  availableSlots: number;
};

export default function MapClient({ lots }: { lots: Lot[] }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  const getOccupancy = (t: number, a: number) =>
    ((t - a) / t) * 100;

  return (
    <MapContainer
      center={position || [9.03, 38.74]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {position && (
        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {lots
        .filter(
          (lot) =>
            typeof lot.latitude === "number" &&
            typeof lot.longitude === "number",
        )
        .map((lot) => (
          <Marker key={lot.id} position={[lot.latitude, lot.longitude]}>
            <Popup>
              <div>
                <h4 style={{ fontWeight: "bold" }}>{lot.name}</h4>
                <p>{lot.address}</p>                                                               
                <p>
                  {lot.availableSlots}/{lot.totalSlots} available
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}