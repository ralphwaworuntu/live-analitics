"use client";

import { useEffect } from "react";
import { APIProvider, Map, useMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { getSelectedPolres, useAppStore } from "@/store";
import type { PolresItem, PolicePost } from "@/lib/types";
import { TowerControl, Siren, Zap } from "lucide-react";
import PatrolBreadcrumbs from "@/components/map/PatrolBreadcrumbs";
import { motion, AnimatePresence } from "framer-motion";

function MapController({ selectedPolres, emergency }: { selectedPolres: PolresItem | null, emergency: any }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    if (emergency.active && emergency.lat && emergency.lng) {
       map.panTo({ lat: emergency.lat, lng: emergency.lng });
       map.setZoom(16);
       return;
    }

    if (selectedPolres) {
      map.panTo({ lat: selectedPolres.lat, lng: selectedPolres.lng });
      map.setZoom(11);
    }
  }, [map, selectedPolres, emergency]);

  return null;
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
  const posts = useAppStore((state) => state.policePosts);

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
          <PatrolBreadcrumbs />
          <MapController selectedPolres={selectedPolres} emergency={emergency} />
        </Map>
      </APIProvider>
      
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

    map.data.addGeoJson(geoJson as any);
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
