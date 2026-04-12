"use client";

import { useEffect, useMemo, Fragment, useState } from "react";
import { APIProvider, Map, useMap, AdvancedMarker, Polyline, Polygon } from "@vis.gl/react-google-maps";
import { getSelectedPolres, useAppStore } from "@/store";
import type { PolisiItem, PolicePost, EmergencyState, CctvPoint, ShadowHotspot, FieldReport } from "@/lib/types";
import { 
  TowerControl, 
  Siren, 
  Video, 
  Layers, 
  Activity, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Battery,
  Ghost,
  EyeOff,
  Mic,
  Map as MapIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import SmartDispatchModal from "@/components/map/SmartDispatchModal";
import { HeatmapLayer } from "./HeatmapLayer";
import { TacticalCompass } from "./TacticalCompass";
import { MapErrorBoundary } from "./MapErrorBoundary";
import { mockMobileReports } from "@/lib/mockMobileReports";

// SOS Pulse Animation CSS
const pulseStyles = `
  @keyframes tactical-pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  .animate-tactical-pulse {
    animation: tactical-pulse 2s infinite;
  }
`;

function MapController({ selectedPolres, emergency, mapCenter }: { 
  selectedPolres: PolisiItem | null, 
  emergency: EmergencyState,
  mapCenter: { lat: number; lng: number, zoom?: number } | null
}) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    try {
      if (emergency.active && emergency.lat && emergency.lng) {
         map.panTo({ lat: emergency.lat, lng: emergency.lng });
         map.setZoom(16);
         return;
      }
      if (mapCenter) {
        map.panTo({ lat: mapCenter.lat, lng: mapCenter.lng });
        if (mapCenter.zoom) map.setZoom(mapCenter.zoom);
        return;
      }
      if (selectedPolres) {
        map.panTo({ lat: selectedPolres.lat, lng: selectedPolres.lng });
        map.setZoom(11);
      }
    } catch (err) {
      console.warn("[MapController] Map error:", err);
    }
  }, [map, selectedPolres, emergency, mapCenter]);
  return null;
}

function HeatmapLayerWrapper() {
  const map = useMap();
  return <HeatmapLayer map={map} />;
}

function FieldReportsLayer({ reports, undercoverVisible }: { reports: FieldReport[], undercoverVisible: boolean }) {
  const setDispatchModal = useAppStore(state => state.setDispatchModal);
  
  const visibleReports = useMemo(() => {
     if (!reports?.length) return [];
     return reports.filter(r => r && (undercoverVisible || !r.isUndercover));
  }, [reports, undercoverVisible]);

  return (
    <>
      {visibleReports.map(report => {
        if (!report) return null;
        return (
          <AdvancedMarker 
            key={report.id} 
            position={{ lat: report.lat, lng: report.lng }}
            onClick={() => setDispatchModal(true, report)}
          >
            <div className={cn(
              "p-1 rounded-full border-2 cursor-pointer shadow-xl relative group",
              report.isSOS ? "bg-red-600 border-white text-white animate-bounce" : "bg-white border-red-600 text-red-600",
              report.isFakeGPS && "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)]",
              report.isUndercover && "opacity-40 animate-pulse"
            )}>
               {report.isUndercover ? <Ghost size={14} className="text-slate-400" /> : 
                report.isFakeGPS ? <Ghost size={14} className="text-yellow-600 animate-pulse" /> : 
                <AlertTriangle size={14} className={report.isSOS ? "animate-pulse" : ""} />}
               
               <div className="absolute top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-[#0B1B32] border border-white/10 p-4 rounded-2xl text-[10px] text-white shadow-2xl z-50 min-w-[200px]">
                  <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                     <div className="flex flex-col">
                        <span className="font-black uppercase tracking-tighter text-blue-400">Personnel Track</span>
                        <span className="text-lg font-black italic uppercase leading-none">{report.personnelName}</span>
                     </div>
                     {report.isUndercover && <Badge variant="gold" className="text-[8px] px-1.5 py-0">UNDERCOVER</Badge>}
                  </div>
                  
                  <div className="space-y-2">
                     {report.isSOS && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                           <Mic size={12} className="text-red-500 animate-pulse" />
                           <span className="text-[9px] font-black uppercase text-red-400 tracking-widest">Evidence Log Streaming...</span>
                        </div>
                     )}
                     <div className="flex items-center justify-between">
                        <span className="text-slate-500 uppercase font-black tracking-widest text-[8px]">Battery Telemetry</span>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                           <Battery size={12} className={cn(report.batteryLevel && report.batteryLevel < 20 && "text-red-500")} />
                           <span className="font-mono">{report.batteryLevel || 0}%</span>
                        </div>
                     </div>
                     <div className="mt-3 p-2 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-[7px] text-slate-500 uppercase mb-1">Status Report</div>
                        <div className="text-[9px] font-bold text-slate-300 uppercase leading-snug">{report.textReport?.slice(0, 50) ?? ''}...</div>
                     </div>
                  </div>
               </div>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

function PlaybackControls() {
  const historyTimestamp = useAppStore((state) => state.historyTimestamp ?? 0);
  const setHistoryTimestamp = useAppStore((state) => state.setHistoryTimestamp);
  const playbackActive = useAppStore((state) => state.playbackActive ?? false);
  const setPlaybackActive = useAppStore((state) => state.setPlaybackActive);
  const playbackSpeed = useAppStore((state) => state.playbackSpeed ?? 1);
  const setPlaybackSpeed = useAppStore((state) => state.setPlaybackSpeed);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playbackActive) {
      interval = setInterval(() => {
        setHistoryTimestamp(historyTimestamp >= 1000 ? 0 : historyTimestamp + (1 * playbackSpeed));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [playbackActive, historyTimestamp, setHistoryTimestamp, playbackSpeed]);

  return (
    <div className="absolute top-4 left-4 z-10">
       <div className="bg-[#0B1B32]/95 border border-white/10 backdrop-blur-xl p-4 rounded-3xl shadow-2xl flex items-center gap-6">
          <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center text-[#D4AF37] border border-white/5">
             <Activity size={20} />
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">Route Playback Engine</span>
             <div className="flex items-center gap-4">
                <button onClick={() => setPlaybackActive(!playbackActive)} className={cn("h-8 w-8 rounded-full flex items-center justify-center transition-all", playbackActive ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-[#D4AF37] text-black")}>
                   {playbackActive ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <div className="w-[120px] h-1.5 bg-white/10 rounded-full overflow-hidden relative group cursor-pointer">
                   <div className="h-full bg-[#D4AF37] relative transition-all" style={{ width: `${(historyTimestamp / 1000) * 100}%` }} />
                </div>
                <div className="flex items-center gap-1">
                   {[1, 2, 4].map(s => (
                     <button key={s} onClick={() => setPlaybackSpeed(s)} className={cn("text-[8px] font-black w-5 h-5 rounded flex items-center justify-center border transition-all", playbackSpeed === s ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-white/5 border-white/10 text-slate-500" )}> {s}X </button>
                   ))}
                </div>
                <button onClick={() => setHistoryTimestamp(0)} className="text-slate-500 hover:text-white transition-colors"><RotateCcw size={14} /></button>
             </div>
          </div>
       </div>
    </div>
  );
}

function LayerControls({ undercoverVisible, onToggleUndercover }: { undercoverVisible: boolean, onToggleUndercover: (v: boolean) => void }) {
  const cctvMarkersEnabled = useAppStore((state) => state.cctvMarkersEnabled ?? true);
  const predictiveMode = useAppStore((state) => state.predictiveMode ?? false);
  const setPredictiveMode = useAppStore((state) => state.setPredictiveMode);
  const setCctvMarkers = useAppStore((state) => state.setCctvMarkers);
  return (
    <div className="absolute top-4 right-4 z-10 bg-[#0B1B32]/90 border border-white/10 p-4 rounded-3xl flex flex-col gap-3 min-w-[180px]">
       <div className="flex items-center gap-2 mb-1 px-3">
          <Layers size={14} className="text-[#D4AF37]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">Tactical Overlay</span>
       </div>
       <button onClick={() => setPredictiveMode(!predictiveMode)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black border uppercase text-left flex items-center justify-between", predictiveMode ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-white/5 border-white/5 text-slate-500")}>
          <span>AI Predictions</span>
          <div className={cn("w-2 h-2 rounded-full", predictiveMode ? "bg-red-500 animate-pulse" : "bg-slate-700")} />
       </button>
       <button onClick={() => onToggleUndercover(!undercoverVisible)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black border uppercase text-left flex items-center justify-between", undercoverVisible ? "bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37]" : "bg-white/5 border-white/5 text-slate-500")}>
          <span>Undercover Mode</span>
          {undercoverVisible ? <EyeOff size={12} className="text-[#D4AF37]" /> : <EyeOff size={12} className="text-slate-700 opacity-30" />}
       </button>
       <button onClick={() => setCctvMarkers(!cctvMarkersEnabled)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black border uppercase text-left flex items-center justify-between", cctvMarkersEnabled ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/5 text-slate-500")}>
          <span>CCTV Monitoring</span>
          <div className={cn("w-2 h-2 rounded-full", cctvMarkersEnabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-700")} />
       </button>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: 'danger'|'gold'|'success', className?: string }) {
   return (
      <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", variant === 'danger' && "bg-red-500/10 border-red-500/20 text-red-500", variant === 'gold' && "bg-yellow-500/10 border-yellow-500/20 text-yellow-500", variant === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", className)}>
         {children}
      </span>
   );
}

export default function GoogleMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
  const polres = useAppStore((state) => state.polres ?? []);
  const selectedPolres = useAppStore(getSelectedPolres);
  const emergency = useAppStore((state) => state.emergency);
  const mapCenter = useAppStore((state) => state.mapCenter);
  const posts = useAppStore((state) => state.policePosts ?? []);
  const shadowHotspots = useAppStore((state) => state.shadowHotspots ?? []);
  const predictiveMode = useAppStore((state) => state.predictiveMode ?? false);
  const historyTimestamp = useAppStore((state) => state.historyTimestamp ?? 0);
  const activePatrolRoute = useAppStore((state) => state.activePatrolRoute);
  const cctvPoints = useAppStore((state) => state.cctvPoints ?? []);
  const cctvMarkersEnabled = useAppStore((state) => state.cctvMarkersEnabled ?? true);
  
  const [undercoverVisible, setUndercoverVisible] = useState(false);
  const reports = useMemo(() => mockMobileReports ?? [], []);
  
  const selectedPersonnel = useAppStore((state) => {
    const id = state.selectedPersonnelId;
    return id ? state.personnelTracks.find((t) => t.id === id) : null;
  });
  const selectedPersonnelName = selectedPersonnel?.name;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fallback UI when no API key or not mounted - show Tactical Compass
  if (!isMounted || !apiKey || apiKey === "YOUR_GOOGLE_MAPS_KEY") {
    return (
      <MapErrorBoundary>
        <TacticalCompass />
      </MapErrorBoundary>
    );
  }

  return (
    <MapErrorBoundary personnelName={selectedPersonnelName}>
    <div className="relative h-full w-full overflow-hidden">
      <APIProvider apiKey={apiKey} onLoad={() => console.log("[GoogleMap] API Loaded")} onError={() => setMapError(true)}>
        <Map 
          defaultCenter={{ lat: -9.0, lng: 121.5 }} 
          defaultZoom={7} 
          mapId="SENTINEL_DASHBOARD_MAP_ID" 
          gestureHandling="greedy" 
          disableDefaultUI 
          style={{ width: "100%", height: "100%" }}
          onLoad={() => console.log("[GoogleMap] Map Loaded")}
          onError={() => setMapError(true)}
        >
            <GeoJsonLayer polresList={polres} />
            <PolicePostsLayer posts={posts} />
            <ActiveMissionsLayer />
            <FieldReportsLayer reports={reports} undercoverVisible={undercoverVisible} />
            <HeatmapLayerWrapper />
            <CctvMarkersLayer points={cctvPoints} enabled={cctvMarkersEnabled} />
            <ShadowHotspotsLayer hotspots={shadowHotspots} enabled={predictiveMode} timeShift={historyTimestamp} />
            <AIPatrolRouteLayer route={activePatrolRoute} />
            <GeofenceAlertLayer reports={reports} />
            <MapController selectedPolres={selectedPolres} emergency={emergency} mapCenter={mapCenter} />
         </Map>
         <style>{pulseStyles}</style>
      </APIProvider>
      <PlaybackControls />
      <LayerControls undercoverVisible={undercoverVisible} onToggleUndercover={setUndercoverVisible} />
      <SOSOverlay />
      <SmartDispatchModal />
    </div>
    </MapErrorBoundary>
  );
}

// --- UTILS ---
function GeofenceAlertLayer({ reports }: { reports: FieldReport[] }) {
  const addGeofenceAlert = useAppStore((state) => state.addGeofenceAlert);
  useEffect(() => {
    if (!reports?.length) return;
    try {
      const daniel = reports.find(r => r?.id === "fr-004");
      if (daniel) { 
        addGeofenceAlert({ unitId: daniel.id, message: "GEOFENCE BREACH: Unit Daniel outside Sektor Wolomeze boundary.", timestamp: new Date().toISOString() }); 
      }
    } catch (err) {
      console.warn("[GeofenceAlertLayer] Error:", err);
    }
  }, [reports, addGeofenceAlert]);
  return null;
}

function PolicePostsLayer({ posts }: { posts: PolicePost[] }) {
  if (!posts?.length) return null;
  return (
    <>
      {posts.map(post => {
        if (!post) return null;
        return (
          <AdvancedMarker key={post.id} position={{ lat: post.lat, lng: post.lng }}>
            <div className="bg-white border-2 border-blue-600 rounded-sm p-0.5 shadow-md flex items-center justify-center group cursor-pointer">
               <TowerControl size={10} className="text-blue-700" />
               <div className="absolute top-6 left-1/2 -track-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-slate-900 border border-white/10 p-1.5 rounded text-[8px] text-white whitespace-nowrap z-50">
                  <div className="font-bold">{post.name}</div>
                  <div className="text-blue-400 font-mono tracking-tighter uppercase">{post.type}</div>
               </div>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

function SOSOverlay() {
  const emergency = useAppStore(state => state.emergency);
  const clearEmergency = useAppStore(state => state.clearEmergency);
  const dispatchMission = useAppStore(state => state.dispatchMission);
  const pushNotification = useAppStore(state => state.pushNotification);
  
  const handleAutoDispatch = () => {
    try {
      dispatchMission({
        title: emergency.message || "SOS RESPONSE",
        type: "Darurat",
        description: "Auto-dispatched emergency response via SOS Overlay",
        locationName: emergency.location || "Target",
        priority: "Critical",
        status: "en-route",
        assignedPersonnelId: "P-AUTO",
        unitName: "QUICK-RESPONSE-01",
        targetLat: emergency.lat || -10.158,
        targetLng: emergency.lng || 123.606,
        etaMinutes: 3
      });
      pushNotification({
        title: "Unit Terdekat Dikerahkan",
        description: `Unit QUICK-RESPONSE-01 menuju ke ${emergency.location || "TKP"}.`,
        level: "success"
      });
      clearEmergency();
    } catch (err) {
      console.warn("[SOSOverlay] Dispatch error:", err);
    }
  };

  if (!emergency?.active) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[999] pointer-events-none">
        <div className="absolute inset-0 border-[20px] border-red-600 animate-[pulse_1s_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-slate-950 border-2 border-red-600 p-8 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center">
             <Siren size={40} className="text-white mb-6 animate-bounce" />
             <h2 className="text-3xl font-black text-white uppercase italic">Unit Membutuhkan Bantuan</h2>
             <div className="flex gap-4 mt-8">
                <button onClick={clearEmergency} className="px-6 py-3 bg-white/5 text-slate-500 rounded-xl uppercase font-black text-xs cursor-pointer">Abaikan</button>
                <button onClick={handleAutoDispatch} className="px-6 py-3 bg-red-600 text-white rounded-xl uppercase font-black text-xs cursor-pointer">Kirim Unit Terdekat</button>
             </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function GeoJsonLayer({ polresList }: { polresList: PolisiItem[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !polresList?.length) return;
    try {
      const geoJson = { 
        type: "FeatureCollection", 
        features: polresList.map(p => ({
          type: "Feature", 
          id: p.id, 
          properties: { id: p.id, crimeStatus: p.crimeStatus || "Hijau" },
          geometry: { 
            type: "Polygon", 
            coordinates: [[[p.lng-0.2, p.lat-0.2],[p.lng+0.2, p.lat-0.2],[p.lng+0.2, p.lat+0.2],[p.lng-0.2, p.lat+0.2],[p.lng-0.2, p.lat-0.2]]] 
          }
        }))
      };
      map.data.addGeoJson(geoJson as object);
      map.data.setStyle(f => {
        const c = f.getProperty("crimeStatus") === "Merah" ? "#ef4444" : "#18C29C";
        return { fillColor: c, fillOpacity: 0.1, strokeColor: c, strokeWeight: 1, strokeOpacity: 0.2 };
      });
    } catch (err) {
      console.warn("[GeoJsonLayer] Error:", err);
    }
    return () => { 
      try { map.data.forEach(f => map.data.remove(f)); } 
      catch (e) { /* ignore cleanup errors */ }
    };
  }, [map, polresList]);
  return null;
}

function CctvMarkersLayer({ points, enabled }: { points: CctvPoint[], enabled: boolean }) {
  if (!enabled || !points?.length) return null;
  return (
    <>
      {points.map(cam => {
        if (!cam) return null;
        return (
          <AdvancedMarker key={cam.id} position={{ lat: cam.lat, lng: cam.lng }}>
            <div className="bg-[#0B1B32] border border-[#D4AF37]/50 rounded-full p-1 shadow-lg cursor-pointer group hover:scale-110 transition-transform">
               <Video size={12} className={cam.status === 'Online' ? "text-[#D4AF37]" : "text-slate-600"} />
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

function ShadowHotspotsLayer({ hotspots, enabled, timeShift }: { hotspots: ShadowHotspot[], enabled: boolean, timeShift: number }) {
  if (!enabled || !hotspots?.length) return null;
  const shiftedHotspots = hotspots.map(h => {
    if (!h?.points) return null;
    return { 
      ...h, 
      points: h.points.map(p => ({ 
        lat: (p?.lat ?? 0) + (timeShift / 10000), 
        lng: (p?.lng ?? 0) + (timeShift / 10000) 
      }))
    };
  }).filter(Boolean);
  
  return (
    <>
      {shiftedHotspots.map(h => h && (
        <Fragment key={h.id}>
          <Polygon paths={h.points} fillColor="#ff00ff" fillOpacity={0.3} strokeColor="#ff00ff" strokeWeight={2} strokeOpacity={0.8} />
        </Fragment>
      ))}
    </>
  );
}

function ActiveMissionsLayer() {
  const activeMissions = useAppStore(state => state.activeMissions ?? []);
  
  if (!activeMissions?.length) return null;
  
  return (
    <>
      {activeMissions.map(m => {
        if (!m) return null;
        return (
          <AdvancedMarker 
            key={m.id} 
            position={{ lat: m.targetLat, lng: m.targetLng }}
          >
            <div className={cn(
              "relative flex items-center justify-center",
              m.priority === "Critical" && "animate-tactical-pulse"
            )}>
              <div className={cn(
                "p-2 rounded-full border-2 border-white shadow-2xl relative z-10",
                m.priority === "Critical" ? "bg-red-600" : "bg-blue-600"
              )}>
                <Siren size={16} className="text-white" />
              </div>
              {m.priority === "Critical" && (
                  <div className="absolute -top-12 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest whitespace-nowrap border border-white/20">
                     {m.title} - SOS
                  </div>
              )}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

function AIPatrolRouteLayer({ route }: { route: { lat: number; lng: number }[] | null }) {
  if (!route?.length) return null;
  return <Polyline path={route} strokeColor="#D4AF37" strokeWeight={4} strokeOpacity={0.8} />;
}
