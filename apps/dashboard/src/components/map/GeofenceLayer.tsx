"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { useAppStore } from "@/store";

/**
 * GeofenceLayer — Draws semi-transparent circles for each of the 21 Polres sectors.
 */
export default function GeofenceLayer() {
  const map = useMap();
  const polres = useAppStore((s) => s.polres);

  const geofenceRadiusMeters = 15000; // 15km

  useEffect(() => {
    if (!map || !google?.maps) return;

    const circles: google.maps.Circle[] = polres.map((p) => {
      return new google.maps.Circle({
        map,
        center: { lat: p.lat, lng: p.lng },
        radius: geofenceRadiusMeters,
        fillColor: "#3B82F6",
        fillOpacity: 0.06,
        strokeColor: "#3B82F6",
        strokeWeight: 1.5,
        strokeOpacity: 0.25,
        clickable: false,
      });
    });

    return () => {
      circles.forEach((c) => c.setMap(null));
    };
  }, [map, polres, geofenceRadiusMeters]);

  return null;
}
