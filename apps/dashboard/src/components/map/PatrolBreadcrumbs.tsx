"use client";

import { useEffect, useMemo, useRef } from "react";
import { AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { useAppStore } from "@/store";

export default function PatrolBreadcrumbs() {
  const map = useMap();
  const historyTimestamp = useAppStore((state) => state.historyTimestamp);
  const personnelTracks = useAppStore((state) => state.personnelTracks);
  const selectedPersonnelId = useAppStore((state) => state.selectedPersonnelId);
  const setSelectedPersonnelId = useAppStore((state) => state.setSelectedPersonnelId);

  // We keep a registry of Google Map Polyline class instances we've created
  // so we can update them directly rather than redrawing completely.
  const polylineRefs = useRef<Map<string, google.maps.Polyline>>(new Map());

  // Filter paths up to the current historyTimestamp
  const filteredTracks = useMemo(() => {
    return personnelTracks.map((track) => {
      const validWaypoints = track.waypoints.filter((wp) => {
        const d = new Date(wp.timestamp);
        const minutes = d.getHours() * 60 + d.getMinutes();
        return minutes <= historyTimestamp;
      });

      return {
        ...track,
        validWaypoints,
        latestPosition: validWaypoints[validWaypoints.length - 1] || null,
        isSelected: track.id === selectedPersonnelId,
      };
    });
  }, [personnelTracks, historyTimestamp, selectedPersonnelId]);

  // Imperative DOM manipulations for Polylines to ensure fast 60fps scrubbing
  useEffect(() => {
    if (!map) return;

    // We only want to run this if the google.maps.Polyline constructor is available
    if (!window.google?.maps?.Polyline) return;

    filteredTracks.forEach((track) => {
      let polyline = polylineRefs.current.get(track.id);

      if (!polyline) {
        polyline = new window.google.maps.Polyline({
          map,
          strokeColor: "#D4AF37", // Gold / emas
          strokeOpacity: track.isSelected ? 1.0 : 0.4,
          strokeWeight: track.isSelected ? 4 : 2,
          geodesic: true,
        });
        polylineRefs.current.set(track.id, polyline);
        
        // Add click listener to select this track
        polyline.addListener("click", () => {
          setSelectedPersonnelId(track.id);
        });
      }

      // Update path
      const path = track.validWaypoints.map((wp) => ({ lat: wp.lat, lng: wp.lng }));
      polyline.setPath(path);
      
      // Update styling based on selection
      polyline.setOptions({
        strokeColor: track.isSelected ? "#D4AF37" : (selectedPersonnelId ? "#475569" : "#D4AF37"),
        strokeOpacity: track.isSelected ? 1.0 : (selectedPersonnelId ? 0.2 : 0.4),
        strokeWeight: track.isSelected ? 4 : 2,
        zIndex: track.isSelected ? 100 : 10,
      });
    });

    // Clean up
    return () => {
      // We don't remove them on every render because we memoize and mutate them.
      // But if the component unmounts entirely we would clean them up.
    };
  }, [map, filteredTracks, selectedPersonnelId, setSelectedPersonnelId]);

  // Clean all polylines on unmount
  useEffect(() => {
    return () => {
      polylineRefs.current.forEach((polyline) => {
        polyline.setMap(null);
      });
      polylineRefs.current.clear();
    };
  }, []);

  return (
    <>
      {filteredTracks.map((track) => {
        if (!track.latestPosition) return null;

        const isFaded = selectedPersonnelId && !track.isSelected;

        return (
          <AdvancedMarker
            key={track.id}
            position={{ lat: track.latestPosition.lat, lng: track.latestPosition.lng }}
            onClick={() => setSelectedPersonnelId(track.isSelected ? null : track.id)}
            className="group cursor-pointer"
            zIndex={track.isSelected ? 100 : 20}
          >
            <div className={`transition-opacity duration-300 ${isFaded ? "opacity-30 hover:opacity-100" : "opacity-100"}`}>
               {/* Personnel Core Icon */}
               <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-brand-gold)] shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                 <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
               </div>
               
               {/* Tooltip / Label */}
               <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--color-border)] bg-[rgba(11,27,50,0.85)] px-3 py-1.5 shadow-lg backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 min-w-max">
                 <div className="text-[10px] uppercase tracking-widest text-[var(--color-brand-gold)] border-b border-[var(--color-border)] pb-1 mb-1 font-bold">
                   {track.nrp}
                 </div>
                 <div className="text-xs font-medium text-white">{track.name}</div>
                 <div className="text-[9px] text-[var(--color-subtle)] mt-1">
                   {new Date(track.latestPosition.timestamp).toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' })} WITA
                 </div>
               </div>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}
