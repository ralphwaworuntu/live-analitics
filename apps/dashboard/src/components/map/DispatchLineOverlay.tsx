"use client";

import { Polyline, AdvancedMarker } from "@vis.gl/react-google-maps";
import type { NearestUnit } from "@/hooks/useLiveTracking";

interface DispatchLineOverlayProps {
  incidentLat: number;
  incidentLng: number;
  nearestUnits: NearestUnit[];
  visible: boolean;
}

/**
 * DispatchLineOverlay — Draws dashed polylines from the incident to the Top 3 nearest units with ETA badges.
 */
export default function DispatchLineOverlay({
  incidentLat,
  incidentLng,
  nearestUnits,
  visible,
}: DispatchLineOverlayProps) {
  if (!visible || nearestUnits.length === 0) return null;

  const colors = ["#D4AF37", "#3B82F6", "#8B5CF6"];

  return (
    <>
      {nearestUnits.map((nu, idx) => {
        const wp = nu.track.waypoints[nu.track.waypoints.length - 1];
        if (!wp) return null;

        return (
          <div key={nu.track.id}>
            {/* Dashed Line */}
            <Polyline
              path={[
                { lat: incidentLat, lng: incidentLng },
                { lat: wp.lat, lng: wp.lng },
              ]}
              strokeColor={colors[idx] || "#3B82F6"}
              strokeWeight={3}
              strokeOpacity={0.5}
            />

            {/* ETA Badge at midpoint */}
            <AdvancedMarker
              position={{
                lat: (incidentLat + wp.lat) / 2,
                lng: (incidentLng + wp.lng) / 2,
              }}
            >
              <div
                className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-lg backdrop-blur-sm"
                style={{
                  backgroundColor: `${colors[idx]}20`,
                  borderColor: `${colors[idx]}50`,
                  color: colors[idx],
                }}
              >
                {nu.distanceKm} km • ETA {nu.etaMinutes}m
              </div>
            </AdvancedMarker>

            {/* Gold ring on selected units */}
            <AdvancedMarker position={{ lat: wp.lat, lng: wp.lng }}>
              <div
                className="w-14 h-14 rounded-full border-2 animate-ping pointer-events-none"
                style={{ borderColor: colors[idx], opacity: 0.3 }}
              />
            </AdvancedMarker>
          </div>
        );
      })}
    </>
  );
}
