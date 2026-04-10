"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useAppStore } from "@/store";
import { useLiveTracking } from "@/hooks/useLiveTracking";
import LiveUnitMarker from "@/components/map/LiveUnitMarker";
import GeofenceLayer from "@/components/map/GeofenceLayer";
import DispatchLineOverlay from "@/components/map/DispatchLineOverlay";
import SentimentCloudLayer from "@/components/map/SentimentCloudLayer";
import PredictiveHotspotLayer from "@/components/map/PredictiveHotspotLayer";
import { cn } from "@/lib/utils";
import {
  Layers,
  Crosshair,
  Radio,
  TrafficCone,
  Satellite,
  Map as MapIconLucide,
  Moon,
  X,
  Shield,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Traffic Layer ---
function TrafficLayer() {
  const map = useMap();
  const enabled = useAppStore((s) => s.trafficLayerEnabled);

  useEffect(() => {
    if (!map || !google?.maps) return;
    if (!enabled) return;

    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    return () => {
      trafficLayer.setMap(null);
    };
  }, [map, enabled]);

  return null;
}

// --- Map Type Controller ---
function MapTypeController() {
  const map = useMap();
  const mapTypeId = useAppStore((s) => s.mapTypeId);

  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(mapTypeId);
  }, [map, mapTypeId]);

  return null;
}

// --- Map Center Controller ---
function MapCenterController() {
  const map = useMap();
  const mapCenter = useAppStore((s) => s.mapCenter);
  const emergency = useAppStore((s) => s.emergency);

  useEffect(() => {
    if (!map) return;
    if (emergency.active && emergency.lat && emergency.lng) {
      map.panTo({ lat: emergency.lat, lng: emergency.lng });
      map.setZoom(16);
      return;
    }
    if (mapCenter) {
      map.panTo({ lat: mapCenter.lat, lng: mapCenter.lng });
      if (mapCenter.zoom) map.setZoom(mapCenter.zoom);
    }
  }, [map, mapCenter, emergency]);

  return null;
}

// --- Layer Toggle Panel ---
function LayerTogglePanel() {
  const { mapTypeId, setMapTypeId, trafficLayerEnabled, setTrafficLayer } = useAppStore();

  const layers: { id: "roadmap" | "satellite" | "hybrid"; label: string; icon: React.ElementType }[] = [
    { id: "roadmap", label: "Street", icon: MapIconLucide },
    { id: "satellite", label: "Satellite", icon: Satellite },
    { id: "hybrid", label: "Dark Tactical", icon: Moon },
  ];

  return (
    <div className="absolute top-4 right-4 z-10 bg-[#0B1B32]/95 border border-white/10 p-3 rounded-2xl flex flex-col gap-2 min-w-[170px] backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-2 px-2 mb-1">
        <Layers size={12} className="text-[#D4AF37]" />
        <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">Map Layers</span>
      </div>

      {layers.map((layer) => (
        <button
          key={layer.id}
          onClick={() => setMapTypeId(layer.id)}
          className={cn(
            "px-3 py-2 rounded-xl text-[10px] font-black border uppercase text-left flex items-center justify-between transition-all",
            mapTypeId === layer.id
              ? "bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37]"
              : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300"
          )}
        >
          <div className="flex items-center gap-2">
            <layer.icon size={12} />
            <span>{layer.label}</span>
          </div>
          <div className={cn("w-2 h-2 rounded-full", mapTypeId === layer.id ? "bg-[#D4AF37]" : "bg-slate-700")} />
        </button>
      ))}

      <div className="border-t border-white/5 mt-1 pt-2">
        <button
          onClick={() => setTrafficLayer(!trafficLayerEnabled)}
          className={cn(
            "w-full px-3 py-2 rounded-xl text-[10px] font-black border uppercase text-left flex items-center justify-between transition-all",
            trafficLayerEnabled
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300"
          )}
        >
          <div className="flex items-center gap-2">
            <TrafficCone size={12} />
            <span>Live Traffic</span>
          </div>
          <div className={cn("w-2 h-2 rounded-full", trafficLayerEnabled ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-slate-700")} />
        </button>
      </div>
    </div>
  );
}

// --- Geofence Alerts Sidebar ---
function GeofenceAlertsSidebar() {
  const alerts = useAppStore((s) => s.geofenceAlerts);
  const [open, setOpen] = useState(false);

  if (alerts.length === 0 && !open) return null;

  return (
    <div className="absolute top-4 left-4 z-10">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all backdrop-blur-xl shadow-lg",
          alerts.length > 0
            ? "bg-red-500/20 border-red-500/30 text-red-400"
            : "bg-white/5 border-white/5 text-slate-500"
        )}
      >
        <Bell size={12} />
        <span>Geofence Alerts</span>
        {alerts.length > 0 && (
          <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[8px] font-black min-w-[18px] text-center">
            {alerts.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 bg-[#0B1B32]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl max-h-[300px] overflow-y-auto w-[320px]"
          >
            <div className="p-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Recent Breaches</span>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <div className="p-2 space-y-1">
              {alerts.slice(0, 10).map((alert, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5 text-[9px]">
                  <div className="font-black text-white uppercase leading-tight">{alert.message}</div>
                  <div className="text-slate-500 font-mono mt-1">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Nearest Unit Finder ---
interface FindNearestProps {
  onActivate: (lat: number, lng: number) => void;
  onDeactivate: () => void;
  active: boolean;
}

function FindNearestButton({ onActivate, onDeactivate, active }: FindNearestProps) {
  const map = useMap();

  const handleClick = () => {
    if (active) {
      onDeactivate();
      return;
    }
    if (!map) return;
    const center = map.getCenter();
    if (center) {
      onActivate(center.lat(), center.lng());
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all shadow-2xl backdrop-blur-xl",
          active
            ? "bg-[#D4AF37] text-[#0B1B32] border-[#D4AF37] shadow-[#D4AF37]/30"
            : "bg-[#0B1B32]/95 text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#D4AF37]/10"
        )}
      >
        {active ? (
          <>
            <X size={16} />
            <span>Cancel Dispatch Mode</span>
          </>
        ) : (
          <>
            <Crosshair size={16} />
            <span>Find Nearest Units</span>
          </>
        )}
      </button>
    </div>
  );
}

// --- Status Bar ---
function OperationalStatusBar({ trackCount }: { trackCount: number }) {
  const onlineCount = useAppStore((s) =>
    s.personnelTracks.filter((t) => t.connectionType !== "none" && t.signalStatus !== "No Signal").length
  );
  const sosCount = useAppStore((s) => s.personnelTracks.filter((t) => t.isSOS).length);

  return (
    <div className="absolute bottom-6 right-4 z-10 flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#0B1B32]/95 border border-white/10 rounded-xl backdrop-blur-xl shadow-lg">
        <Radio size={10} className="text-emerald-500 animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">{onlineCount} Online</span>
        <div className="w-px h-3 bg-white/10" />
        <Shield size={10} className="text-blue-400" />
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{trackCount} Units</span>
        {sosCount > 0 && (
          <>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-[9px] font-black uppercase tracking-wider text-red-500 animate-pulse">{sosCount} SOS</span>
          </>
        )}
      </div>
    </div>
  );
}

// =================================================================
// MAIN VIEW
// =================================================================

const EXTERNAL_MOCKS = [
  {
    id: "ext-1",
    name: "Ambulance RS Bhayangkara",
    nrp: "EXT",
    role: "medical",
    batteryLevel: 100,
    signalStatus: "LTE" as const,
    speed: 0,
    heading: 45,
    dutyStartedAt: "2025-01-01T00:00:00.000Z",
    waypoints: [{ lat: -10.165, lng: 123.595, timestamp: 0 }]
  },
  {
    id: "ext-2",
    name: "Damkar Kota",
    nrp: "EXT",
    role: "fire",
    batteryLevel: 100,
    signalStatus: "LTE" as const,
    speed: 0,
    heading: 90,
    dutyStartedAt: "2025-01-01T00:00:00.000Z",
    waypoints: [{ lat: -10.150, lng: 123.580, timestamp: 0 }]
  }
];

export default function OperationsView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
  const selectedPersonnelId = useAppStore((s) => s.selectedPersonnelId);
  const setSelectedPersonnelId = useAppStore((s) => s.setSelectedPersonnelId);
  const setMapCenter = useAppStore((s) => s.setMapCenter);

  const { tracks, nearestUnits } = useLiveTracking();

  // Dispatch targeting state
  const [dispatchActive, setDispatchActive] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState<{ lat: number; lng: number } | null>(null);

  const activateDispatch = useCallback(
    (lat: number, lng: number) => {
      setDispatchActive(true);
      setDispatchTarget({ lat, lng });
    },
    []
  );

  const deactivateDispatch = useCallback(() => {
    setDispatchActive(false);
    setDispatchTarget(null);
  }, []);

  const computedNearest = useMemo(() => {
    if (!dispatchTarget || !dispatchActive) return [];
    return nearestUnits(dispatchTarget.lat, dispatchTarget.lng, 3);
  }, [dispatchTarget, nearestUnits, dispatchActive]);

  const handleSelectUnit = useCallback(
    (id: string) => {
      setSelectedPersonnelId(id);
      const track = tracks.find((t) => t.id === id);
      if (track) {
        const wp = track.waypoints[track.waypoints.length - 1];
        if (wp) setMapCenter({ lat: wp.lat, lng: wp.lng, zoom: 15 });
      }
    },
    [tracks, setSelectedPersonnelId, setMapCenter]
  );
  
  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_KEY") {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#07111F] text-slate-500 gap-4">
        <div className="p-6 rounded-full bg-white/5 animate-pulse">
          <MapIconLucide className="w-10 h-10 text-slate-600" />
        </div>
        <span className="text-xs font-black uppercase tracking-[0.2em]">Operations Map Offline (No Valid API Key)</span>
        <p className="text-[10px] text-slate-600 max-w-sm text-center">
          Set NEXT_PUBLIC_GOOGLE_MAPS_KEY in your .env.local to enable the live GIS tracking engine.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07111F]">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: -9.0, lng: 121.5 }}
          defaultZoom={7}
          mapId="SENTINEL_OPS_MAP"
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: "100%", height: "100%" }}
        >
          <MapTypeController />
          <MapCenterController />
          <TrafficLayer />
          <GeofenceLayer />
          <SentimentCloudLayer />
          <PredictiveHotspotLayer />

          {/* External Agencies Mock */}
          {EXTERNAL_MOCKS.map(ext => (
            <LiveUnitMarker 
               key={ext.id}
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               track={ext as any}
               isSelected={false}
               onSelect={() => {}}
               isExternal={true}
            />
          ))}

          {/* Live Unit Markers */}
          {tracks.map((track) => (
            <LiveUnitMarker
              key={track.id}
              track={track}
              isSelected={selectedPersonnelId === track.id}
              onSelect={handleSelectUnit}
            />
          ))}

          {/* Dispatch Lines */}
          {dispatchTarget && (
            <DispatchLineOverlay
              incidentLat={dispatchTarget.lat}
              incidentLng={dispatchTarget.lng}
              nearestUnits={computedNearest}
              visible={dispatchActive}
            />
          )}
        </Map>
      </APIProvider>

      {/* HUD Overlays */}
      <LayerTogglePanel />
      <GeofenceAlertsSidebar />
      <FindNearestButton
        onActivate={activateDispatch}
        onDeactivate={deactivateDispatch}
        active={dispatchActive}
      />
      <OperationalStatusBar trackCount={tracks.length} />
    </div>
  );
}
