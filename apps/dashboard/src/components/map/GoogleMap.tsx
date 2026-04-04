"use client";

import { useEffect } from "react";
import { APIProvider, Map, useMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { getSelectedPolres, useAppStore } from "@/store";
import type { PolresItem, PolicePost, EmergencyState, CctvPoint, PredictionPoint } from "@/lib/types";
import { TowerControl, Siren, Zap, CloudRain, Video, Layers, Activity, ShieldAlert } from "lucide-react";
import PatrolBreadcrumbs from "@/components/map/PatrolBreadcrumbs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function MapController({ selectedPolres, emergency, mapCenter }: { 
  selectedPolres: PolresItem | null, 
  emergency: EmergencyState,
  mapCenter: { lat: number; lng: number, zoom?: number } | null
}) {
  const map = useMap();

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
      return;
    }

    if (selectedPolres) {
      map.panTo({ lat: selectedPolres.lat, lng: selectedPolres.lng });
      map.setZoom(11);
    }
  }, [map, selectedPolres, emergency, mapCenter]);

  return null;
}

function CctvMarkersLayer({ points, enabled }: { points: CctvPoint[], enabled: boolean }) {
  if (!enabled) return null;
  return (
    <>
      {points.map(cam => (
        <AdvancedMarker key={cam.id} position={{ lat: cam.lat, lng: cam.lng }}>
          <div className="bg-[#0B1B32] border border-[#D4AF37]/50 rounded-full p-1 shadow-lg cursor-pointer group hover:scale-110 transition-transform">
             <Video size={12} className={cam.status === 'Online' ? "text-[#D4AF37]" : "text-slate-600"} />
             <div className="absolute top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-[#0B1B32] border border-white/10 p-2 rounded text-[10px] text-white whitespace-nowrap z-50">
                <div className="font-bold">{cam.name}</div>
                <div className="text-[8px] opacity-50 uppercase tracking-widest">{cam.type} Monitoring</div>
             </div>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}

function PredictedHotspotsLayer({ points, enabled }: { points: PredictionPoint[], enabled: boolean }) {
  if (!enabled) return null;
  return (
    <>
      {points.map(pt => (
        <AdvancedMarker key={pt.id} position={{ lat: pt.lat, lng: pt.lng }}>
          <div className="relative flex items-center justify-center">
             <div className="absolute w-24 h-24 bg-red-500/20 rounded-full animate-pulse blur-xl" />
             <div className="absolute w-12 h-12 border-2 border-red-500/30 rounded-full animate-ping" />
             <ShieldAlert size={16} className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
             <div className="absolute top-10 bg-slate-950/90 border border-red-500/40 p-2 rounded text-[9px] text-white w-32 backdrop-blur-md">
                <div className="font-black uppercase text-red-500 mb-0.5">AI Prediction: {pt.confidence}%</div>
                <div className="leading-tight opacity-80">{pt.reasoning}</div>
             </div>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}

function BmkgWeatherLayer({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  // Simulating weather polygons near Ende/Maumere
  return (
    <AdvancedMarker position={{ lat: -8.8, lng: 121.6 }}>
       <div className="relative">
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/10 border-2 border-dashed border-blue-400/20 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="p-3 bg-blue-900/40 border border-blue-400/50 rounded-2xl backdrop-blur-lg flex items-center gap-3 text-blue-100">
             <CloudRain size={20} className="animate-bounce" />
             <div>
                <div className="text-[10px] font-black uppercase tracking-tighter">BMKG Alert</div>
                <div className="text-[9px] opacity-80">Potensi Hujan Lebat & Angin Kencang</div>
             </div>
          </div>
       </div>
    </AdvancedMarker>
  );
}

function LayerControls() {
  const { bmkgOverlayEnabled, cctvMarkersEnabled, predictiveMode, setBmkgOverlay, setCctvMarkers, setPredictiveMode } = useAppStore();
  
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
       <div className="bg-[#0B1B32]/90 border border-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-2xl flex flex-col gap-3 min-w-[180px]">
          <div className="flex items-center gap-2 mb-1">
             <Layers size={14} className="text-[#D4AF37]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Tactical Layers</span>
          </div>
          
          <button 
            onClick={() => setPredictiveMode(!predictiveMode)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl transition-all border",
              predictiveMode ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-white/5 border-white/5 text-slate-500"
            )}
          >
             <div className="flex items-center gap-2">
                <Activity size={12} />
                <span className="text-[9px] font-bold uppercase tracking-tight">AI Predictions</span>
             </div>
             <div className={cn("w-2 h-2 rounded-full", predictiveMode ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "bg-slate-700")} />
          </button>

          <button 
            onClick={() => setCctvMarkers(!cctvMarkersEnabled)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl transition-all border",
              cctvMarkersEnabled ? "bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37]" : "bg-white/5 border-white/5 text-slate-500"
            )}
          >
             <div className="flex items-center gap-2">
                <Video size={12} />
                <span className="text-[9px] font-bold uppercase tracking-tight">CCTV Dishub</span>
             </div>
             <div className={cn("w-2 h-2 rounded-full", cctvMarkersEnabled ? "bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]" : "bg-slate-700")} />
          </button>

          <button 
            onClick={() => setBmkgOverlay(!bmkgOverlayEnabled)}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-xl transition-all border",
              bmkgOverlayEnabled ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : "bg-white/5 border-white/5 text-slate-500"
            )}
          >
             <div className="flex items-center gap-2">
                <CloudRain size={12} />
                <span className="text-[9px] font-bold uppercase tracking-tight">BMKG Weather</span>
             </div>
             <div className={cn("w-2 h-2 rounded-full", bmkgOverlayEnabled ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-slate-700")} />
          </button>
       </div>
    </div>
  );
}

function PolicePostsLayer({ posts }: { posts: PolicePost[] }) {
  return (
    <>
      {posts.map(post => (
        <AdvancedMarker key={post.id} position={{ lat: post.lat, lng: post.lng }}>
          <div className="bg-white border-2 border-blue-600 rounded-sm p-0.5 shadow-md flex items-center justify-center group cursor-pointer">
             <TowerControl size={10} className="text-blue-700" />
             <div className="absolute top-6 left-1/2 -track-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-slate-900 border border-white/10 p-1.5 rounded text-[8px] text-white whitespace-nowrap z-50">
                <div className="font-bold">{post.name}</div>
                <div className="text-blue-400 font-mono tracking-tighter uppercase">{post.type}</div>
             </div>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}

function SOSOverlay() {
  const emergency = useAppStore(state => state.emergency);
  const clearEmergency = useAppStore(state => state.clearEmergency);
  
  if (!emergency.active) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] pointer-events-none"
      >
        {/* Full screen red pulse border */}
        <div className="absolute inset-0 border-[20px] border-red-600 animate-[pulse_1s_infinite] pointer-events-none" />
        
        {/* Centered Modal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-slate-950 border-2 border-red-600 p-8 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.5)] flex flex-col items-center text-center max-w-md w-full">
             <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                <Siren size={40} className="text-white" />
             </div>
             <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Unit Membutuhkan Bantuan</h2>
             <p className="text-slate-400 mb-8 font-medium">Bripka Yohanis (p-001) memicu SOS melalui tombol taktis. Lokasi telah dikunci di pusat kontrol.</p>
             
             <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={clearEmergency}
                  className="py-4 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-xl transition-all uppercase tracking-widest cursor-pointer"
                >Abaikan</button>
                <button 
                  className="py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-600/30 transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap size={18} /> Kirim Unit Terdekat
                </button>
             </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function GoogleMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
  const polres = useAppStore((state) => state.polres);
  const selectedPolres = useAppStore(getSelectedPolres);
  const emergency = useAppStore((state) => state.emergency);
  const mapCenter = useAppStore((state) => state.mapCenter);
  const posts = useAppStore((state) => state.policePosts);
  const predictionPoints = useAppStore((state) => state.predictionPoints);
  const predictiveMode = useAppStore((state) => state.predictiveMode);
  const cctvPoints = useAppStore((state) => state.cctvPoints);
  const cctvMarkersEnabled = useAppStore((state) => state.cctvMarkersEnabled);
  const bmkgOverlayEnabled = useAppStore((state) => state.bmkgOverlayEnabled);

  if (!apiKey) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: -9.0, lng: 121.5 }}
          defaultZoom={7}
          mapId="SENTINEL_DASHBOARD_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: "100%", height: "100%" }}
        >
          {/* Polres Layer */}
          <GeoJsonLayer polresList={polres} />
          
          <PolicePostsLayer posts={posts} />
          <CctvMarkersLayer points={cctvPoints} enabled={cctvMarkersEnabled} />
          <PredictedHotspotsLayer points={predictionPoints} enabled={predictiveMode} />
          <BmkgWeatherLayer enabled={bmkgOverlayEnabled} />

          <PatrolBreadcrumbs />
          <MapController 
            selectedPolres={selectedPolres} 
            emergency={emergency} 
            mapCenter={mapCenter} 
          />
        </Map>
      </APIProvider>
      
      <LayerControls />
      <SOSOverlay />
    </div>
  );
}

function GeoJsonLayer({ polresList }: { polresList: PolresItem[] }) {
  const map = useMap();
  const setSelectedPolres = useAppStore((state) => state.setSelectedPolres);
  const setSelectedPolsek = useAppStore((state) => state.setSelectedPolsek);

  useEffect(() => {
    if (!map) return;
    
    // Simulate Polsek Data Layer as well
    const geoJson = {
      type: "FeatureCollection",
      features: polresList.flatMap((p) => {
        // Main Polres area
        const offset = 0.2;
        return [{
          type: "Feature",
          id: p.id,
          properties: { id: p.id, type: "polres", name: p.name, crimeStatus: p.crimeStatus || "Hijau" },
          geometry: {
            type: "Polygon",
            coordinates: [[[p.lng - offset, p.lat - offset], [p.lng + offset, p.lat - offset], [p.lng + offset, p.lat + offset], [p.lng - offset, p.lat + offset], [p.lng - offset, p.lat - offset]]]
          },
        }];
      }),
    };

    map.data.addGeoJson(geoJson as object);
    map.data.setStyle((f) => {
      const s = f.getProperty("crimeStatus");
      let c = "#18C29C"; 
      if (s === "Merah") c = "#ef4444";
      if (s === "Kuning") c = "#eab308";
      return { fillColor: c, fillOpacity: 0.15, strokeColor: c, strokeWeight: 2, strokeOpacity: 0.3 };
    });

    const clickListener = map.data.addListener("click", (e: google.maps.Data.MouseEvent) => {
      const f = e.feature;
      setSelectedPolres(f.getProperty("id") as string);
      // Simulate selecting a polsek if zoomed in
      if (map.getZoom()! > 10) {
         setSelectedPolsek("polsek-sim-01");
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
      map.data.forEach((f) => map.data.remove(f));
    };
  }, [map, polresList, setSelectedPolres, setSelectedPolsek]);

  return null;
}
