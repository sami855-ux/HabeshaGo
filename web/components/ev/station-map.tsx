// components/charging-stations/station-map.tsx
"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import dynamic from 'next/dynamic';

// Dynamically import Leaflet to avoid SSR issues
const L = typeof window !== 'undefined' ? require('leaflet') : null;

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface StationMapProps {
  lat: number;
  lng: number;
  name: string;
  address?: string | null;
  city?: string | null;
}

export function StationMap({ lat, lng, name, address, city }: StationMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);

  // Generate Google Maps URLs
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address ? `${name} ${address} ${city || ''}` : `${lat},${lng}`
  )}`;

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const googleMapsStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

  useEffect(() => {
    // Check if we're on the client side and container exists
    if (typeof window === 'undefined' || !mapContainerRef.current || mapRef.current) return;

    // Fix Leaflet's default icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Create custom EV icon
    const evIcon = L.divIcon({
      className: 'custom-ev-marker',
      html: `
        <div class="relative">
          <div class="absolute -inset-2 bg-primary/20 rounded-full animate-ping" style="background-color: #3b82f6;"></div>
          <div class="relative bg-primary text-white p-2 rounded-full shadow-lg" style="background-color: #3b82f6;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([lat, lng], 15);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Add marker
    const marker = L.marker([lat, lng], { icon: evIcon }).addTo(map);
    
    // Add popup
    marker.bindPopup(`
      <div class="text-center p-2" style="min-width: 150px;">
        <strong style="display: block; margin-bottom: 4px; font-size: 14px;">${name}</strong>
        <span style="display: block; margin-bottom: 8px; font-size: 12px; color: #666;">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
        <a 
          href="${googleMapsSearchUrl}" 
          target="_blank" 
          rel="noopener noreferrer"
          style="font-size: 12px; color: #2563eb; text-decoration: underline; display: block;"
        >
          Open in Google Maps
        </a>
      </div>
    `);

    // Store references
    mapRef.current = map;
    markerRef.current = marker;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [lat, lng, name, googleMapsSearchUrl]);

  // Update marker position if coordinates change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], 15);
      
      markerRef.current.getPopup()?.setContent(`
        <div class="text-center p-2" style="min-width: 150px;">
          <strong style="display: block; margin-bottom: 4px; font-size: 14px;">${name}</strong>
          <span style="display: block; margin-bottom: 8px; font-size: 12px; color: #666;">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
          <a 
            href="${googleMapsSearchUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            style="font-size: 12px; color: #2563eb; text-decoration: underline; display: block;"
          >
            Open in Google Maps
          </a>
        </div>
      `);
    }
  }, [lat, lng, name, googleMapsSearchUrl]);

  return (
    <Card className="overflow-hidden p-0 shadow-none">
      <div className="relative">
        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          className="h-[350px] w-full z-0"
          style={{ background: '#f0f0f0' }}
        />
        
        {/* Google Maps Actions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-2 justify-center z-[1000]">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/95 hover:bg-white shadow-lg text-xs h-9 px-4 border"
            onClick={() => window.open(googleMapsSearchUrl, '_blank', 'noopener,noreferrer')}
          >
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            View in Maps
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/95 hover:bg-white shadow-lg text-xs h-9 px-4 border"
            onClick={() => window.open(googleMapsDirectionsUrl, '_blank', 'noopener,noreferrer')}
          >
            <Navigation className="h-3.5 w-3.5 mr-1.5" />
            Directions
          </Button>

          <Button
            size="sm"
            variant="secondary"
            className="bg-white/95 hover:bg-white shadow-lg text-xs h-9 px-4 border"
            onClick={() => window.open(googleMapsStreetViewUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Street View
          </Button>
        </div>

        {/* Coordinates Overlay */}
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-full shadow-lg text-xs text-muted-foreground z-[1000] border">
          <div className="flex items-center gap-1.5">
            <Navigation className="h-3 w-3" />
            <span className="font-mono">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}