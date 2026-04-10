"use client";

import { useMemo } from "react";
import { Circle, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useAppStore } from "@/store";
import { MessageSquareWarning } from "lucide-react";

export default function SentimentCloudLayer() {
  const osintSignals = useAppStore((s) => s.osintSignals);
  const osintEnabled = useAppStore((s) => s.osintEnabled);

  // We only want negative/provocative sentiment with lat/lng
  const clusters = useMemo(() => {
    if (!osintEnabled) return [];
    
    // Fake some lat/lng for signals that don't have them
    return osintSignals
      .filter((sig) => sig.sentiment === "negative" || sig.sentiment === "provocative")
      .map((sig) => {
        // Pseudo-random based on ID char codes to be deterministic
        const pseudoRand = sig.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100 / 100;
        return {
          ...sig,
          // Mocking coordinates near Kupang if none exist for demonstration
          lat: sig.lat || -10.15 + (pseudoRand - 0.5) * 0.1,
          lng: sig.lng || 123.58 + ((pseudoRand * 1.5) % 1 - 0.5) * 0.1,
        };
      });
  }, [osintSignals, osintEnabled]);

  if (!osintEnabled) return null;

  return (
    <>
      {clusters.map((c) => (
        <div key={`sentiment-${c.id}`}>
          {/* Heat bubble */}
          <Circle
            center={{ lat: c.lat, lng: c.lng }}
            radius={c.viralScore * 30} // 30m per viral score point
            strokeColor="#EF4444"
            strokeOpacity={0.4}
            strokeWeight={1}
            fillColor="#EF4444"
            fillOpacity={0.2}
          />
          {/* Marker label */}
          <AdvancedMarker position={{ lat: c.lat, lng: c.lng }}>
            <div className="flex animate-pulse flex-col items-center justify-center transform -translate-y-4">
              <MessageSquareWarning size={14} className="text-red-500 drop-shadow-md" />
              <div className="bg-red-950/80 border border-red-500/50 text-[8px] text-red-100 px-2 py-0.5 mt-1 rounded uppercase tracking-widest backdrop-blur-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                {c.content.substring(0, 20)}...
              </div>
            </div>
          </AdvancedMarker>
        </div>
      ))}
    </>
  );
}
