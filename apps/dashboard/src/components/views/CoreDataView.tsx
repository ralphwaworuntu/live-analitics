"use client";

import React, { useState } from "react";
import { 
  Search, 
  Download, 
  MapPin, 
  Eye, 
  Shield,
  User,
  Car,
  Zap,
  Bot,
  PhoneCall,
  FileText,
  Video,
  X,
  Columns2,
  Check
} from "lucide-react";
import Image from "next/image";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper,
  getFilteredRowModel
} from "@tanstack/react-table";
import { useAppStore } from "@/store";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { playTacticalSound } from "@/lib/tactical-feedback";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Mic, Image as ImageIcon, FileText as FileIcon, History } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- TYPES FOR CORE DATA ---

type SyncStatus = "LIVE" | "SYNCED";
type VerificationStatus = "Unverified" | "Verified" | "Validated";

type Evidence = {
  type: "image" | "audio" | "file";
  url: string;
  timestamp: string;
};

type AuditEntry = {
  actor: string | { name: string; nrp: string };
  action: string;
  target?: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
};

type Incident = {
  id: string; // K-2026-[POLRES]-XXX
  type: "Curanmor" | "Laka Lantas" | "Pencurian" | "SOS";
  locationName: string;
  lat: number;
  lng: number;
  responder: { name: string; nrp: string };
  responseTime: string; 
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "On-Progress" | "Verified";
  sync: SyncStatus;
  evidence: Evidence[];
  verification: VerificationStatus;
  auditTrail: AuditEntry[];
  responseTimeTrend: "up" | "down" | "stable"; // Analytics
};

type Personnel = {
  id: string; // NRP
  name: string;
  rank: string;
  position: string;
  satker: string;
  status: "Online" | "Mako" | "Offline";
  lastPing: string;
  equipment: { weaponSerial: string; htStatus: "Active" | "Inactive" };
  photo: string;
  phone: string;
  lat: number;
  lng: number;
  sync: SyncStatus;
  commandLog: { instruction: string; dispatcher: string; timestamp: string }[];
  auditTrail: AuditEntry[];
  // HIGH PRECISION TELEMETRY
  batteryLevel: number;
  signalStatus: "LTE" | "5G" | "3G" | "H+" | "No Signal";
  topSpeed: number;
  harshBrakingCount: number;
  isFakeGPS: boolean;
  isUndercover: boolean;
};

type Asset = {
  id: string; // License Plate
  type: "R2" | "R4" | "R6";
  odometer: number;
  fuelQuota: number;
  fuelConsumed: number;
  efficiency: number; // KM/Liter
  condition: "Ready" | "Maintenance" | "Broken";
  sync: SyncStatus;
  integrityFlag: boolean; // True if GPS deviates from Fuel
  auditTrail: AuditEntry[];
  distanceTrend: number[]; // Sparkline data (last 7 days)
};

import mockDataRaw from "@/lib/mock-core-data.json";

const mockIncidents = mockDataRaw.mockIncidents as Incident[];
const mockPersonnel = mockDataRaw.mockPersonnel as Personnel[];
const mockAssets = mockDataRaw.mockAssets as Asset[];

// --- SUB-COMPONENTS: TABLES ---

// --- ANALYTICS COMPONENTS ---

const Sparkline = ({ data, color = "#D4AF37" }: { data: number[], color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(max - min, 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - min) / range) * 100}`).join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-8 overflow-visible">
       <polyline
         fill="none"
         stroke={color}
         strokeWidth="8"
         strokeLinecap="round"
         strokeLinejoin="round"
         points={points}
       />
    </svg>
  );
};

const columnHelperIncident = createColumnHelper<Incident>();
const columnHelperPersonnel = createColumnHelper<Personnel>();
const columnHelperAsset = createColumnHelper<Asset>();

const IncidentTable = ({ searchQuery, selectedIds = [], onSelectIds = () => {} }: { searchQuery: string, selectedIds?: string[], onSelectIds?: (ids: string[]) => void }) => {
  const setMapCenter = useAppStore(state => state.setMapCenter);
  const addAuditLog = useAppStore(state => state.addAuditLog);
  const auditLogs = useAppStore(state => state.auditLogs);

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState<Evidence[] | null>(null);

  const handleAIIntervention = (id: string) => {
    addAuditLog({
      actor: "Operator Biro Ops (Live)",
      action: "Trigger AI Intervention",
      target: id,
      details: "Sistem meminta rekomendasi pengerahan unit khusus untuk eskalasi insiden."
    });
    alert(`AI Intelligence: Menganalisa pengerahan unit untuk ${id}...`);
  };

  const columns = [
    columnHelperIncident.display({
      id: "select",
      header: ({ table }) => (
        <div className="px-1">
          <button 
            onClick={() => {
               const allIds = table.getRowModel().rows.map(row => row.original.id);
               onSelectIds(selectedIds.length === allIds.length ? [] : allIds);
            }}
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all",
              selectedIds.length === mockIncidents.length ? "bg-[#D4AF37] border-[#D4AF37]" : "border-white/20 bg-white/5"
            )}
          >
             {selectedIds.length === mockIncidents.length && <Check size={10} className="text-black" />}
          </button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <button 
            onClick={() => {
               onSelectIds(selectedIds.includes(row.original.id) ? selectedIds.filter(id => id !== row.original.id) : [...selectedIds, row.original.id]);
            }}
            className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all",
              selectedIds.includes(row.original.id) ? "bg-[#D4AF37] border-[#D4AF37]" : "border-white/20 bg-white/5"
            )}
          >
             {selectedIds.includes(row.original.id) && <Check size={10} className="text-black" />}
          </button>
        </div>
      ),
    }),
    columnHelperIncident.accessor("sync", {
      header: "Status",
      cell: info => {
        const val = info.getValue();
        return (
          <div className="flex items-center gap-2">
            {val === "LIVE" ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-500">
                SYNCED
              </div>
            )}
          </div>
        );
      }
    }),
    columnHelperIncident.accessor("id", {
      header: "ID Kejadian",
      cell: info => {
        const id = info.getValue();
        const type = info.row.original.type;
        const loc = info.row.original.locationName;
        // Logic for Linked Pattern
        const isLinked = mockIncidents.some(inc => inc.id !== id && inc.type === type && inc.locationName === loc);
        
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#D4AF37] font-bold tracking-wider">{id}</span>
            {isLinked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="p-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                      <Zap size={10} className="animate-pulse" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px] font-black uppercase">Potential Serial Pattern Linked</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      }
    }),
    columnHelperIncident.accessor("type", {
      header: "Jenis Spesifik",
      cell: info => {
        const val = info.getValue();
        return (
          <Badge variant={val === "SOS" ? "danger" : val === "Laka Lantas" ? "info" : "gold"}>
            {val}
          </Badge>
        );
      }
    }),
    columnHelperIncident.accessor("locationName", {
      header: "Sektor & Titik",
      cell: info => (
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <MapPin size={14} className="text-blue-500" />
          {info.getValue()}
        </div>
      )
    }),
    columnHelperIncident.accessor("responder", {
      header: "Personil Terlibat",
      cell: info => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-200">{info.getValue().name}</span>
          <span className="text-[10px] font-mono text-slate-500">NRP. {info.getValue().nrp}</span>
        </div>
      )
    }),
    columnHelperIncident.accessor("responseTime", {
      header: "Waktu Respon",
      cell: info => {
        const trend = info.row.original.responseTimeTrend;
        return (
          <div className="flex flex-col">
             <span className="font-mono text-slate-400">{info.getValue()}</span>
             <div className="flex items-center gap-1">
                {trend === "down" && <span className="text-[8px] text-emerald-500 font-black uppercase">Faster ↓</span>}
                {trend === "up" && <span className="text-[8px] text-red-500 font-black uppercase">Slower ↑</span>}
                {trend === "stable" && <span className="text-[8px] text-slate-500 font-black uppercase">Stable —</span>}
             </div>
          </div>
        );
      }
    }),
    columnHelperIncident.accessor("verification", {
      header: "Verifikasi",
      cell: info => {
        const val = info.getValue();
        return (
          <Badge variant={val === "Validated" ? "gold" : val === "Verified" ? "info" : "outline"} className="text-[9px] uppercase">
            {val === "Validated" ? "Validated (Karo Ops)" : val === "Verified" ? "Verified (Kasi Ops)" : "Unverified"}
          </Badge>
        );
      }
    }),
    columnHelperIncident.accessor("evidence", {
      header: "Evidence",
      cell: info => (
        <div className="flex items-center gap-2">
          {info.getValue().map((ev, i) => (
            <button 
              key={i} 
              onClick={() => setShowGallery(info.getValue())}
              className="p-1.5 bg-white/5 border border-white/10 rounded hover:bg-[#D4AF37]/20 transition-all text-slate-400 hover:text-[#D4AF37] cursor-pointer"
            >
              {ev.type === "image" && <ImageIcon size={12} />}
              {ev.type === "audio" && <Mic size={12} />}
              {ev.type === "file" && <FileIcon size={12} />}
            </button>
          ))}
        </div>
      )
    }),
    columnHelperIncident.display({
      id: "tactical",
      header: "Intervensi AI",
      cell: props => (
        <button 
          onClick={() => handleAIIntervention(props.row.original.id)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black text-blue-400 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
        >
          <Bot size={12} /> SARAN UNIT
        </button>
      )
    }),
    columnHelperIncident.display({
      id: "actions",
      header: "Aksi",
      cell: props => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMapCenter({ lat: props.row.original.lat, lng: props.row.original.lng, zoom: 15 })}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:bg-[#D4AF37] hover:text-slate-950 transition-all cursor-pointer"
          >
            Buka di Peta
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer">
            <Eye size={16} />
          </button>
          <button 
            onClick={() => setSelectedAuditId(props.row.original.id)}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-[#D4AF37] transition-colors cursor-pointer"
          >
            <History size={16} />
          </button>
        </div>
      )
    })
  ];

  const table = useReactTable({
    data: mockIncidents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: searchQuery },
  });

  return (
    <div className="relative">
      <div className="overflow-x-auto custom-scrollbar">
        <Table className="min-w-[1100px]">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow 
                key={row.id} 
                className={cn(
                  row.original.type === "SOS" && "bg-red-500/[0.03] border-red-500/20 animate-[pulse-danger_3s_infinite]",
                  selectedIds.includes(row.original.id) && "bg-[#D4AF37]/10 border-[#D4AF37]/30"
                )}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <AnimatePresence>
        {selectedAuditId && (
          <AuditTrailSheet 
            targetId={selectedAuditId} 
            onClose={() => setSelectedAuditId(null)} 
            logs={auditLogs.filter(l => l.target === selectedAuditId) as AuditEntry[]}
          />
        )}
        {showGallery && (
          <MediaGalleryModal 
            evidence={showGallery} 
            onClose={() => setShowGallery(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PersonnelTable = ({ searchQuery }: { searchQuery: string }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const addAuditLog = useAppStore(state => state.addAuditLog);
  const auditLogs = useAppStore(state => state.auditLogs);
  const pushNotification = useAppStore(state => state.pushNotification);

  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCallUnit = (name: string, nrp: string) => {
    addAuditLog({
      actor: "Operator Biro Ops (Live)",
      action: "Panggil Unit (Comms)",
      target: `${name} (${nrp})`,
      details: "Membuka jalur komunikasi taktis via VOIP/Radio Link."
    });
    pushNotification({
      title: "Tactical Comms",
      description: `Jalur radio/VOIP ke unit ${name} sedang disambungkan...`,
      level: "info"
    });
    playTacticalSound("click");
  };

  const columns = [
    columnHelperPersonnel.accessor("sync", {
      header: "Status",
      cell: info => <Badge variant={info.getValue() === "LIVE" ? "success" : "info"} className="text-[8px] animate-pulse">{info.getValue()}</Badge>
    }),
    columnHelperPersonnel.accessor("id", {
      header: "NRP & Nama",
      cell: info => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 cursor-help group">
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-[10px] overflow-hidden">
                  {info.row.original.photo ? (
                    <Image 
                      src={info.row.original.photo} 
                      alt={info.row.original.name} 
                      width={32} 
                      height={32} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-slate-500">{info.row.original.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-[#D4AF37] transition-colors">{info.row.original.name}</span>
                  <span className="font-mono text-[10px] text-slate-500 tracking-widest">{info.getValue()}</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="p-4 flex flex-col gap-2">
              <div className="w-24 h-24 rounded-lg bg-slate-800 animate-pulse mb-1" />
              <div className="font-black text-[13px]">{info.row.original.name}</div>
              <div className="text-emerald-400 font-mono text-[11px]">{info.row.original.phone}</div>
              <Badge variant="gold">Active on Field</Badge>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }),
    columnHelperPersonnel.accessor("rank", {
      header: "Pangkat & Jabatan",
      cell: info => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-[#D4AF37]">{info.getValue()}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-tight">{info.row.original.position}</span>
        </div>
      )
    }),
    columnHelperPersonnel.accessor("satker", {
      header: "Satker / Unit",
      cell: info => (
        <div className="flex flex-col">
           <span className="text-xs font-medium text-slate-300">{info.getValue()}</span>
           <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                 <Zap size={10} className={cn(info.row.original.batteryLevel < 20 ? "text-red-500" : "text-emerald-500")} />
                 <span className={cn("text-[9px] font-black", info.row.original.batteryLevel < 20 ? "text-red-500" : "text-slate-400")}>{info.row.original.batteryLevel}%</span>
              </div>
              <div className="flex items-center gap-1">
                 <div className="h-2 w-px bg-slate-700" />
                 <span className={cn("text-[9px] font-black", info.row.original.signalStatus === "No Signal" ? "text-red-500" : "text-blue-500")}>{info.row.original.signalStatus}</span>
              </div>
           </div>
        </div>
      )
    }),
    columnHelperPersonnel.display({
      id: "driving",
      header: "Driving Analytics",
      cell: props => (
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 uppercase font-black">Top Speed</span>
              <span className={cn("text-xs font-mono font-black", props.row.original.topSpeed > 80 ? "text-red-500" : "text-slate-400")}>{props.row.original.topSpeed} <span className="text-[8px] text-slate-700">km/h</span></span>
           </div>
           <div className="flex flex-col">
              <span className="text-[8px] text-slate-600 uppercase font-black">Braking</span>
              <span className={cn("text-xs font-mono font-black", props.row.original.harshBrakingCount > 2 ? "text-orange-500" : "text-slate-400")}>{props.row.original.harshBrakingCount}x</span>
           </div>
        </div>
      )
    }),
    columnHelperPersonnel.accessor("status", {
      header: "Location Integrity",
      cell: info => {
        const val = info.getValue();
        const { isFakeGPS } = info.row.original;
        return (
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  val === "Online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-700"
                )} />
                <span className="text-[10px] font-black uppercase text-slate-400">{val}</span>
             </div>
             {isFakeGPS && (
               <Badge variant="danger" className="text-[8px] animate-pulse">FAKE GPS DETECTED</Badge>
             )}
          </div>
        );
      }
    }),
    columnHelperPersonnel.accessor("lastPing", {
      header: "Last Ping",
      cell: info => <span className="text-[10px] font-mono text-slate-500">{info.getValue()}</span>
    }),
    columnHelperPersonnel.accessor("equipment", {
      header: "Kelengkapan",
      cell: info => (
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
              <span className="text-[9px] text-slate-600 uppercase font-black">Senjata</span>
              <span className="text-[10px] font-mono text-slate-400">{info.getValue().weaponSerial}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[9px] text-slate-600 uppercase font-black">HT State</span>
              <span className={cn("text-[10px] font-black", info.getValue().htStatus === "Active" ? "text-emerald-500" : "text-red-500")}>{info.getValue().htStatus}</span>
           </div>
        </div>
      )
    }),
    columnHelperPersonnel.display({
      id: "tactical",
      header: "Panggil Unit",
      cell: props => (
        <button 
          onClick={() => handleCallUnit(props.row.original.name, props.row.original.id)}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
        >
          <PhoneCall size={12} /> CALL UNIT
        </button>
      )
    }),
    columnHelperPersonnel.display({
      id: "actions",
      header: "Aksi",
      cell: props => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedPersonnelId(props.row.original.id);
            }}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all cursor-pointer"
          >
             <User size={18} />
          </button>
          <button 
            onClick={() => setSelectedAuditId(props.row.original.id)}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-[#D4AF37] transition-all cursor-pointer"
          >
             <History size={18} />
          </button>
        </div>
      )
    })
  ];

  const table = useReactTable({
    data: mockPersonnel,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: searchQuery },
  });

  if (isLoading) {
    return (
      <div className="p-4 bg-[#0B1B32] rounded-xl border border-white/5">
        <TableSkeleton rows={12} cols={6} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto custom-scrollbar">
        <Table className="min-w-[1100px]">
          <TableHeader>
            {table.getHeaderGroups().map(group => (
              <TableRow key={group.id}>
                {group.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AnimatePresence>
        {selectedPersonnelId && (
          <PersonnelDetailSheet 
            person={mockPersonnel.find(p => p.id === selectedPersonnelId)!} 
            onClose={() => setSelectedPersonnelId(null)} 
          />
        )}
        {selectedAuditId && (
          <AuditTrailSheet 
            targetId={selectedAuditId} 
            onClose={() => setSelectedAuditId(null)} 
            logs={auditLogs.filter(l => l.target === selectedAuditId) as AuditEntry[]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AssetTable = ({ searchQuery }: { searchQuery: string }) => {
  const addAuditLog = useAppStore(state => state.addAuditLog);
  const pushNotification = useAppStore(state => state.pushNotification);

  const handlePrintAudit = (id: string, deviation: number) => {
    addAuditLog({
      actor: "Operator Biro Ops (Live)",
      action: "Cetak Nota Audit BBM",
      target: id,
      details: `Menghasilkan laporan penyimpangan konsumsi BBM (${deviation.toFixed(1)} KM/L).`
    });
    pushNotification({
      title: "Nota Audit Diterbitkan",
      description: `Laporan audit BBM untuk ${id} telah berhasil digenerate.`,
      level: "success"
    });
    playTacticalSound("click");
  };
  const columns = [
    columnHelperAsset.accessor("sync", {
      header: "Status",
      cell: info => <Badge variant="outline" className="text-[8px]">{info.getValue()}</Badge>
    }),
    columnHelperAsset.accessor("id", {
      header: "ID Ranmor",
      cell: props => {
        const isOverdue = props.row.original.odometer >= 5000;
        return (
          <div className="flex flex-col">
            <span className="font-mono text-slate-100 font-black tracking-widest text-sm bg-white/5 px-2 py-1 rounded w-fit">{props.getValue()}</span>
            <div className="flex flex-col gap-1 mt-1">
              {props.row.original.integrityFlag && (
                <span className="text-[8px] text-red-500 font-black uppercase animate-pulse">! Fuel Anomaly</span>
              )}
              {isOverdue && (
                <span className="text-[8px] text-orange-500 font-black uppercase animate-pulse">⚙ Maint. Overdue (&gt;5000KM)</span>
              )}
            </div>
          </div>
        );
      }
    }),
    columnHelperAsset.accessor("type", {
      header: "Jenis",
      cell: info => {
        const val = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <Car size={16} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-300">{val}</span>
          </div>
        );
      }
    }),
    columnHelperAsset.accessor("odometer", {
      header: "Odometer GPS",
      cell: info => <span className="font-mono text-slate-400">{info.getValue().toLocaleString()} KM</span>
    }),
    columnHelperAsset.display({
      id: "alokasi",
      header: "Alokasi vs Konsumsi",
      cell: props => {
        const { fuelQuota, fuelConsumed } = props.row.original;
        const pct = (fuelConsumed / fuelQuota) * 100;
        return (
          <div className="w-48 space-y-1.5">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
              <span className="text-slate-500">{fuelConsumed} L</span>
              <span className="text-slate-300">{fuelQuota} L Limit</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
               <div 
                 className={cn("h-full transition-all duration-1000", pct > 90 ? "bg-red-500" : "bg-blue-500")} 
                 style={{ width: `${Math.min(pct, 100)}%` }} 
               />
            </div>
          </div>
        );
      }
    }),
    columnHelperAsset.accessor("efficiency", {
      header: "Indeks Efisiensi",
      cell: info => {
        const val = info.getValue();
        return (
          <span className={cn(
            "font-mono font-bold text-sm",
            val < 5 ? "text-red-500 animate-pulse font-black" : "text-emerald-400"
          )}>
            {val.toFixed(1)} KM/L
          </span>
        );
      }
    }),
    columnHelperAsset.accessor("distanceTrend", {
      header: "Tren 7 Hari",
      cell: info => <Sparkline data={info.getValue()} color={info.row.original.integrityFlag ? "#EF4444" : "#D4AF37"} />
    }),
    columnHelperAsset.accessor("condition", {
      header: "Kondisi",
      cell: info => {
        const val = info.getValue();
        return (
          <Badge variant={val === "Ready" ? "success" : val === "Maintenance" ? "gold" : "danger"}>
            {val}
          </Badge>
        );
      }
    }),
    columnHelperAsset.display({
      id: "integrity",
      header: "Logistics Integrity",
      cell: props => (
        <div className="flex items-center gap-2">
          {props.row.original.integrityFlag ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-[9px] font-black text-red-500 animate-pulse">
              <Zap size={10} /> FUEL ANOMALY
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[9px] font-black text-emerald-500">
              <Check size={10} /> VALID
            </div>
          )}
        </div>
      )
    }),
    columnHelperAsset.display({
      id: "binding",
      header: "NFC/QR Binding",
      cell: props => (
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[9px] font-black text-blue-400 hover:bg-blue-500/20 transition-all scale-press">
          <Zap size={10} /> BIND TO NRP
        </button>
      )
    }),
    columnHelperAsset.display({
      id: "actions",
      header: "Aksi",
      cell: props => (
        <button 
          onClick={() => handlePrintAudit(props.row.original.id, props.row.original.efficiency)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
        >
          <FileText size={12} /> CETAK NOTA
        </button>
      )
    })
  ];

  const table = useReactTable({
    data: mockAssets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: searchQuery },
  });

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <Table className="min-w-[900px]">
        <TableHeader>
          {table.getHeaderGroups().map(group => (
            <TableRow key={group.id}>
              {group.headers.map(header => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// --- MAIN VIEW COMPONENT ---

export default function CoreDataView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<string[]>([]);
  
  const tagSuggestions = [
    { label: "Status: SOS", color: "red" },
    { label: "Wilayah: Kupang Kota", color: "blue" },
    { label: "Prioritas: High", color: "yellow" },
    { label: "Unit: Online", color: "emerald" }
  ];

  const handleToggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1B32]/30 backdrop-blur-sm overflow-hidden p-3 md:p-6 lg:p-10 gap-4 md:gap-6 relative">
      {/* Floating Bulk Actions */}
      <AnimatePresence>
        {selectedIncidentIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-[#0B1B32]/95 border border-[#D4AF37]/50 backdrop-blur-xl rounded-full px-8 py-4 shadow-[0_0_50px_rgba(212,175,55,0.2)] flex items-center gap-8"
          >
             <div className="flex flex-col pr-8 border-r border-white/10">
                <span className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest">{selectedIncidentIds.length} Baris Terpilih</span>
                <span className="text-[8px] text-slate-500 uppercase font-bold">Tactical Bulk Commands</span>
             </div>
             <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full text-[10px] font-black uppercase text-slate-200 transition-all border border-transparent hover:border-white/10 scale-press transition-transform">
                   <PhoneCall size={12} /> Kirim Notifikasi
                </button>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full text-[10px] font-black uppercase text-slate-200 transition-all border border-transparent hover:border-white/10 scale-press transition-transform">
                   <Download size={12} /> Eksport Terpilih
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-[#D4AF37] text-black rounded-full text-[10px] font-black uppercase shadow-lg shadow-[#D4AF37]/20 scale-press transition-transform">
                   Validasi Massal
                </button>
             </div>
             <button 
               onClick={() => setSelectedIncidentIds([])}
               className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
             >
                <X size={16} />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-3xl lg:text-5xl font-black uppercase tracking-tighter text-white text-balance">Core Data Audit Engine</h2>
            {compareMode && <Badge variant="gold" className="animate-pulse">Benchmarking Mode: ACTIVE</Badge>}
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.3em] text-balance">Biro Ops Polda Nusa Tenggara Timur</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCompareMode(!compareMode)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 border scale-press",
              compareMode ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20"
            )}
          >
             <Columns2 size={14} /> {compareMode ? "Stop Benchmarking" : "Compare Mode"}
          </button>
          <div className="flex items-center bg-[#0B1B32]/50 border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-[#D4AF37]/50 transition-all">
            <Search className="text-slate-500 mr-2" size={18} />
            <input 
              type="text" 
              placeholder="Search by NRP, Tag, or Sector..." 
              className="bg-transparent border-none outline-none text-white text-sm w-72 placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#B8962F] text-black rounded-2xl text-sm font-black uppercase transition-all shadow-lg shadow-[#D4AF37]/20 scale-press">
            <Download size={18} /> Export Anev
          </button>
        </div>
      </div>

      {/* Smart Tag Filtering */}
      <div className="flex items-center gap-3">
         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mr-2">Quick Filters:</span>
         <div className="flex items-center gap-2">
            {tagSuggestions.map((tag, i) => (
               <button 
                 key={i}
                 onClick={() => handleToggleTag(tag.label)}
                 className={cn(
                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all scale-press",
                    activeTags.includes(tag.label) 
                      ? "bg-white text-black border-white" 
                      : "bg-white/5 text-slate-500 border-white/10 hover:border-white/20"
                 )}
               >
                  {tag.label}
               </button>
            ))}
         </div>
      </div>

      <div className={cn("grid gap-6 h-full min-h-0", compareMode ? "grid-cols-2" : "grid-cols-1 overflow-hidden")}>
         <div className="flex flex-col gap-4 overflow-hidden h-full">
            {compareMode && (
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-black uppercase text-blue-400">Primary Instance (Polres Kupang Kota)</span>
              </div>
            )}
            <div className="flex-1 overflow-hidden bg-[#0B1B32]/40 border border-white/5 rounded-[40px] p-2 backdrop-blur-xl flex flex-col h-full min-h-0">
              <Tabs defaultValue="kejadian" className="h-full flex flex-col min-h-0">
                <TabsList className="bg-white/5 p-1.5 rounded-full w-fit mb-4 ml-4 mt-4">
                  <TabsTrigger value="kejadian" className="rounded-full px-6 py-2 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-[10px] font-black uppercase transition-all">Kejadian</TabsTrigger>
                  <TabsTrigger value="personil" className="rounded-full px-6 py-2 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-[10px] font-black uppercase transition-all">Personil</TabsTrigger>
                  <TabsTrigger value="aset" className="rounded-full px-6 py-2 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-[10px] font-black uppercase transition-all">Aset / BBM</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto custom-scrollbar px-4 pb-4">
                  <TabsContent value="kejadian" className="m-0 h-full">
                    <IncidentTable 
                      searchQuery={searchQuery} 
                      selectedIds={selectedIncidentIds} 
                      onSelectIds={setSelectedIncidentIds} 
                    />
                  </TabsContent>
                  <TabsContent value="personil" className="m-0 h-full"><PersonnelTable searchQuery={searchQuery} /></TabsContent>
                  <TabsContent value="aset" className="m-0 h-full"><AssetTable searchQuery={searchQuery} /></TabsContent>
                </div>
              </Tabs>
            </div>
         </div>

         {compareMode && (
           <motion.div 
             initial={{ x: 100, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="flex flex-col gap-4 overflow-hidden border-l border-white/5 pl-6 h-full"
           >
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-black uppercase text-[#D4AF37]">Secondary Instance (Polres Belu)</span>
              </div>
              <div className="flex-1 overflow-hidden bg-[#0B1B32]/40 border border-white/5 rounded-[40px] p-2 backdrop-blur-xl flex flex-col h-full min-h-0">
                 <Tabs defaultValue="kejadian" className="h-full flex flex-col min-h-0">
                    <TabsList className="bg-white/5 p-1.5 rounded-full w-fit mb-4 ml-4 mt-4">
                       <TabsTrigger value="kejadian" className="rounded-full px-6 py-2 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-[10px] font-black uppercase transition-all">Kejadian</TabsTrigger>
                       <TabsTrigger value="aset" className="rounded-full px-6 py-2 data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black text-[10px] font-black uppercase transition-all">Aset / BBM</TabsTrigger>
                    </TabsList>
                    <div className="flex-1 overflow-auto custom-scrollbar px-4 pb-4">
                       <TabsContent value="kejadian" className="m-0 h-full">
                          <IncidentTable 
                            searchQuery={searchQuery} 
                            selectedIds={[]} 
                            onSelectIds={() => {}} 
                          />
                       </TabsContent>
                       <TabsContent value="aset" className="m-0 h-full"><AssetTable searchQuery={searchQuery} /></TabsContent>
                    </div>
                 </Tabs>
              </div>
           </motion.div>
         )}
      </div>
            <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-[#0B1B32] flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Database Synchronized</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> GIS Layer Attached</div>
              </div>
               <div className="flex items-center gap-6">
                  <span>NTT-OPS Core Ver. 4.2.1-GOLD</span>
                  <span className="text-slate-700">|</span>
                  <span>Latency: 24ms</span>
               </div>
            </div>
      <style jsx global>{`
        @keyframes pulse-danger {
          0%, 100% { background-color: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2); }
          50% { background-color: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.5); }
        }
        .scale-press:active { transform: scale(0.96); }
      `}</style>
    </div>
  );
}

// --- HELPER COMPONENTS: SHEETS ---

const AuditTrailSheet = ({ targetId, onClose, logs }: { targetId: string, onClose: () => void, logs: AuditEntry[] }) => {
  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-0 right-0 h-full w-[450px] bg-[#07111F] border-l border-white/10 z-[100] shadow-2xl p-8 flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <History className="text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Immutable Audit Log</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Cryptographic Integrity Protocol V2</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
        <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Entity Trace ID</div>
        <div className="text-xs font-mono text-[#D4AF37] font-black bg-black/40 p-2 rounded border border-[#D4AF37]/20 break-all">{targetId}</div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        {logs.length > 0 ? logs.map((log, idx) => (
          <div key={idx} className="relative pl-6">
             {/* Timeline bar */}
             <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
             <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-blue-500 border-2 border-[#07111F]" />

             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-tight">{log.action || "INTEGRITY_SYNC"}</span>
                <span className="text-[9px] font-mono text-slate-500">{log.timestamp}</span>
             </div>

             <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                {log.oldValue && (
                   <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex flex-col gap-1">
                         <span className="text-[8px] text-red-400 font-bold uppercase opacity-60">Prev Value</span>
                         <div className="text-[10px] font-mono bg-red-400/5 p-1.5 rounded border border-red-400/10 line-through text-red-500">{log.oldValue}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[8px] text-emerald-400 font-bold uppercase opacity-60">New Value</span>
                         <div className="text-[10px] font-mono bg-emerald-400/5 p-1.5 rounded border border-emerald-400/10 text-emerald-500">{log.newValue}</div>
                      </div>
                   </div>
                )}
                {log.details && <p className="text-[11px] text-slate-400 leading-relaxed mb-3 italic">&ldquo;{log.details}&rdquo;</p>}
                
                 <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] text-slate-100 font-black border border-white/10 uppercase">
                          {typeof log.actor === "string" ? log.actor.charAt(0) : log.actor.name.charAt(0)}
                       </div>
                       <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black text-slate-200">
                             {typeof log.actor === "string" ? log.actor : log.actor.name}
                          </span>
                          <span className="text-[7px] font-mono text-slate-600">
                             NRP. {typeof log.actor === "string" ? "SYSTEM" : log.actor.nrp}
                          </span>
                       </div>
                    </div>
                   <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[7px] font-black text-emerald-500 uppercase">Verified</div>
                </div>
             </div>
          </div>
        )) : (
          <div className="h-40 flex flex-col items-center justify-center text-slate-600 italic text-[10px] gap-2">
            <Zap size={24} className="opacity-20 translate-y-2" />
            No baseline anomalies detected.
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PersonnelDetailSheet = ({ person, onClose }: { person: Personnel, onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-0 right-0 h-full w-[500px] bg-[#0B1B32] border-l border-white/10 z-[100] shadow-2xl p-8 flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="text-[#D4AF37]" size={20} />
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Personnel Dossier</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-[#D4AF37]/30 p-1">
          <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-white/5 relative">
            {person.photo ? (
              <Image src={person.photo} alt={person.name} width={100} height={100} className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-slate-700" />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-xl font-black text-white leading-none mb-1 tracking-tight">{person.name}</h3>
          <span className="text-xs font-mono font-bold text-[#D4AF37] mb-3 uppercase tracking-widest">NRP: {person.id}</span>
          <div className="flex gap-2">
            <Badge variant="success" className="text-[8px] px-2 py-0.5">TERVERIFIKASI</Badge>
            <Badge variant="gold" className="text-[8px] px-2 py-0.5 font-bold">CORE RESPONDER</Badge>
          </div>
        </div>
      </div>

      {/* COMMAND LOG AREA */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
           <Zap size={14} className="text-[#D4AF37]" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Active Command Log</span>
        </div>
        <div className="space-y-3">
           {person.commandLog?.map((log, i) => (
             <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all" />
                <div className="flex flex-col gap-1 flex-1">
                   <div className="flex justify-between items-center">
                      <span className="text-[8px] text-blue-500 font-black uppercase tracking-tighter">Disp. {log.dispatcher}</span>
                      <span className="text-[7px] font-mono text-slate-600">{log.timestamp}</span>
                   </div>
                   <div className="text-[11px] text-slate-200 leading-snug font-medium italic">&ldquo;{log.instruction}&rdquo;</div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* VIDEO FEED PLAYER (SIMULATION) */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Video size={14} className="text-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">Body-cam Tactical Feed</span>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Live</span>
           </div>
        </div>
        <div className="aspect-video bg-slate-950 rounded-2xl border border-white/5 relative overflow-hidden shadow-inner group">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)] z-10 pointer-events-none" />
           {/* Static/Grain Overlay */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay animate-[pulse_0.1s_infinite] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
           
           <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
              <div className="bg-black/60 px-2 py-1 rounded text-[8px] font-mono text-white/80 border border-white/10 uppercase italic">REC 00:42:15</div>
              <div className="bg-black/60 px-2 py-1 rounded text-[8px] font-mono text-white/50 border border-white/10 uppercase italic tracking-tighter">POLDA_NTT_LIVE_01</div>
           </div>

           <div className="w-full h-full flex items-center justify-center bg-slate-900 group-hover:bg-slate-800 transition-colors">
              <Video size={48} className="text-slate-800 group-hover:text-slate-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest rotate-[-15deg] border-2 border-slate-600/20 px-4 py-2 rounded-xl">Establishing Connection...</span>
              </div>
           </div>

           {/* Scanline Effect */}
           <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,128,0.06))] bg-[length:100%_4px,3px_100%] opacity-40" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <button className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-300 transition-all cursor-pointer">
          Lihat Profil Lengkap
        </button>
        <button className="py-3 bg-[#D4AF37] hover:bg-[#B8962F] rounded-xl text-[10px] font-black uppercase text-[#0B1B32] shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer">
          Hubungi Radio (Comms)
        </button>
      </div>
    </motion.div>
  );
};
// --- MEDIA GALLERY MODAL ---

const MediaGalleryModal = ({ evidence, onClose }: { evidence: Evidence[], onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
       <motion.div 
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="w-full max-w-4xl bg-[#0B1B32] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative"
       >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <ImageIcon className="text-[#D4AF37]" size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Media Evidence Gallery</h3>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                <X size={20} />
             </button>
          </div>
          
          <div className="p-8 grid grid-cols-2 gap-8">
             <div className="aspect-video bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
                <Image src={evidence[0]?.url.startsWith("/") ? "https://images.unsplash.com/photo-1557683316-973673baf926" : evidence[0]?.url} alt="Evidence" fill className="object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                   <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                      <ImageIcon size={24} />
                   </div>
                   <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-3 py-1 rounded">{evidence[0]?.url.split("/").pop()}</span>
                </div>
             </div>
             
             <div className="flex flex-col gap-4">
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                   <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-2">Metadata TPTKP ({evidence.length} Attachments)</div>
                   <div className="space-y-3">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[10px] text-slate-400">Timestamp</span>
                         <span className="text-[10px] font-mono text-white">{evidence[0]?.timestamp || "2026-04-05 08:12:44"}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[10px] text-slate-400">Total Size</span>
                         <span className="text-[10px] font-mono text-white">4.2 MB</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[10px] text-slate-400">Geo-Tag</span>
                         <span className="text-[10px] font-mono text-emerald-400">ATTACHED</span>
                      </div>
                   </div>
                </div>
                
                <div className="space-y-2">
                   {evidence.slice(1).map((ev, i) => (
                     <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                           {ev.type === "audio" && <Mic size={14} />}
                           {ev.type === "file" && <FileIcon size={14} />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                           <div className="text-[9px] font-black text-slate-200 uppercase truncate">{ev.url.split("/").pop()}</div>
                           <div className="text-[7px] text-slate-500 uppercase tracking-tighter">{ev.type} • {ev.timestamp}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end gap-3">
             <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all">Download All</button>
             <button className="px-6 py-3 bg-[#D4AF37] text-black rounded-xl text-[10px] font-black uppercase tracking-widest">Verify Evidence Content</button>
          </div>
       </motion.div>
    </div>
  );
};
