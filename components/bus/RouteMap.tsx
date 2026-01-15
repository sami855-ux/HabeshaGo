"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface RouteMapProps {
  route: {
    name: string;
    origin: { name: string; lat: number; lng: number };
    destination: { name: string; lat: number; lng: number };
    midPoints: { name: string; lat: number; lng: number }[];
  };
}

export default function RouteMap({ route }: RouteMapProps) {
  const [center, setCenter] = useState<[number, number]>([0, 0]);

  // Compute route coordinates
  const coordinates = [
    [route.origin.lat, route.origin.lng],
    ...route.midPoints.map((p) => [p.lat, p.lng]),
    [route.destination.lat, route.destination.lng],
  ] as [number, number][];

  useEffect(() => {
    // Center map on route midpoint
    if (coordinates.length > 0) {
      const midIndex = Math.floor(coordinates.length / 2);
      setCenter(coordinates[midIndex]);
    }
  }, [coordinates]);

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Polyline positions={coordinates} color="blue" weight={4} />
        {/* Markers */}
        <Marker position={[route.origin.lat, route.origin.lng]}>
          <Popup>Origin: {route.origin.name}</Popup>
        </Marker>
        {route.midPoints.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lng]}>
            <Popup>{p.name}</Popup>
          </Marker>
        ))}
        <Marker position={[route.destination.lat, route.destination.lng]}>
          <Popup>Destination: {route.destination.name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
