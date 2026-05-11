"use client";

import dynamic from "next/dynamic";

// IMPORTANT: load ONLY in browser
const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
});

export default function MapSection({ lots }: any) {
  return <MapClient lots={lots} />;
}
