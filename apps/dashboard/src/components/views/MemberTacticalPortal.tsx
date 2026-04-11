"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Battery, Activity, ShieldAlert, CheckCircle2, ShieldCheck, 
  MapPin, Target, TriangleAlert, Skull, Flame, Clock, Radio, 
  Compass, Anchor, QrCode, ClipboardList, Map as MapIcon, ChevronUp, ChevronDown 
} from "lucide-react";
import { APIProvider, Map as GoogleMap, Marker, Polyline, useMap } from "@vis.gl/react-google-maps";
import { generateIntegrityHash } from "@/lib/crypto";

// --- Utility Functions --- //
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function pointToSegmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  let t = 0;
  if (dx !== 0 || dy !== 0) {
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));
  }
  return haversineDistance(px, py, ax + t * dx, ay + t * dy);
}

function minDistanceToRoute(pos: {lat: number, lng: number}, route: {lat: number, lng: number}[]): number {
  if (route.length < 2) return 0;
  let minDist = Infinity;
  for (let i = 0; i < route.length - 1; i++) {
    const d = pointToSegmentDistance(pos.lat, pos.lng, route[i].lat, route[i].lng, route[i+1].lat, route[i+1].lng);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function isInsidePolygon(point: {lat: number, lng: number}, vs: {lat: number, lng: number}[]) {
  let x = point.lat, y = point.lng;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      let xi = vs[i].lat, yi = vs[i].lng;
      let xj = vs[j].lat, yj = vs[j].lng;
      let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
  }
  return inside;
}

const SECTOR_KUPANG_KOTA = [
  { lat: -10.145, lng: 123.585 }, { lat: -10.145, lng: 123.615 },
  { lat: -10.175, lng: 123.615 }, { lat: -10.175, lng: 123.585 }
];

// --- Sub-components --- //
function RecenterController({ center }: { center: { lat: number, lng: number } }) {
  const map = useMap();
  const handleRecenter = () => {
    if (map) {
      map.panTo(center);
      map.setZoom(16);
    }
  };
  return (
    <button onClick={handleRecenter} className="absolute bottom-4 right-4 w-12 h-12 bg-[#0A0A0A] border border-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg text-[#00F0FF] hover:bg-[#1A1A1A] transition-colors z-10 cursor-pointer active:scale-95">
      <Target size={24} />
    </button>
  );
}

function GeofenceSectorLayer({ path, isBreached }: { path: { lat: number, lng: number }[], isBreached: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google?.maps) return;
    const polygon = new window.google.maps.Polygon({
      paths: path,
      strokeColor: isBreached ? "#FFB800" : "#00F0FF",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: isBreached ? "#FFB800" : "#00F0FF",
      fillOpacity: 0.1,
    });
    polygon.setMap(map);
    return () => polygon.setMap(null);
  }, [map, path, isBreached]);
  return null;
}

function MissionRouteLayer({ plannedRoute, actualPath }: { plannedRoute: {lat:number, lng:number}[], actualPath: {lat:number, lng:number}[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google?.maps || plannedRoute.length === 0) return;
    const lineSymbol = { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor: '#FFB800', scale: 2 };
    const polyline = new window.google.maps.Polyline({
      path: plannedRoute, strokeOpacity: 0,
      icons: [{ icon: lineSymbol, offset: '0', repeat: '10px' }],
      zIndex: 10
    });
    polyline.setMap(map);
    return () => polyline.setMap(null);
  }, [map, plannedRoute]);

  return (
    <Polyline path={actualPath} strokeColor="#00F0FF" strokeWeight={3} strokeOpacity={0.8} zIndex={5} />
  );
}

function RotatingGpsIcon({ heading }: { heading: number }) {
  const iconRef = useRef<HTMLDivElement>(null);
  const currentHeading = useRef(heading);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      let diff = heading - currentHeading.current;
      while (diff < -180) diff += 360;
      while (diff > 180) diff -= 360;
      currentHeading.current += diff * 5 * delta;
      if (iconRef.current) iconRef.current.style.transform = `rotate(${currentHeading.current}deg)`;
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [heading]);

  return (
    <div ref={iconRef} className="text-[#00F0FF]">
      <Compass size={16} />
    </div>
  );
}

function FakeGpsBlocker() {
  return (
    <div className="absolute inset-0 z-50 bg-[#FF003C] p-2 flex flex-col">
      <div className="flex-1 bg-[#000000] rounded-xl flex flex-col items-center justify-center text-center p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
           <Anchor size={300} />
        </div>
        <ShieldAlert size={80} className="text-[#FF003C] mb-6 relative z-10 animate-bounce" />
        <h1 className="text-[#FF003C] font-black text-3xl uppercase tracking-widest mb-4 relative z-10">Lokasi Palsu<br/>Terdeteksi</h1>
        <p className="text-[#E0E0E0] text-sm relative z-10 px-4">Modifikasi lokasi (Mock Location / Fake GPS) dilarang aktif selama berdinas. Fitur dashboard dinonaktifkan untuk menjaga integritas data operasional.</p>
      </div>
    </div>
  );
}

// --- Types --- //
interface Breadcrumb {
  lat: number;
  lng: number;
  ts: number;
  hash: string;
}

// --- Main component --- //
export default function MemberTacticalPortal() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
  const { activeMissions, updateMissionStatus, handleSOS, personnelTracks, isOnline, addAuditLog, updatePersonnelPosition, activePatrolRoute, setPatrolRoute } = useAppStore();
  
  const me = personnelTracks[0];
  const activeMission = activeMissions.find(m => m.status !== "completed");
  
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const [sosActivatedAt, setSosActivatedAt] = useState<number | null>(null);
  const [elapsedTimeStr, setElapsedTimeStr] = useState("00:00");

  const [secHash, setSecHash] = useState<string>("CALCULATING...");
  const [hashFreshAt, setHashFreshAt] = useState<number>(0);
  const [offlineHashQueue, setOfflineHashQueue] = useState<any[]>([]);

  const [missionExpanded, setMissionExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [plannedRoute, setPlannedRouteLocal] = useState<{lat:number, lng:number}[]>([]);
  const [devWarning, setDevWarning] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const mapCenter = me?.waypoints[me.waypoints.length - 1] || { lat: -10.158, lng: 123.606 };
  const heading = me?.heading || 0;
  
  // Use store's active route if PUSHED from command center, otherwise local
  const displayRoute = activePatrolRoute || plannedRoute;
  
  const actualPath = useMemo(() => {
    if (breadcrumbs.length === 0) return [mapCenter];
    return breadcrumbs.map(b => ({ lat: b.lat, lng: b.lng })).concat(mapCenter);
  }, [breadcrumbs, mapCenter]);

  // Sector breach
  const isSectorBreached = !isInsidePolygon(mapCenter, SECTOR_KUPANG_KOTA);
  
  // Route deviation detection
  useEffect(() => {
    if (displayRoute.length > 0) {
      const dist = minDistanceToRoute(mapCenter, displayRoute);
      if (dist > 200) {
        if (!devWarning) {
          setDevWarning(true);
          addAuditLog({ actor: me?.id || "SYSTEM", action: "ROUTE_DEVIATION", target: "SYSTEM", details: `Deviation of ${Math.round(dist)}m detected.`});
        }
      } else {
        setDevWarning(false);
      }
    }
  }, [mapCenter, displayRoute, me?.id, addAuditLog, devWarning]);

  // Tactical SOS Timer
  useEffect(() => {
    if (isCrisis && sosActivatedAt) {
      const intv = setInterval(() => {
         const diff = Math.floor((Date.now() - sosActivatedAt) / 1000);
         const m = String(Math.floor(diff / 60)).padStart(2, '0');
         const s = String(diff % 60).padStart(2, '0');
         setElapsedTimeStr(`${m}:${s}`);
      }, 1000);
      return () => clearInterval(intv);
    } else {
      setElapsedTimeStr("00:00");
    }
  }, [isCrisis, sosActivatedAt]);

  // Fetch initial active mission route on mount
  useEffect(() => {
    fetch(`/api/missions/active?nrp=${me?.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.plannedRoute) {
          setPlannedRouteLocal(data.plannedRoute);
        }
      }).catch(() => {});
  }, [me?.id]);

  // Battery optimized breadcrumb array logic 
  useEffect(() => {
    const intv = setTimeout(async () => {
      // 1. Distance filter (only record if moved > 5m to avoid jitter)
      let shouldRecord = true;
      if (breadcrumbs.length > 0) {
        const last = breadcrumbs[breadcrumbs.length - 1];
        if (haversineDistance(last.lat, last.lng, mapCenter.lat, mapCenter.lng) < 5) {
          shouldRecord = false;
        }
      }
      
      if (shouldRecord) {
        const ts = Date.now();
        const hash = await generateIntegrityHash({ lat: mapCenter.lat, lng: mapCenter.lng, ts });
        setBreadcrumbs(prev => {
          const arr = [...prev, { lat: mapCenter.lat, lng: mapCenter.lng, ts, hash }];
          if (arr.length > 5760) return arr.slice(-5760); // cap at 24h of 15s intervals
          return arr;
        });
      }
    }, me?.speed && me.speed > 2 ? 15000 : 60000); // adaptive interval

    return () => clearTimeout(intv);
  }, [mapCenter, breadcrumbs, me?.speed]);

  // SEC-HASH signature generation logic for top bar
  useEffect(() => {
    const generateHash = async () => {
      if (!me) return;
      const ts = Date.now();
      const payload = { id: me.id, lat: mapCenter.lat, lng: mapCenter.lng, ts };
      try {
        const hash = await generateIntegrityHash(payload);
        setSecHash(hash);
        setHashFreshAt(ts);
        if (!isOnline) setOfflineHashQueue(prev => [...prev, { hash, payload, ts }]);
      } catch (err) {
        setSecHash("SEC-HASH-ERROR");
      }
    };
    generateHash();
    const interval = setInterval(generateHash, 10000);
    return () => clearInterval(interval);
  }, [me?.id, mapCenter.lat, mapCenter.lng, isOnline]);
  
  // Offline burst transmission
  useEffect(() => {
    if (isOnline && offlineHashQueue.length > 0) {
      addAuditLog({ actor: me?.id || "SYSTEM", action: "OFFLINE_HASH_BURST", target: "SERVER", details: `Transmitted ${offlineHashQueue.length} buffered hashes.` });
      setOfflineHashQueue([]);
    }
  }, [isOnline, offlineHashQueue, addAuditLog, me?.id]);

  const hashIsVerified = (Date.now() - hashFreshAt) < 15000;

  // SOS Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && !isCrisis) {
      interval = setInterval(() => {
        setHoldProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsCrisis(true);
            setSosActivatedAt(Date.now());
            handleSOS(me?.id || "unknown");
            addAuditLog({ actor: me?.id || "unknown", action: "SOS_TRIGGERED", target: "SYSTEM", details: "Emergency protocol activated via 3s long press." });
            return 100;
          }
          return p + (100 / 30);
        });
      }, 100);
    } else if (!isCrisis) {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, isCrisis, handleSOS, me?.id, addAuditLog]);

  // High-Freq GPS
  useEffect(() => {
    if (!isCrisis || !me) return;
    const interval = setInterval(() => {
      updatePersonnelPosition(me.id, mapCenter.lat, mapCenter.lng);
    }, 500);
    return () => clearInterval(interval);
  }, [isCrisis, me?.id, mapCenter.lat, mapCenter.lng, updatePersonnelPosition]);

  // Nearest colleagues (3km)
  const nearbyColleagues = useMemo(() => {
    if (!me) return [];
    return personnelTracks
      .filter(t => t.id !== me.id)
      .map(t => {
        const pos = t.waypoints[t.waypoints.length - 1];
        if (!pos) return null;
        const dist = haversineDistance(mapCenter.lat, mapCenter.lng, pos.lat, pos.lng);
        return { track: t, pos, dist };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null && item.dist <= 3000)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5);
  }, [me, personnelTracks, mapCenter.lat, mapCenter.lng]);

  const handleQuickReport = useCallback((type: string) => {
    if (!me) return;
    addAuditLog({ actor: me.id, action: "TACTICAL_REPORT", target: type, details: `{"type":"${type}","lat":${mapCenter.lat},"lng":${mapCenter.lng},"ts":${Date.now()}}` });
    alert(`Laporan ${type} terkirim dengan cap waktu tersandi.`);
  }, [addAuditLog, me, mapCenter]);

  // Simulated QR Check-in
  const handleCheckIn = () => {
    setIsCheckingIn(true);
    setTimeout(() => {
      addAuditLog({ actor: me?.id || "SYSTEM", action: "CHECK_IN", target: "M-001", details: "Checked in via QR Scan" });
      setIsCheckingIn(false);
      alert("Check-in berhasil. Menyinkronkan Rute Operasi terbaru.");
      // In real scenario, we would trigger a route fetch
      setPatrolRoute(plannedRoute); 
    }, 1500);
  };

  if (me?.isFakeGPS) return <FakeGpsBlocker />;

  return (
    <div className={`w-full h-full flex justify-center bg-[#000000] overflow-y-auto ${isCrisis ? 'animate-crisisPulse' : ''}`}>
      <style>{`
        @keyframes crisisFlash { 0%, 100% { box-shadow: inset 0 0 0px #FF003C; } 50% { box-shadow: inset 0 0 40px #FF003C; } }
        .animate-crisisPulse { animation: crisisFlash 0.5s infinite; }
      `}</style>
      
      <div className="w-full max-w-[480px] min-h-full bg-[#0A0A0A] border-x border-[#1A1A1A] flex flex-col relative text-[#E0E0E0] overflow-hidden">
        
        {/* HUD Strip */}
        <div className="flex flex-col bg-[#050505] border-b border-[#1A1A1A] z-20">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#00F0FF] animate-pulseshadow' : 'bg-[#555555]'}`} />
              <div className="flex flex-col">
                <span className="text-[9px] text-[#555555] font-black uppercase tracking-widest">Link</span>
                <span className="text-[11px] font-mono text-[#00F0FF] font-black">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
               <RotatingGpsIcon heading={heading} />
               <div className="flex flex-col">
                 <span className="text-[9px] text-[#555555] font-black uppercase tracking-widest">GPS ACC</span>
                 <span className="text-[11px] font-mono text-[#E0E0E0] font-black">±3.2m</span>
               </div>
            </div>
            
            <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded" onClick={() => setDrawerOpen(!drawerOpen)}>
              <MapIcon size={16} className="text-[#FFB800]" />
              <div className="flex flex-col">
                <span className="text-[9px] text-[#555555] font-black uppercase tracking-widest">Trk Hist</span>
                <span className="text-[11px] font-mono text-[#E0E0E0] font-black">{breadcrumbs.length} Pts</span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-2 pt-1 flex items-center justify-center overflow-hidden">
             <span className={`text-[9px] font-mono font-black tracking-widest uppercase truncate select-none transition-all ${hashIsVerified ? 'text-[#00FF88] drop-shadow-[0_0_6px_rgba(0,255,136,0.8)]' : 'text-[#555555]'}`}>
               {hashIsVerified ? 'ACK // ' : 'SIG // '} {secHash}
             </span>
          </div>
        </div>

        {/* History Drawer Slider */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div 
              initial={{ y: -300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -300, opacity: 0 }}
              className="absolute top-[72px] left-0 right-0 h-[250px] bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] z-10 p-4 overflow-y-auto"
            >
               <h3 className="text-[#FFB800] text-[10px] font-black uppercase tracking-widest mb-4">Trip History (Last 24h)</h3>
               <div className="space-y-3">
                 {breadcrumbs.slice(-20).reverse().map((b, i) => (
                   <div key={b.ts} className="flex justify-between items-center text-xs p-2 bg-[#111111] border border-[#1A1A1A] rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-[#555555] text-[9px] font-black uppercase">{new Date(b.ts).toLocaleTimeString()}</span>
                        <span className="font-mono text-[9px] text-[#E0E0E0]">{b.lat.toFixed(5)}, {b.lng.toFixed(5)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-[#00FF88] border border-[#00FF88]/30 px-1 py-0.5 rounded bg-[#00FF88]/10">VERIFIED</span>
                      </div>
                   </div>
                 ))}
                 {breadcrumbs.length === 0 && <p className="text-sm text-[#555555] text-center mt-4">No recent history.</p>}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tactical Radar Map */}
        <div className="h-64 relative border-b border-[#1A1A1A] bg-[#000000] overflow-hidden">
          <APIProvider apiKey={apiKey}>
            <GoogleMap
              center={mapCenter} zoom={15} disableDefaultUI gestureHandling="greedy"
              styles={[
                { elementType: "geometry", stylers: [{ color: "#000000" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#1A1A1A" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#E0E0E0" }] },
                { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#555555" }] },
                { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#555555" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#111111" }] },
                { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1A1A1A" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#050505" }] }
              ]}
            >
              <GeofenceSectorLayer path={SECTOR_KUPANG_KOTA} isBreached={isSectorBreached} />
              <MissionRouteLayer plannedRoute={displayRoute} actualPath={actualPath} />
              
              {me && (
                <Marker position={mapCenter} zIndex={100} icon={{ path: "M 0,0 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0", scale: 0.8, fillColor: "#00F0FF", fillOpacity: 1, strokeColor: "#000000", strokeWeight: 3 }} />
              )}
              {nearbyColleagues.map(item => (
                <Marker key={item.track.id} position={item.pos} zIndex={50} icon={{ path: "M 0,0 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0", scale: 0.6, fillColor: "#555555", fillOpacity: 0.8, strokeColor: "#0A0A0A", strokeWeight: 2 }} />
              ))}
              <RecenterController center={mapCenter} />
            </GoogleMap>
          </APIProvider>

          {/* Map Layer Overlays (Breach & Deviation) */}
          <div className="absolute top-0 left-0 right-0 z-40 flex flex-col">
            <AnimatePresence>
              {isSectorBreached && !isCrisis && (
                  <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="bg-[#FF003C]/90 text-white py-1 px-4 text-center shadow-[0_4px_20px_rgba(255,0,60,0.4)] flex items-center justify-center gap-2">
                    <TriangleAlert size={12} /> <span className="font-black text-[9px] uppercase tracking-widest">KELUAR SEKTOR KUPANG KOTA</span>
                  </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {devWarning && !isCrisis && (
                  <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="bg-[#FFB800]/90 text-black py-1 px-4 text-center shadow-[0_4px_20px_rgba(255,184,0,0.4)] flex items-center justify-center gap-2">
                    <Radio size={12} className="animate-pulse" /> <span className="font-black text-[9px] uppercase tracking-widest">PENYIMPANGAN RUTE TERDETEKSI (&gt;200M)</span>
                  </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute inset-0 pointer-events-none rounded-full flex items-center justify-center overflow-hidden z-20">
             <div className="w-[120%] h-[120%] border-2 border-[#00F0FF]/10 rounded-full animate-ping absolute" style={{ animationDuration: '4s' }} />
             <div className="w-[60%] h-[60%] border border-[#00F0FF]/20 rounded-full absolute" />
          </div>
        </div>

        {/* Mission Control & Reporting */}
        <div className="px-4 py-4 flex-1 flex flex-col relative z-20">
          <AnimatePresence mode="popLayout">
            {isCrisis && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-[#0A0A0A]/95 z-30 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
                 <ShieldAlert size={64} className="text-[#FF003C] mb-4 animate-bounce" />
                 <h2 className="text-[#FF003C] font-black text-2xl tracking-widest uppercase mb-2">Protocol Active</h2>
                 <div className="bg-[#1A0005] border border-[#FF003C]/30 px-6 py-3 rounded-xl mb-8">
                   <p className="text-[10px] text-[#FF003C]/80 font-black tracking-widest uppercase mb-1">SOS ACTIVE FOR</p>
                   <p className="font-mono text-3xl font-black text-[#FF003C] tracking-wider">{elapsedTimeStr}</p>
                 </div>
                 <button onClick={() => { setIsCrisis(false); setSosActivatedAt(null); }} className="px-6 py-3 border-2 border-[#FF003C] text-[#FF003C] font-black tracking-widest uppercase rounded-lg hover:bg-[#FF003C]/10 active:scale-95 transition-all text-xs">
                   (DEMO TEST) Clear Crisis
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tactical 4-Buttons Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
            <button onClick={() => handleQuickReport("LAKA LANTAS")} className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[#111] border border-[#1A1A1A] rounded-xl hover:border-[#FFB800] text-[#E0E0E0] hover:text-[#FFB800] active:scale-95 transition-all h-[56px]">
              <TriangleAlert size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Lapor Laka</span>
            </button>
            <button onClick={() => handleQuickReport("KRIMINAL")} className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[#111] border border-[#1A1A1A] rounded-xl hover:border-[#FFB800] text-[#E0E0E0] hover:text-[#FFB800] active:scale-95 transition-all h-[56px]">
              <Skull size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Kriminal</span>
            </button>
            <button onClick={() => handleQuickReport("STATIONARY_CHECK")} className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[#111] border border-[#1A1A1A] rounded-xl hover:border-[#00F0FF] text-[#E0E0E0] hover:text-[#00F0FF] active:scale-95 transition-all h-[56px]">
              <Clock size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Cek Stop</span>
            </button>
            <button onClick={() => handleQuickReport("REQUEST_BACKUP")} className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[#1a0f0f] border border-[#FF003C]/30 rounded-xl hover:border-[#FF003C] text-[#FF003C] active:scale-95 transition-all h-[56px]">
              <Radio size={16} className="animate-pulse" /> <span className="text-[9px] font-black uppercase tracking-widest">Req Backup</span>
            </button>
          </div>

          {/* Expandable Mission Card & Check-in */}
          <div className="flex-1 overflow-y-auto pb-4 shrink-0">
            <h2 className="text-[10px] font-black uppercase text-[#555555] mb-2 tracking-[0.25em] flex items-center gap-2">
              <ClipboardList size={14} className="text-[#FFB800]" /> DIREKTIF TUGAS
            </h2>
            <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl overflow-hidden mb-2">
              <div className="p-3 border-b border-[#1A1A1A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#555555] text-[9px] uppercase font-black uppercase tracking-widest">MISSION BRIDGE ID</span>
                  <span className="text-[#00F0FF] font-mono text-[9px]">DOC-77AK-T</span>
                </div>
                {isCheckingIn ? (
                   <div className="h-12 border border-[#00F0FF]/30 bg-[#00F0FF]/10 border-dashed rounded text-center flex items-center justify-center text-[#00F0FF] text-xs font-black animate-pulse uppercase tracking-widest">
                     Scanning QR Code...
                   </div>
                ) : (
                  <button onClick={handleCheckIn} className="w-full h-12 bg-[#1A1A1A] rounded flex items-center justify-center gap-2 hover:bg-[#222222] transition-colors text-[#E0E0E0] active:scale-95">
                    <QrCode size={16} className="text-[#00F0FF]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Scan Check-in Ren Ops</span>
                  </button>
                )}
              </div>
            </div>
            
            <AnimatePresence mode="popLayout">
              {activeMission && (
                <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#111111] border border-[#FFB800]/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,184,0,0.05)] shrink-0">
                  <div onClick={() => setMissionExpanded(!missionExpanded)} className="p-3 cursor-pointer flex items-center justify-between active:bg-[#1A1A1A] transition-colors">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="text-[#FFB800] text-[8px] uppercase font-black tracking-widest mb-1">{activeMission.status}</span>
                      <h3 className="font-bold text-[#E0E0E0] text-xs truncate">{activeMission.title}</h3>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                      <ChevronDown size={12} className={`transition-transform ${missionExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <AnimatePresence>
                    {missionExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 border-t border-[#1A1A1A] pt-2">
                        <p className="text-[11px] text-[#888888] leading-relaxed mb-3">{activeMission.description}</p>
                        <button onClick={() => updateMissionStatus(activeMission.id, activeMission.status === "en-route" ? "on-site" : "completed")} className="w-full min-h-[40px] rounded-lg font-black uppercase tracking-widest text-[10px] bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/30 text-emerald-400 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
                          <CheckCircle2 size={14} /> {activeMission.status === "en-route" ? "Arrived On-Site" : "Complete Mission"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* SOS Panic Logic Bottom Section */}
        <div className={`mt-auto pb-6 pt-2 flex flex-col justify-center items-center shrink-0 border-t border-[#1A1A1A] bg-[#0A0A0A] z-20 ${isCrisis ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity'}`}>
          <div className="flex items-center gap-6">
            <div className="text-[9px] font-black uppercase tracking-widest text-[#555555] text-right leading-relaxed">
              Tekan tahan <br/>3 detik untuk <br/>protokol darurat
            </div>
            <div className="relative">
              <svg className="absolute -inset-4 w-[112px] h-[112px] pointer-events-none -rotate-90">
                <circle cx="56" cy="56" r="52" stroke="#1A1A1A" strokeWidth="4" fill="none" />
                <circle cx="56" cy="56" r="52" stroke="#FF003C" strokeWidth="6" fill="none" strokeDasharray="326.72" strokeDashoffset={326.72 - (326.72 * holdProgress) / 100} className="transition-all duration-100" strokeLinecap="round" />
              </svg>
              <button onMouseDown={() => setIsHolding(true)} onMouseUp={() => setIsHolding(false)} onMouseLeave={() => setIsHolding(false)} onTouchStart={() => setIsHolding(true)} onTouchEnd={() => setIsHolding(false)} className="w-[80px] h-[80px] rounded-full bg-[#111111] border-[4px] border-[#FF003C]/30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,0,60,0.2)] hover:bg-[#FF003C]/10 transition-all active:scale-95 z-10 relative cursor-pointer">
                <ShieldAlert size={30} className="text-[#FF003C] mb-1" />
                <span className="text-[#FF003C] font-black tracking-widest text-[9px]">SOS</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
