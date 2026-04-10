"use client";

import { useMemo } from "react";
import { Circle, AdvancedMarker } from "@vis.gl/react-google-maps";
import { BrainCircuit } from "lucide-react";

// Mock predictive hotspots based on Kupang area
const MOCK_HOTSPOTS = [
  { id: "hot-1", lat: -10.160, lng: 123.600, radius: 800, intensity: 0.6, type: "Curat" },
  { id: "hot-2", lat: -10.175, lng: 123.590, radius: 1200, intensity: 0.8, type: "Curas" },
  { id: "hot-3", lat: -10.150, lng: 123.615, radius: 500, intensity: 0.4, type: "Curanmor" },
  { id: "hot-4", lat: -10.165, lng: 123.575, radius: 1000, intensity: 0.7, type: "Bentrok" },
];

export default function PredictiveHotspotLayer() {
  const enabled = true; // For now default to true

  if (!enabled) return null;

  return (
    <>
      {MOCK_HOTSPOTS.map((hot) => (
        <div key={hot.id}>
          {/* Intensity Ring */}
          <Circle
            center={{ lat: hot.lat, lng: hot.lng }}
            radius={hot.radius}
            strokeColor="#A855F7" // Purple
            strokeOpacity={0.6 * hot.intensity}
            strokeWeight={2}
            fillColor="#A855F7"
            fillOpacity={0.2 * hot.intensity}
          />
          {/* Pulsing Core */}
          <Circle
            center={{ lat: hot.lat, lng: hot.lng }}
            radius={hot.radius / 3}
            strokeColor="#A855F7"
            strokeOpacity={0}
            strokeWeight={0}
            fillColor="#A855F7"
            fillOpacity={0.4 * hot.intensity}
          />
          {/* Strategic Label */}
          <AdvancedMarker position={{ lat: hot.lat, lng: hot.lng }}>
            <div className="flex flex-col items-center justify-center transform -translate-y-4">
               <div className="bg-purple-600/20 border border-purple-500/50 p-1.5 rounded-full backdrop-blur-md animate-pulse">
                  <BrainCircuit size={12} className="text-purple-400" />
               </div>
               <div className="bg-black/80 border-l-2 border-l-purple-500 text-[8px] text-purple-200 px-2 py-1 mt-1 rounded uppercase tracking-[0.2em] font-black backdrop-blur-sm shadow-xl">
                  AI PREDICTION: {hot.type} ({(hot.intensity * 100).toFixed(0)}%)
               </div>
            </div>
          </AdvancedMarker>
        </div>
      ))}
    </>
  );
}
