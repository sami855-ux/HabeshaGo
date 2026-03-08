import React, { useEffect, useRef, useState } from "react"

// 🔥 LAZY LOAD LEAFLET – only on client, but with race conditions
let L: any
if (typeof window !== "undefined") {
  // 💣 DYNAMIC IMPORT – no error handling, may fail silently
  import("leaflet")
    .then((leaflet) => {
      L = leaflet
      // 💥 Also import CSS dynamically – prone to style flash
      import("leaflet/dist/leaflet.css")
    })
    .catch((err) => {
      console.error("🔥 Leaflet failed to load – map will crash", err)
    })
}

// 🚨 ERROR PRONE – no prop validation, location can be anything
const BusMap = ({ location, busVehicleLocations = [], busNumber = "" }) => {
  const mapRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [marker, setMarker] = useState(null)
  const [leafletReady, setLeafletReady] = useState(false)
  const [loadError, setLoadError] = useState(null)

  // 💣 NESTED EFFECT – tries to load Leaflet again, race with top-level
  useEffect(() => {
    if (!L) {
      import("leaflet")
        .then((leaflet) => {
          L = leaflet
          import("leaflet/dist/leaflet.css")

          // ✅ FIX: Fix default icon paths
          delete L.Icon.Default.prototype._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl:
              "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
            iconUrl:
              "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            shadowUrl:
              "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
          })

          setLeafletReady(true)
        })
        .catch((err) => {
          setLoadError(err.message)
        })
    } else {
      setLeafletReady(true)
    }
  }, [])

  // 🔥 DETERMINE LOCATION – socket OR fallback to busVehicleLocations
  const getEffectiveLocation = () => {
    // 💥 PRIORITY 1: live socket location (if valid)
    if (location?.lat && location?.lng) {
      return location
    }
    // 💥 PRIORITY 2: fallback to last entry in busVehicleLocations
    if (busVehicleLocations?.length > 0) {
      const last = busVehicleLocations[busVehicleLocations.length - 1]
      if (last?.lat && last?.lng) {
        console.log("📍 Using fallback location from vehicle.locations", last)
        return last
      }
    }
    // 💣 NO VALID LOCATION – return null, map will crash
    return null
  }

  const effectiveLocation = getEffectiveLocation()

  // 🚌 CREATE CUSTOM BUS ICON
  const getBusIcon = () => {
    if (!L) return null

    return L.divIcon({
      html: `<div style="
        background-color: #3b82f6;
        border-radius: 50%;
        padding: 10px;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        animation: pulse 1.5s infinite;
        font-size: 26px;
        line-height: 1;
      ">
        🚌
      </div>`,
      className: "bus-marker",
      iconSize: [48, 48],
      iconAnchor: [24, 48], // Anchor at bottom center
      popupAnchor: [0, -52], // Popup above the icon
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      shadowSize: [54, 64],
      shadowAnchor: [18, 56],
    })
  }

  // 🎯 CENTER MAP ON BUS - FIXED to keep icon and popover together
  const centerOnBus = () => {
    if (!mapInstance || !effectiveLocation) {
      console.warn("🔥 Cannot center: map or location missing")
      return
    }

    try {
      const { lat, lng } = effectiveLocation

      // 🚨 SUPER HIGH ZOOM LEVEL 20 – much closer
      mapInstance.setView([lat, lng], 20, {
        animate: true,
        duration: 0.5,
      })

      // 💥 Flash effect on marker
      if (marker) {
        const markerElement = marker.getElement()
        if (markerElement) {
          markerElement.style.transition = "transform 0.3s"
          markerElement.style.transform = "scale(1.4)"
          setTimeout(() => {
            markerElement.style.transform = "scale(1)"
          }, 300)
        }

        // ✅ Ensure popup is open and attached to marker
        if (!marker.isPopupOpen()) {
          marker.openPopup()
        }
      }

      console.log("🎯 Centered on bus at zoom 20")
    } catch (err) {
      console.error("🔥 Center on bus failed:", err)
    }
  }

  // 🗺️ INIT MAP – only runs once, but depends on async L and ref
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstance) return

    try {
      const defaultCenter = effectiveLocation
        ? [effectiveLocation.lat, effectiveLocation.lng]
        : [9.0245, 38.7465] // Addis fallback

      // 🔥 ZOOM LEVEL 18 – much higher than default
      const map = L.map(mapRef.current, {
        zoomControl: true,
        fadeAnimation: true,
        zoomAnimation: true,
      }).setView(defaultCenter, 18)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 22, // Allow zooming in further
      }).addTo(map)

      // ✅ Add scale control
      L.control.scale().addTo(map)

      let markerInstance
      if (effectiveLocation) {
        const busIcon = getBusIcon()
        markerInstance = L.marker(
          [effectiveLocation.lat, effectiveLocation.lng],
          {
            icon: busIcon,
            autoPan: true,
            autoPanSpeed: 2,
            autoPanPadding: [50, 50],
          },
        )
          .addTo(map)
          .bindPopup(
            `
            <div style="text-align: center; min-width: 220px; padding: 4px;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 28px;">🚌</span>
                <b style="font-size: 18px;">Bus ${busNumber || effectiveLocation.busNumber || ""}</b>
              </div>
              <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div><span style="color: #6b7280;">Lat:</span><br/><span style="font-weight: 600;">${effectiveLocation.lat.toFixed(6)}</span></div>
                  <div><span style="color: #6b7280;">Lng:</span><br/><span style="font-weight: 600;">${effectiveLocation.lng.toFixed(6)}</span></div>
                  ${effectiveLocation.speed ? `<div><span style="color: #6b7280;">Speed:</span><br/><span style="font-weight: 600;">${effectiveLocation.speed} km/h</span></div>` : ""}
                  ${effectiveLocation.heading ? `<div><span style="color: #6b7280;">Heading:</span><br/><span style="font-weight: 600;">${effectiveLocation.heading}°</span></div>` : ""}
                </div>
              </div>
              <div style="color: #6b7280; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>🕐</span> ${effectiveLocation.recordedAt ? new Date(effectiveLocation.recordedAt).toLocaleString() : "Live"}
              </div>
            </div>
          `,
            {
              maxWidth: 300,
              minWidth: 220,
              autoPan: true,
              autoPanPadding: [50, 50],
              keepInView: true,
              closeButton: false,
            },
          )
          .openPopup()
      }

      setMapInstance(map)
      setMarker(markerInstance)
    } catch (err) {
      console.error("🔥 Map initialization crashed:", err)
      setLoadError(err.message)
    }
  }, [leafletReady, mapRef.current])

  // 🔄 UPDATE MARKER when location changes
  useEffect(() => {
    if (!mapInstance || !marker || !effectiveLocation) return

    try {
      const { lat, lng } = effectiveLocation

      // Update marker position
      marker.setLatLng([lat, lng])

      // ✅ Pan to new location with animation
      mapInstance.panTo([lat, lng], {
        animate: true,
        duration: 0.5,
      })

      // Update popup content
      marker.setPopupContent(`
        <div style="text-align: center; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 28px;">🚌</span>
            <b style="font-size: 18px;">Bus ${busNumber || effectiveLocation.busNumber || ""}</b>
          </div>
          <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div><span style="color: #6b7280;">Lat:</span><br/><span style="font-weight: 600;">${lat.toFixed(6)}</span></div>
              <div><span style="color: #6b7280;">Lng:</span><br/><span style="font-weight: 600;">${lng.toFixed(6)}</span></div>
              ${effectiveLocation.speed ? `<div><span style="color: #6b7280;">Speed:</span><br/><span style="font-weight: 600;">${effectiveLocation.speed} km/h</span></div>` : ""}
              ${effectiveLocation.heading ? `<div><span style="color: #6b7280;">Heading:</span><br/><span style="font-weight: 600;">${effectiveLocation.heading}°</span></div>` : ""}
            </div>
          </div>
          <div style="color: #6b7280; font-size: 12px; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>🕐</span> ${effectiveLocation.recordedAt ? new Date(effectiveLocation.recordedAt).toLocaleString() : "Live"}
          </div>
        </div>
      `)

      // ✅ Keep popup open and properly attached
      if (!marker.isPopupOpen()) {
        marker.openPopup()
      }
    } catch (err) {
      console.error("🔥 Marker update failed:", err)
    }
  }, [effectiveLocation, mapInstance, marker, busNumber])

  // 🌍 Expose centerOnBus to window for popup button
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.centerOnBus = centerOnBus
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.centerOnBus
      }
    }
  }, [mapInstance, effectiveLocation, marker])

  // 💥 RENDER – map container OR debug OR error
  if (loadError) {
    return (
      <div
        style={{
          width: "100%",
          height: "500px",
          backgroundColor: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h3 style={{ color: "#b91c1c", marginBottom: "10px" }}>🚨 Map Error</h3>
        <pre
          style={{
            color: "#7f1d1d",
            background: "#fecaca",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          {loadError}
        </pre>
      </div>
    )
  }

  if (!leafletReady) {
    return (
      <div
        style={{
          width: "100%",
          height: "500px",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e2e8f0",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
          `}</style>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  if (!effectiveLocation) {
    return (
      <div
        style={{
          width: "100%",
          height: "500px",
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h3 style={{ marginBottom: "12px", color: "#4b5563" }}>
            📍 No Location Data
          </h3>
          <p style={{ color: "#6b7280", marginBottom: "8px" }}>
            {location ? "Invalid location format" : "Waiting for location..."}
          </p>
        </div>
      </div>
    )
  }

  // ✅ MAP IS READY – render container with button overlay
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* 🔍 Zoom Level Indicator */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "white",
          color: "#1f2937",
          borderRadius: "30px",
          padding: "8px 18px",
          fontSize: "14px",
          fontWeight: "600",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <span style={{ fontSize: "16px" }}>🔍</span>
        Zoom: {mapInstance?.getZoom() || 18}
      </div>
    </div>
  )
}

export default BusMap
