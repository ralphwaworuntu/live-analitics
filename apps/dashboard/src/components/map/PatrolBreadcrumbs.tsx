"use client";

import { useEffect, useMemo, useRef } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useAppStore } from "@/store";
import { Bike, Car } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatrolBreadcrumbs() {
  const map = useMap();
  const personnelTracks = useAppStore((state) => state.personnelTracks);
  const selectedPersonnelId = useAppStore((state) => state.selectedPersonnelId);
  const setSelectedPersonnelId = useAppStore((state) => state.setSelectedPersonnelId);
  const activeShift = useAppStore((state) => state.activeShift);

  const polylineRefs = useRef<Map<string, google.maps.Polyline>>(new Map());

  // Logic Shift & PCI Segmentation: 
  // Pagi (08:00 - 20:00) -> 480 to 1200 mins
  // Malam (20:00 - 08:00) -> 1200 onwards or before 480
  const filteredTracks = useMemo(() => {
    return personnelTracks.map((track) => {
      const validWaypoints = track.waypoints.filter((wp) => {
        const d = new Date(wp.timestamp);
        const mins = d.getHours() * 60 + d.getMinutes();
        
        if (activeShift === "pagi") {
          return mins >= 480 && mins <= 1200;
        } else {
          // Night shift cross midnight
          return mins >= 1200 || mins <= 480;
        }
      });

      return {
        ...track,
        validWaypoints,
        latestPosition: validWaypoints[validWaypoints.length - 1] || null,
        isSelected: track.id === selectedPersonnelId,
      };
    });
  }, [personnelTracks, selectedPersonnelId, activeShift]);

  // Smoother Polyline Updates
  useEffect(() => {
    if (!map || !window.google?.maps?.Polyline) return;

    filteredTracks.forEach((track) => {
      let polyline = polylineRefs.current.get(track.id);

      if (!polyline) {
        polyline = new window.google.maps.Polyline({
          map,
          strokeColor: "#2F7CF2",
          strokeOpacity: 0.5,
          strokeWeight: 3,
          geodesic: true,
        });
        polylineRefs.current.set(track.id, polyline);
      }

      const path = track.validWaypoints.map((wp) => ({ lat: wp.lat, lng: wp.lng }));
      polyline.setPath(path);
      
      polyline.setOptions({
        strokeColor: track.isSelected ? "#D4AF37" : "#2F7CF2",
        strokeOpacity: track.isSelected ? 0.9 : 0.4,
        strokeWeight: track.isSelected ? 5 : 3,
        zIndex: track.isSelected ? 100 : 10,
      });
    });

    return () => {
      // Clean up logic if tracks are removed
    };
  }, [map, filteredTracks]);

  return (
    <>
      <AnimatePresence mode="popLayout">
        {filteredTracks.map((track) => {
          if (!track.latestPosition) return null;
          const isFaded = selectedPersonnelId && !track.isSelected;

          return (
            <AdvancedMarker
              key={track.id}
              position={{ lat: track.latestPosition.lat, lng: track.latestPosition.lng }}
              onClick={() => setSelectedPersonnelId(track.isSelected ? null : track.id)}
              zIndex={track.isSelected ? 110 : 20}
            >
              <motion.div
                layout
                initial={{ scale: 0 }}
                animate={{ 
                  scale: isFaded ? 0.8 : 1.1,
                  opacity: isFaded ? 0.3 : 1
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group cursor-pointer"
              >
                 {/* Live Pulse Animation for Smooth Interpolation Feel */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className={`absolute h-14 w-14 rounded-full border-2 ${track.isSelected ? "border-[#D4AF37]" : "border-blue-500/50"}`}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                 </div>

                 {/* Unit Icon */}
                 <div className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#07111F] bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] ${track.isSelected ? "shadow-[#D4AF37]/60" : ""}`}>
                    {track.unitType === "R2" ? (
                      <Bike size={20} className="text-[#07111F]" />
                    ) : (
                      <Car size={20} className="text-[#07111F]" />
                    )}
                 </div>
                 
                 <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/80 px-2 py-1 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="text-[9px] font-bold text-white uppercase">{track.name} ({track.nrp})</div>
                   <div className="text-[7px] text-slate-400 mt-0.5">{track.polresId} | {track.unitType}</div>
                 </div>
              </motion.div>
            </AdvancedMarker>
          );
        })}
      </AnimatePresence>
    </>
  );
}
