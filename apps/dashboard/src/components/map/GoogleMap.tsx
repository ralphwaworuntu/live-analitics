"use client";

import { useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, AdvancedMarker, Map, Pin, useMap } from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";

import TimeSlider from "@/components/map/TimeSlider";
import PatrolBreadcrumbs from "@/components/map/PatrolBreadcrumbs";
import { getSelectedPolres, useAppStore } from "@/store";
import type { PolresItem } from "@/lib/types";
import LiveReportTicker from "@/components/map/LiveReportTicker";
import { useState, useCallback } from "react";
import { Navigation, Target, Plus, ShieldCheck, Newspaper, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function MapController({ selectedPolres }: { selectedPolres: PolresItem | null }) {
  const map = useMap();
  const emergency = useAppStore((state) => state.emergency);
  const circlesRef = useRef<google.maps.Circle[]>([]);

  useEffect(() => {
    if (!map) return;
    if (selectedPolres) {
      map.panTo({ lat: selectedPolres.lat, lng: selectedPolres.lng });
      map.setZoom(12);
    } else {
      map.panTo({ lat: -9.0, lng: 121.5 });
      map.setZoom(7);
    }
  }, [map, selectedPolres]);

  useEffect(() => {
    if (!map) return;

    const flyToEmergency = () => {
      if (emergency.lat && emergency.lng) {
        map.panTo({ lat: emergency.lat, lng: emergency.lng });
        map.setZoom(16);
      }
    };

    window.addEventListener('map:fly-to-emergency', flyToEmergency);
    return () => window.removeEventListener('map:fly-to-emergency', flyToEmergency);
  }, [map, emergency]);

  useEffect(() => {
    if (!map) return;
    if (!window.google?.maps?.Circle) return;

    const drawTacticalPlot = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;

      circlesRef.current.forEach(c => c.setMap(null));
      circlesRef.current = [];

      const dangerCircle = new window.google.maps.Circle({
        map,
        center: { lat: detail.lat, lng: detail.lng },
        radius: detail.radius || 5000,
        fillColor: "#D84F5F",
        fillOpacity: 0.12,
        strokeColor: "#D84F5F",
        strokeWeight: 2,
        strokeOpacity: 0.6,
      });

      const safeCircle = new window.google.maps.Circle({
        map,
        center: { lat: detail.lat, lng: detail.lng },
        radius: (detail.radius || 5000) * 0.4,
        fillColor: "#18C29C",
        fillOpacity: 0.15,
        strokeColor: "#18C29C",
        strokeWeight: 2,
        strokeOpacity: 0.6,
      });

      circlesRef.current.push(dangerCircle, safeCircle);
      map.panTo({ lat: detail.lat, lng: detail.lng });
      map.setZoom(13);
    };

    window.addEventListener('map:draw-tactical-plot', drawTacticalPlot);
    return () => {
      window.removeEventListener('map:draw-tactical-plot', drawTacticalPlot);
      circlesRef.current.forEach(c => c.setMap(null));
    };
  }, [map]);

  return null;
}

export default function GoogleMap() {
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

  const polres = useAppStore((state) => state.polres);
  const heatmapEnabled = useAppStore((state) => state.heatmapEnabled);
  const predictiveMode = useAppStore((state) => state.predictiveMode);
  const predictionPoints = useAppStore((state) => state.predictionPoints);
  const activeMissions = useAppStore((state) => state.activeMissions);
  const dispatchMission = useAppStore((state) => state.dispatchMission);
  const selectedPolres = useAppStore(getSelectedPolres);
  const setSelectedPolres = useAppStore((state) => state.setSelectedPolres);
  const emergency = useAppStore((state) => state.emergency);
  const osintSignals = useAppStore((state) => state.osintSignals);
  const osintEnabled = useAppStore((state) => state.osintEnabled);
  const sandboxMode = useAppStore((state) => state.sandboxMode);

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, lat: number, lng: number } | null>(null);

  const handleRightClick = useCallback((e: MapMouseEvent) => {
    if (e.detail.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      
      // Use the raw event to get clientX/Y
      const domEvent = (e as any).domEvent as MouseEvent;
      setContextMenu({ 
        x: domEvent.clientX, 
        y: domEvent.clientY, 
        lat, 
        lng 
      });
    }
  }, []);

  const handleDispatch = (type: "mission" | "checkpoint") => {
    if (!contextMenu) return;
    
    if (type === "mission") {
      dispatchMission({
        title: "Respon Taktis",
        description: `Perintah dispersi massa/pengamanan di koordinat ${contextMenu.lat.toFixed(4)}, ${contextMenu.lng.toFixed(4)}`,
        status: "en-route",
        assignedPersonnelId: "UNIT-REBELS-" + Math.floor(Math.random() * 900 + 100),
        targetLat: contextMenu.lat,
        targetLng: contextMenu.lng,
        etaMinutes: 8
      });
    }
    setContextMenu(null);
  };

  const highlightedHeatPoints = useMemo(() => {
    return polres.filter(p => p.status !== 'kondusif').map(p => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      weight: (p.status as string) === 'kritis' ? 30 : 15
    }));
  }, [polres]);

  const visiblePolres = useMemo(() => {
    if (!selectedPolres) {
      return polres;
    }
    return polres.filter((item) => item.id === selectedPolres.id);
  }, [polres, selectedPolres]);

  if (!apiKey) {
    return (
      <div className="relative flex h-full min-h-[480px] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fdfefe,#f1f6fc)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,103,204,0.03)_1px,transparent_1px),linear-gradient(rgba(31,103,204,0.03)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6">
          <div className="rounded-[30px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-float)] sm:p-8">
            <div className="eyebrow">Fallback Tactical View</div>
            <h3 className="mt-4 text-2xl font-semibold text-[var(--color-text)]">Map engine belum diaktifkan</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-[15px]">
              Tambahkan `NEXT_PUBLIC_GOOGLE_MAPS_KEY` untuk memunculkan peta live. Sementara itu, navigasi wilayah tetap aktif dan sinkron ke seluruh workspace.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {visiblePolres.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedPolres(item.id);
                    router.push(`/polres/${item.id}`);
                  }}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-4 text-left transition-colors hover:border-[var(--color-brand-primary)]/40 hover:bg-[var(--color-surface-2)]"
                >
                  <div className="text-sm font-medium text-[var(--color-text)]">{item.name}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                    {item.status} | {item.island}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <TimeSlider />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[480px] w-full overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: -9.0, lng: 121.5 }}
          defaultZoom={7}
          mapId="SENTINEL_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI
          onContextmenu={handleRightClick}
          onClick={() => setContextMenu(null)}
          style={{ width: "100%", height: "100%" }}
        >
          {polres.map((item) => (
            <AdvancedMarker
              key={item.id}
              position={{ lat: item.lat, lng: item.lng }}
              onClick={() => {
                setSelectedPolres(item.id);
                router.push(`/polres/${item.id}`);
              }}
              className="group cursor-pointer"
            >
              <div className="relative">
                <Pin
                  background={
                    item.status === "kondusif"
                      ? "var(--color-success)"
                      : item.status === "waspada"
                        ? "var(--color-brand-gold)"
                        : "var(--color-danger)"
                  }
                  borderColor={selectedPolres?.id === item.id ? "#18324d" : "rgba(24,50,77,0.28)"}
                  glyphColor="white"
                />
                
                {/* TACTICAL HOVERCARD */}
                <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 flex-col items-center group-hover:flex">
                  <div className="glass-card flex min-w-[200px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] p-3 shadow-lg">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-brand-gold)]">
                      {item.name}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-[var(--color-text)]">
                      <span>Status:</span>
                      <span className="font-semibold uppercase text-white">{item.status}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-[var(--color-text)]">
                      <span>Personil:</span>
                      <span className="font-mono text-white">{item.online}/{item.personnel} Aktif</span>
                    </div>
                  </div>
                  <div className="h-2 w-2 origin-top-left -translate-x-1/2 rotate-45 border-b border-r border-[var(--color-border)] bg-[rgba(11,27,50,0.8)]" />
                </div>

              </div>
            </AdvancedMarker>
          ))}

          <MapController selectedPolres={selectedPolres} />
          
          <PatrolBreadcrumbs />

          {/* Predictive AI Heatmap (Purple) */}
          {predictiveMode && predictionPoints.map((point) => (
            <AdvancedMarker key={point.id} position={{ lat: point.lat, lng: point.lng }}>
               <div className="relative group/pred">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-purple-400 bg-purple-600/40 text-[11px] font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse">
                    {point.confidence}%
                  </div>
                  {/* Confidence Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/pred:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="bg-slate-900/95 border border-purple-500/30 p-2 rounded-lg backdrop-blur-md shadow-2xl">
                      <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1">{point.label}</div>
                      <div className="text-[9px] text-white/80 leading-relaxed font-mono">{point.reasoning}</div>
                    </div>
                  </div>
               </div>
            </AdvancedMarker>
          ))}

          {/* OSINT Signals (Radio Waves) */}
          {osintEnabled && osintSignals.map((sig) => (
            <AdvancedMarker key={sig.id} position={{ lat: sig.lat, lng: sig.lng }}>
               <div className="relative group/osint">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 bg-orange-500/20 text-white shadow-lg backdrop-blur-md transition-all group-hover/osint:scale-110 ${
                    sig.sentiment === "negative" || sig.sentiment === "provocative" ? "border-orange-500 animate-pulse" : "border-orange-300"
                  }`}>
                    {sig.source === "X" ? <MessageSquare className="w-5 h-5 text-orange-400" /> : <Newspaper className="w-5 h-5 text-orange-400" />}
                  </div>
                  
                  {/* OSINT News Bubble */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 opacity-0 group-hover/osint:opacity-100 transition-all pointer-events-none z-50">
                    <div className="bg-slate-950/95 border border-orange-500/30 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{sig.source} Intelligence</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                          <span className="text-[9px] text-white/40 font-mono">LIVE</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-white/90 leading-relaxed font-medium mb-2 line-clamp-3">&ldquo;{sig.content}&rdquo;</p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">Viral Score: {sig.viralScore}%</span>
                        <span className={`text-[9px] font-bold uppercase ${
                          sig.sentiment === "negative" ? "text-red-400" : "text-orange-400"
                        }`}>{sig.sentiment}</span>
                      </div>
                    </div>
                    <div className="h-3 w-3 bg-slate-950/95 border-r border-b border-orange-500/30 rotate-45 mx-auto -mt-1.5" />
                  </div>
               </div>
            </AdvancedMarker>
          ))}

          {/* Tactical Mission Compasses */}
          {activeMissions.filter(m => m.status === "en-route").map((msn) => (
            <AdvancedMarker key={msn.id} position={{ lat: msn.targetLat, lng: msn.targetLng }}>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500/20 border border-blue-400 p-1.5 rounded-full animate-ping absolute" />
                <Target className="w-6 h-6 text-blue-400 relative" />
                <div className="mt-1 bg-blue-500 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter shadow-lg">
                  OBJ: {msn.assignedPersonnelId}
                </div>
              </div>
            </AdvancedMarker>
          ))}

          {heatmapEnabled && !predictiveMode
            ? highlightedHeatPoints.map((point) => (
                <AdvancedMarker key={point.id} position={{ lat: point.lat, lng: point.lng }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-[rgba(216,79,95,0.82)] text-[11px] font-semibold text-white shadow-[0_0_16px_rgba(216,79,95,0.22)]">
                    {point.weight}
                  </div>
                </AdvancedMarker>
              ))
            : null}
        </Map>

        {/* Custom Context Menu */}
        <AnimatePresence>
          {contextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              className="fixed z-[100] w-56 rounded-xl border border-white/10 bg-slate-950/90 p-1 shadow-2xl backdrop-blur-xl"
            >
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <div className="text-[9px] text-white/40 uppercase tracking-widest font-mono">
                  Coordinates: {contextMenu.lat.toFixed(4)}, {contextMenu.lng.toFixed(4)}
                </div>
              </div>
              <button
                onClick={() => handleDispatch("mission")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Kirim Unit Terdekat
              </button>
              <button
                onClick={() => handleDispatch("checkpoint")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white hover:bg-[var(--color-brand-gold)]/20 hover:text-[var(--color-brand-gold)] transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Buat Titik Kumpul
              </button>
              <div className="h-px bg-white/5 my-1" />
              <button
                onClick={() => setContextMenu(null)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/50 hover:bg-white/5 transition-colors"
              >
                <Plus className="w-4 h-4 rotate-45" />
                Batalkan
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 bg-transparent" />
        <TimeSlider />
        <LiveReportTicker />
        <div className="pointer-events-none absolute left-5 top-5 z-10 max-w-sm rounded-[24px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.92)] px-4 py-4 backdrop-blur-xl">
          <div className="eyebrow">Map Overlay</div>
          <div className="mt-3 text-sm text-[var(--color-text)]">
            {selectedPolres ? selectedPolres.name : "Regional Situation Board"}
          </div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">
            {heatmapEnabled ? "Heat layer active. " : "Marker focus active. "}
            Klik wilayah untuk mengunci context drawer, AI brief, dan dashboard state.
          </div>
        </div>
        {emergency.active ? (
          <div className="pointer-events-none absolute right-5 top-5 z-10 rounded-[24px] border border-[var(--color-danger)] bg-[rgba(255,255,255,0.95)] px-4 py-4 text-xs shadow-[var(--shadow-glow-danger)] backdrop-blur-xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-danger)]">Emergency Focus</div>
            <div className="mt-2 text-sm text-[var(--color-text)]">{emergency.message}</div>
            <div className="mt-1 text-[var(--color-muted)]">{emergency.location}</div>
          </div>
        ) : null}
      </APIProvider>
    </div>
  );
}
