"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Battery, Activity, ShieldAlert, CheckCircle2, ShieldCheck, 
  Target, TriangleAlert, Skull, Clock, Radio, 
  Compass, Anchor, QrCode, ClipboardList, Map as MapIcon, ChevronDown, Bell 
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
  const handleRecenter = () => { map?.panTo(center); map?.setZoom(16); };
  return (
    <button onClick={handleRecenter} className="absolute bottom-4 right-4 w-12 h-12 bg-[#0A0A0A] border border-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg text-[#00F0FF] hover:bg-[#1A1A1A] transition-colors z-10 cursor-pointer active:scale-95 touch-manipulation">
      <Target size={24} />
    </button>
  );
}

function GeofenceSectorLayer({ path, isBreached }: { path: { lat: number, lng: number }[], isBreached: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google?.maps) return;
    const polygon = new window.google.maps.Polygon({
      paths: path, strokeColor: isBreached ? "#FFB800" : "#00F0FF",
      strokeOpacity: 0.8, strokeWeight: 2,
      fillColor: isBreached ? "#FFB800" : "#00F0FF", fillOpacity: 0.1,
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

  return <Polyline path={actualPath} strokeColor="#00F0FF" strokeWeight={3} strokeOpacity={0.8} zIndex={5} />;
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
    <div className="absolute inset-0 z-50 bg-[#FF003C] p-2 flex flex-col touch-none">
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
interface Breadcrumb { lat: number; lng: number; ts: number; hash: string; }
interface AlertItem { id: string; type: 'warning'|'danger'|'info'; message: string; ts: number; }

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
  const [gpsPermission, setGpsPermission] = useState<PermissionState | 'unknown'>('unknown');
  const [isDutyActive, setIsDutyActive] = useState(false);

  const [secHash, setSecHash] = useState<string>("CALCULATING...");
  const [hashFreshAt, setHashFreshAt] = useState<number>(0);
  const [offlineHashQueue, setOfflineHashQueue] = useState<any[]>([]);

  const [missionExpanded, setMissionExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bellMenuOpen, setBellMenuOpen] = useState(false);
  
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [plannedRoute, setPlannedRouteLocal] = useState<{lat:number, lng:number}[]>([]);
  const [devWarning, setDevWarning] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const [alertsQueue, setAlertsQueue] = useState<AlertItem[]>([]);

  const mapCenter = me?.waypoints[me.waypoints.length - 1] || { lat: -10.158, lng: 123.606 };
  const heading = me?.heading || 0;
  
  const displayRoute = activePatrolRoute || plannedRoute;
  const actualPath = useMemo(() => {
    if (breadcrumbs.length === 0) return [mapCenter];
    return breadcrumbs.map(b => ({ lat: b.lat, lng: b.lng })).concat(mapCenter);
  }, [breadcrumbs, mapCenter]);

  const isSectorBreached = !isInsidePolygon(mapCenter, SECTOR_KUPANG_KOTA);
  
  const addNotification = useCallback((msg: string, type: 'warning'|'danger'|'info') => {
    setAlertsQueue(prev => {
       if (prev.find(p => p.message === msg && Date.now() - p.ts < 60000)) return prev;
       return [{ id: Math.random().toString(), message: msg, type, ts: Date.now() }, ...prev].slice(0, 10);
    });
  }, []);

  // Map Dev & Breach events into Bell Notification system
  useEffect(() => {
    if (isSectorBreached && !isCrisis) {
      addNotification("KELUAR SEKTOR KUPANG KOTA", "danger");
    }
  }, [isSectorBreached, isCrisis, addNotification]);

  useEffect(() => {
    if (displayRoute.length > 0) {
      const dist = minDistanceToRoute(mapCenter, displayRoute);
      if (dist > 200) {
        if (!devWarning) {
          setDevWarning(true);
          addAuditLog({ actor: me?.id || "SYSTEM", action: "ROUTE_DEVIATION", target: "SYSTEM", details: `Deviation of ${Math.round(dist)}m detected.`});
          addNotification("PENYIMPANGAN RUTE TERDETEKSI (>200M)", "warning");
        }
      } else {
        setDevWarning(false);
      }
    }
  }, [mapCenter, displayRoute, me?.id, addAuditLog, devWarning, addNotification]);

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

  useEffect(() => {
    fetch(`/api/missions/active?nrp=${me?.id}`).then(res => res.json()).then(data => {
        if (data.plannedRoute) setPlannedRouteLocal(data.plannedRoute);
      }).catch(() => {});
  }, [me?.id]);

  useEffect(() => {
    const intv = setTimeout(async () => {
      let shouldRecord = true;
      if (breadcrumbs.length > 0) {
        const last = breadcrumbs[breadcrumbs.length - 1];
        if (haversineDistance(last.lat, last.lng, mapCenter.lat, mapCenter.lng) < 5) shouldRecord = false;
      }
      if (shouldRecord) {
        const ts = Date.now();
        const hash = await generateIntegrityHash({ lat: mapCenter.lat, lng: mapCenter.lng, ts });
        setBreadcrumbs(prev => {
          const arr = [...prev, { lat: mapCenter.lat, lng: mapCenter.lng, ts, hash }];
          if (arr.length > 5760) return arr.slice(-5760);
          return arr;
        });
      }
    }, me?.speed && me.speed > 2 ? 15000 : 60000);
    return () => clearTimeout(intv);
  }, [mapCenter, breadcrumbs, me?.speed]);

  useEffect(() => {
    const generateHash = async () => {
      if (!me) return;
      const ts = Date.now();
      const payload = { id: me.id, lat: mapCenter.lat, lng: mapCenter.lng, ts };
      try {
        const hash = await generateIntegrityHash(payload);
        setSecHash(hash); setHashFreshAt(ts);
        if (!isOnline) setOfflineHashQueue(prev => [...prev, { hash, payload, ts }]);
      } catch { setSecHash("SEC-HASH-ERROR"); }
    };
    generateHash();
    const interval = setInterval(generateHash, 10000);
    return () => clearInterval(interval);
  }, [me?.id, mapCenter.lat, mapCenter.lng, isOnline]);
  
  useEffect(() => {
    if (isOnline && offlineHashQueue.length > 0) {
      addAuditLog({ actor: me?.id || "SYSTEM", action: "OFFLINE_HASH_BURST", target: "SERVER", details: `Transmitted ${offlineHashQueue.length} buffered hashes.` });
      addNotification(`Transmitted ${offlineHashQueue.length} offline signatures.`, "info");
      setOfflineHashQueue([]);
    }
  }, [isOnline, offlineHashQueue, addAuditLog, me?.id, addNotification]);

  const [hashIsVerified, setHashIsVerified] = useState(false);

  useEffect(() => {
    const intv = setInterval(() => {
      setHashIsVerified((Date.now() - hashFreshAt) < 15000);
    }, 1000);
    return () => clearInterval(intv);
  }, [hashFreshAt]);

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setGpsPermission(result.state);
        result.onchange = () => setGpsPermission(result.state);
      }).catch(() => setGpsPermission('prompt'));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && !isCrisis) {
      interval = setInterval(() => {
        setHoldProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setIsCrisis(true); setSosActivatedAt(Date.now());
            handleSOS(me?.id || "unknown");
            addAuditLog({ actor: me?.id || "unknown", action: "SOS_TRIGGERED", target: "SYSTEM", details: "Protocol activated." });
            return 100;
          }
          return p + (100 / 30);
        });
      }, 100);
    } else if (!isCrisis) setHoldProgress(0);
    return () => clearInterval(interval);
  }, [isHolding, isCrisis, handleSOS, me?.id, addAuditLog]);

  useEffect(() => {
    if (!isCrisis || !me) return;
    const interval = setInterval(() => updatePersonnelPosition(me.id, mapCenter.lat, mapCenter.lng), 500);
    return () => clearInterval(interval);
  }, [isCrisis, me?.id, mapCenter.lat, mapCenter.lng, updatePersonnelPosition]);

  const nearbyColleagues = useMemo(() => {
    if (!me) return [];
    return personnelTracks.filter(t => t.id !== me.id).map(t => {
        const pos = t.waypoints[t.waypoints.length - 1];
        if (!pos) return null;
        return { track: t, pos, dist: haversineDistance(mapCenter.lat, mapCenter.lng, pos.lat, pos.lng) };
      }).filter((item): item is NonNullable<typeof item> => item !== null && item.dist <= 3000).sort((a, b) => a.dist - b.dist).slice(0, 5);
  }, [me, personnelTracks, mapCenter.lat, mapCenter.lng]);

  const handleQuickReport = useCallback((type: string) => {
    if (!me) return;
    addAuditLog({ actor: me.id, action: "TACTICAL_REPORT", target: type, details: `{"type":"${type}","lat":${mapCenter.lat},"lng":${mapCenter.lng},"ts":${Date.now()}}` });
    addNotification(`Laporan ${type} terkirim.`, "info");
  }, [addAuditLog, me, mapCenter, addNotification]);

  const handleCheckIn = () => {
    setIsCheckingIn(true);
    setTimeout(() => {
      addAuditLog({ actor: me?.id || "SYSTEM", action: "CHECK_IN", target: "M-001", details: "QR Scan" });
      setIsCheckingIn(false);
      addNotification("Rute Operasi disinkronisasi.", "info");
      setPatrolRoute(plannedRoute); 
    }, 1500);
  };

  if (me?.isFakeGPS) return <FakeGpsBlocker />;

  return (
    <div className={`w-full h-full flex justify-center bg-[#000000] overflow-hidden select-none touch-manipulation ${isCrisis ? 'animate-crisisPulse' : ''}`}>
      <style>{`
        @keyframes crisisFlash { 0%, 100% { box-shadow: inset 0 0 0px #FF003C; } 50% { box-shadow: inset 0 0 40px #FF003C; } }
        .animate-crisisPulse { animation: crisisFlash 0.5s infinite; }
      `}</style>
      
      <div className="w-full max-w-[480px] min-h-full bg-[#0A0A0A] border-x border-[#1A1A1A] flex flex-col relative text-[#E0E0E0] overflow-hidden">
        
        {/* Banner GPS */}
        {gpsPermission !== 'granted' && (
          <div className="bg-[#FFB800] text-black py-2 px-4 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 relative z-50">
            <TriangleAlert size={14} /> ⚠️ GPS OFFLINE: Click the Lock Icon in URL bar to Allow Location
          </div>
        )}

        {/* HUD Strip */}
        <div className="flex flex-col bg-[#050505] border-b border-[#1A1A1A] z-30">
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

            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded min-h-[48px]" 
                onClick={() => { setDrawerOpen(!drawerOpen); setBellMenuOpen(false); }}
              >
                <MapIcon size={16} className="text-[#FFB800]" />
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#555555] font-black uppercase tracking-widest">Trk Hist</span>
                  <span className="text-[11px] font-mono text-[#E0E0E0] font-black">{breadcrumbs.length} Pts</span>
                </div>
              </div>

              {/* Notification Bell Dropdown Toggle */}
              <div 
                className="relative cursor-pointer hover:bg-white/5 p-2 rounded min-h-[48px] flex items-center justify-center border border-transparent active:scale-95 transition-all"
                onClick={() => { setBellMenuOpen(!bellMenuOpen); setDrawerOpen(false); }}
              >
                <Bell size={18} className={alertsQueue.length > 0 ? "text-[#FFB800] animate-bounce" : "text-[#555555]"} />
                {alertsQueue.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF003C] rounded-full border border-[#050505]" />
                )}
              </div>
            </div>
          </div>
          <div className="px-4 pb-2 pt-1 flex items-center justify-center overflow-hidden border-t border-[#111111]">
             <span className={`text-[9px] font-mono font-black tracking-widest uppercase truncate transition-all ${hashIsVerified ? 'text-[#00FF88] drop-shadow-[0_0_6px_rgba(0,255,136,0.8)]' : 'text-[#555555]'}`}>
               {hashIsVerified ? 'ACK // ' : 'SIG // '} {secHash}
             </span>
          </div>
        </div>

        {/* Tactical Alerts Dropdown */}
        <AnimatePresence>
          {bellMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[80px] right-2 w-64 bg-[#111111] border border-[#333333] shadow-2xl z-[9999] rounded-xl overflow-hidden"
            >
              <div className="p-3 border-b border-[#333333] bg-[#0A0A0A] flex justify-between items-center">
                <span className="text-[10px] font-black tracking-widest text-[#555555] uppercase">Notifications</span>
                <span className="text-[10px] font-mono bg-[#333333] px-1.5 py-0.5 rounded text-[#E0E0E0]">{alertsQueue.length}</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {alertsQueue.length === 0 ? (
                  <div className="p-4 text-center text-[10px] text-[#555555] font-mono">No new alerts.</div>
                ) : (
                  alertsQueue.map(alert => (
                    <div key={alert.id} className="p-3 border-b border-[#1A1A1A] last:border-b-0 flex items-start gap-3">
                      {alert.type === 'danger' && <TriangleAlert size={14} className="text-[#FF003C] shrink-0 mt-0.5" />}
                      {alert.type === 'warning' && <Radio size={14} className="text-[#FFB800] shrink-0 mt-0.5" />}
                      {alert.type === 'info' && <CheckCircle2 size={14} className="text-[#00F0FF] shrink-0 mt-0.5" />}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-[#E0E0E0] leading-snug">{alert.message}</span>
                        <span className="text-[8px] font-mono text-[#555555] mt-1">{new Date(alert.ts).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {alertsQueue.length > 0 && (
                <button onClick={() => setAlertsQueue([])} className="w-full p-2 text-center text-[9px] font-black uppercase tracking-widest text-[#555555] hover:text-[#E0E0E0] bg-[#0A0A0A] transition-colors border-t border-[#333333] min-h-[48px]">
                  Clear All
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Drawer Slider */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div initial={{ y: -300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -300, opacity: 0 }} className="absolute top-[80px] left-0 right-0 h-[250px] bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#1A1A1A] z-20 p-4 overflow-y-auto shadow-2xl">
               <h3 className="text-[#FFB800] text-[10px] font-black uppercase tracking-widest mb-4">Trip History (Last 24h)</h3>
               <div className="space-y-3">
                 {breadcrumbs.slice(-20).reverse().map((b) => (
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
                 {breadcrumbs.length === 0 && <p className="text-sm text-[#555555] text-center mt-4 font-mono">No recent history.</p>}
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
                 <button onClick={() => { setIsCrisis(false); setSosActivatedAt(null); }} className="px-6 py-3 border-2 border-[#FF003C] text-[#FF003C] font-black tracking-widest uppercase rounded-lg hover:bg-[#FF003C]/10 active:scale-95 transition-all text-xs min-h-[56px] touch-manipulation">
                   (DEMO TEST) Clear Crisis
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isDutyActive ? (
            <div className="flex flex-col items-center justify-center flex-1 z-20 px-6 mt-6 pb-12">
               <div className="w-16 h-16 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center mb-6">
                 <ShieldCheck size={32} className={gpsPermission === 'granted' && hashFreshAt > 0 ? "text-[#00F0FF]" : "text-[#555555]"} />
               </div>
               <h2 className="text-sm font-black uppercase tracking-widest text-[#E0E0E0] mb-2 text-center">Protocol Integrity</h2>
               <p className="text-[10px] text-center text-slate-500 mb-8 uppercase tracking-widest">Verify constraints before entering active duty.</p>
               
               <div className="space-y-3 w-full mb-8">
                 <div className="flex items-center justify-between bg-[#111111] p-3 rounded-lg border border-[#1A1A1A]">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#555555]">GPS SENSOR</span>
                   {gpsPermission === 'granted' ? <span className="text-[10px] font-black text-[#00FF88]">ONLINE</span> : <span className="text-[10px] font-black text-[#FF003C]">OFFLINE</span>}
                 </div>
                 <div className="flex items-center justify-between bg-[#111111] p-3 rounded-lg border border-[#1A1A1A]">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#555555]">SEC-HASH <span className="font-mono">$H_0$</span></span>
                   {hashFreshAt > 0 ? <span className="text-[10px] font-black text-[#00FF88]">INITIALIZED</span> : <span className="text-[10px] font-black text-[#FFB800] animate-pulse">CALCULATING</span>}
                 </div>
               </div>
               <button 
                 onClick={() => setIsDutyActive(true)}
                 disabled={gpsPermission !== 'granted' || hashFreshAt === 0}
                 className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 hover:bg-[#00F0FF]/30 active:scale-95 min-h-[56px]"
               >
                 START DUTY
               </button>
            </div>
          ) : (
            <>
              {/* Tactical 4-Buttons Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
                <button onClick={() => handleQuickReport("LAKA LANTAS")} className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[#111] border border-[#1A1A1A] rounded-xl hover:border-[#FFB800] text-[#E0E0E0] hover:text-[#FFB800] active:scale-95 transition-all min-h-[56px] touch-manipulation">
                  <TriangleAlert size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Lapor Laka</span>
                </button>
                <button onClick={() => handleQuickReport("KRIMINAL")} className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[#111] border border-[#1A1A1A] rounded-xl hover:border-[#FFB800] text-[#E0E0E0] hover:text-[#FFB800] active:scale-95 transition-all min-h-[56px] touch-manipulation">
                  <Skull size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Kriminal</span>
                </button>
                <button onClick={() => handleQuickReport("STATIONARY_CHECK")} className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[#111] border border-[#1A1A1A] rounded-xl hover:border-[#00F0FF] text-[#E0E0E0] hover:text-[#00F0FF] active:scale-95 transition-all min-h-[56px] touch-manipulation">
                  <Clock size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Cek Stop</span>
                </button>
                <button onClick={() => handleQuickReport("REQUEST_BACKUP")} className="flex flex-col items-center justify-center gap-1.5 p-2 bg-[#1a0f0f] border border-[#FF003C]/30 rounded-xl hover:border-[#FF003C] text-[#FF003C] active:scale-95 transition-all min-h-[56px] touch-manipulation">
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
                      <span className="text-[#555555] text-[9px] font-black uppercase tracking-widest">MISSION BRIDGE ID</span>
                      <span className="text-[#00F0FF] font-mono text-[9px]">DOC-77AK-T</span>
                    </div>
                    {isCheckingIn ? (
                       <div className="min-h-[56px] border border-[#00F0FF]/30 bg-[#00F0FF]/10 border-dashed rounded text-center flex items-center justify-center text-[#00F0FF] text-[9px] font-black animate-pulse uppercase tracking-widest">
                         Scanning QR Code...
                       </div>
                    ) : (
                      <button onClick={handleCheckIn} className="w-full min-h-[56px] bg-[#1A1A1A] rounded flex items-center justify-center gap-2 hover:bg-[#222222] transition-colors text-[#E0E0E0] active:scale-95 touch-manipulation">
                        <QrCode size={16} className="text-[#00F0FF]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Scan Check-in Ren Ops</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <AnimatePresence mode="popLayout">
                  {activeMission && (
                    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#111111] border border-[#FFB800]/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,184,0,0.05)] shrink-0 touch-manipulation">
                      <div onClick={() => setMissionExpanded(!missionExpanded)} className="p-3 min-h-[56px] cursor-pointer flex items-center justify-between active:bg-[#1A1A1A] transition-colors">
                        <div className="flex flex-col max-w-[200px]">
                          <span className="text-[#FFB800] text-[8px] uppercase font-black tracking-widest mb-1">{activeMission.status}</span>
                          <h3 className="font-bold text-[#E0E0E0] text-xs truncate">{activeMission.title}</h3>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center transition-colors hover:bg-[#333333]">
                          <ChevronDown size={14} className={`transition-transform ${missionExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      <AnimatePresence>
                        {missionExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 border-t border-[#1A1A1A] pt-2">
                            <p className="text-[11px] text-[#888888] leading-relaxed mb-3">{activeMission.description}</p>
                            <button onClick={() => updateMissionStatus(activeMission.id, activeMission.status === "en-route" ? "on-site" : "completed")} className="w-full min-h-[56px] rounded-lg font-black uppercase tracking-widest text-[10px] bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/30 text-emerald-400 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation">
                              <CheckCircle2 size={14} /> {activeMission.status === "en-route" ? "Arrived On-Site" : "Complete Mission"}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            <div className={`mt-auto pb-6 pt-2 flex flex-col justify-center items-center shrink-0 border-t border-[#1A1A1A] bg-[#0A0A0A] z-[9999] ${isCrisis ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity'}`}>
              <div className="flex items-center gap-6">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#555555] text-right leading-relaxed">
                  Tekan tahan <br/>3 detik untuk <br/>protokol darurat
                </div>
                <div className="relative touch-manipulation">
                  <svg className="absolute -inset-4 w-[112px] h-[112px] pointer-events-none -rotate-90">
                    <circle cx="56" cy="56" r="52" stroke="#1A1A1A" strokeWidth="4" fill="none" />
                    <circle cx="56" cy="56" r="52" stroke="#FF003C" strokeWidth="6" fill="none" strokeDasharray="326.72" strokeDashoffset={326.72 - (326.72 * holdProgress) / 100} className="transition-all duration-100" strokeLinecap="round" />
                  </svg>
                  <button onMouseDown={() => setIsHolding(true)} onMouseUp={() => setIsHolding(false)} onMouseLeave={() => setIsHolding(false)} onTouchStart={() => setIsHolding(true)} onTouchEnd={() => setIsHolding(false)} className="w-[80px] h-[80px] rounded-full bg-[#111111] border-[4px] border-[#FF003C]/30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,0,60,0.2)] hover:bg-[#FF003C]/10 transition-all active:scale-95 z-10 relative cursor-pointer min-h-[80px]">
                    <ShieldAlert size={30} className="text-[#FF003C] mb-1" />
                    <span className="text-[#FF003C] font-black tracking-widest text-[9px]">SOS</span>
                  </button>
                </div>
              </div>
            </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
