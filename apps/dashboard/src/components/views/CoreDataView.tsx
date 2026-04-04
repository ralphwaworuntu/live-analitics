"use client";

import React, { useState } from "react";
import { 
  Search, 
  Download, 
  MapPin, 
  Eye, 
  Activity,
  Shield,
  User,
  Car,
  Clock,
  Navigation,
  Calendar,
  Filter,
  Zap,
  Play,
  Bot,
  PhoneCall,
  FileText,
  FileDown,
  Fingerprint,
  Video,
  X
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { AuditLogEntry } from "@/lib/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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

type Incident = {
  id: string; // K-2026-[POLRES]-XXX
  type: "Curanmor" | "Laka Lantas" | "Pencurian" | "SOS";
  locationName: string;
  lat: number;
  lng: number;
  responder: { name: string; nrp: string };
  responseTime: string; // "08:42 min"
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "On-Progress" | "Verified";
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
};

type Asset = {
  id: string; // License Plate
  type: "R2" | "R4" | "R6";
  odometer: number;
  fuelQuota: number;
  fuelConsumed: number;
  efficiency: number; // KM/Liter
  condition: "Ready" | "Maintenance" | "Broken";
};

type PatrolHistory = {
  id: string; // Shift ID
  startTime: string;
  endTime: string;
  hotspotHitRate: number; // Percentage
  idleDuration: string;
  complianceScore: number; // 1-100
};

// --- MOCK DATA ---

const mockIncidents: Incident[] = [
  { id: "K-2026-KUPANG-042", type: "SOS", locationName: "Polres Kupang Kota", lat: -10.158, lng: 123.606, responder: { name: "Iptu Pratama", nrp: "88050912" }, responseTime: "04:15 min", priority: "High", status: "On-Progress" },
  { id: "K-2026-BELU-119", type: "Curanmor", locationName: "Polsek Atambua", lat: -9.15, lng: 124.9, responder: { name: "Bripka Yohanis", nrp: "92120045" }, responseTime: "12:30 min", priority: "Medium", status: "Pending" },
  { id: "K-2026-TTS-083", type: "Laka Lantas", locationName: "Polres TTS", lat: -9.85, lng: 124.28, responder: { name: "Aiptu Sudrajat", nrp: "85030211" }, responseTime: "08:10 min", priority: "High", status: "Verified" },
];

const mockPersonnel: Personnel[] = [
  { id: "88050912", name: "Iptu Pratama W. S.H.", rank: "Iptu", position: "Kanit Patroli", satker: "Polres Kupang Kota", status: "Online", lastPing: "2 mins ago", equipment: { weaponSerial: "HS091244", htStatus: "Active" }, photo: "", phone: "0812-3456-7890", lat: -10.16, lng: 123.61 },
  { id: "92120045", name: "Bripka Yohanis R.", rank: "Bripka", position: "Bhabinkamtibmas", satker: "Polres Belu", status: "Online", lastPing: "1 min ago", equipment: { weaponSerial: "RV455210", htStatus: "Active" }, photo: "", phone: "0811-9988-7766", lat: -9.16, lng: 124.91 },
  { id: "85030211", name: "Aiptu Sudrajat", rank: "Aiptu", position: "KSPK", satker: "Polres TTS", status: "Mako", lastPing: "15 mins ago", equipment: { weaponSerial: "HS112233", htStatus: "Inactive" }, photo: "", phone: "0852-1122-3344", lat: -9.86, lng: 124.29 },
];

const mockAssets: Asset[] = [
  { id: "DH-1234-AX", type: "R4", odometer: 15420, fuelQuota: 50, fuelConsumed: 42, efficiency: 8.5, condition: "Ready" },
  { id: "DH-5678-BY", type: "R2", odometer: 4200, fuelQuota: 10, fuelConsumed: 9.5, efficiency: 42, condition: "Ready" },
  { id: "DH-9012-CZ", type: "R6", odometer: 28900, fuelQuota: 120, fuelConsumed: 118, efficiency: 3.2, condition: "Maintenance" },
];

const mockHistory: PatrolHistory[] = [
  { id: "SH-2026-0404-P", startTime: "2026-04-04 08:00", endTime: "2026-04-04 16:00", hotspotHitRate: 88, idleDuration: "12 min", complianceScore: 94 },
  { id: "SH-2026-0404-M", startTime: "2026-04-04 20:00", endTime: "2026-04-05 04:00", hotspotHitRate: 72, idleDuration: "45 min", complianceScore: 68 },
];

// --- SUB-COMPONENTS: TABLES ---

const columnHelperIncident = createColumnHelper<Incident>();
const columnHelperPersonnel = createColumnHelper<Personnel>();
const columnHelperAsset = createColumnHelper<Asset>();
const columnHelperHistory = createColumnHelper<PatrolHistory>();

const IncidentTable = ({ searchQuery }: { searchQuery: string }) => {
  const setMapCenter = useAppStore(state => state.setMapCenter);
  const addAuditLog = useAppStore(state => state.addAuditLog);
  const auditLogs = useAppStore(state => state.auditLogs);

  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

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
    columnHelperIncident.accessor("id", {
      header: "ID Kejadian",
      cell: info => <span className="font-mono text-[#D4AF37] font-bold tracking-wider">{info.getValue()}</span>
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
      cell: info => <span className="font-mono text-slate-400">{info.getValue()}</span>
    }),
    columnHelperIncident.accessor("status", {
      header: "Priority & Status",
      cell: info => {
        const status = info.getValue();
        const priority = info.row.original.priority;
        return (
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              priority === "High" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-yellow-500"
            )} />
            <span className="text-xs font-bold uppercase tracking-tighter text-slate-400">{status}</span>
          </div>
        );
      }
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
            <Fingerprint size={16} />
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
                row.original.type === "SOS" && "bg-red-500/[0.03] border-red-500/20 animate-[pulse-danger_3s_infinite]"
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
      
      <AnimatePresence>
        {selectedAuditId && (
          <AuditTrailSheet 
            targetId={selectedAuditId} 
            onClose={() => setSelectedAuditId(null)} 
            logs={auditLogs.filter(l => l.target === selectedAuditId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const PersonnelTable = ({ searchQuery }: { searchQuery: string }) => {
  const setMapCenter = useAppStore(state => state.setMapCenter);
  const addAuditLog = useAppStore(state => state.addAuditLog);
  const auditLogs = useAppStore(state => state.auditLogs);

  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  const handleCallUnit = (name: string, nrp: string) => {
    addAuditLog({
      actor: "Operator Biro Ops (Live)",
      action: "Panggil Unit (Comms)",
      target: `${name} (${nrp})`,
      details: "Membuka jalur komunikasi taktis via VOIP/Radio Link."
    });
    alert(`Menghubungi Unit: ${name}...`);
  };

  const columns = [
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
      header: "Satker / Polres",
      cell: info => <span className="text-xs font-medium text-slate-300">{info.getValue()}</span>
    }),
    columnHelperPersonnel.accessor("status", {
      header: "Status Real-time",
      cell: info => {
        const val = info.getValue();
        return (
          <div className="flex items-center gap-2">
             <div className={cn(
               "w-2 h-2 rounded-full",
               val === "Online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-700"
             )} />
             <span className="text-[10px] font-black uppercase text-slate-400">{val}</span>
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
        <button 
          onClick={() => setMapCenter({ lat: props.row.original.lat, lng: props.row.original.lng, zoom: 16 })}
          className="p-2 hover:bg-white/10 rounded-lg text-slate-500 hover:text-[#D4AF37] transition-all cursor-pointer"
        >
          <Navigation size={18} />
        </button>
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

  return (
    <div className="relative">
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
            logs={auditLogs.filter(l => l.target === selectedAuditId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AssetTable = ({ searchQuery }: { searchQuery: string }) => {
  const addAuditLog = useAppStore(state => state.addAuditLog);

  const handlePrintAudit = (id: string, deviation: number) => {
    addAuditLog({
      actor: "Operator Biro Ops (Live)",
      action: "Cetak Nota Audit BBM",
      target: id,
      details: `Menghasilkan laporan penyimpangan konsumsi BBM (${deviation.toFixed(1)} KM/L).`
    });
    alert(`Nota Audit dicetak untuk kendaraan ${id}`);
  };
  const columns = [
    columnHelperAsset.accessor("id", {
      header: "ID Ranmor",
      cell: info => <span className="font-mono text-slate-100 font-black tracking-widest text-sm bg-white/5 px-2 py-1 rounded">{info.getValue()}</span>
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
  );
};

const HistoryTable = ({ searchQuery }: { searchQuery: string }) => {
  const addAuditLog = useAppStore(state => state.addAuditLog);

  const handleAnevReport = (id: string) => {
    addAuditLog({
      actor: "Operator Biro Ops (Live)",
      action: "Generate Anev Report (PDF)",
      target: id,
      details: "Menghasilkan dokumen analisis kepatuhan dan evaluasi patroli mingguan."
    });
    alert(`Menghasilkan PDF Anev untuk Shift ${id}...`);
  };
  const columns = [
    columnHelperHistory.accessor("id", {
      header: "ID Patroli",
      cell: info => <span className="font-mono text-[#D4AF37] font-bold text-xs">{info.getValue()}</span>
    }),
    columnHelperHistory.display({
      id: "time",
      header: "Waktu Start/End",
      cell: props => (
        <div className="flex flex-col font-mono text-[10px]">
          <span className="text-slate-300 italic">{props.row.original.startTime}</span>
          <span className="text-slate-500 italic">{props.row.original.endTime}</span>
        </div>
      )
    }),
    columnHelperHistory.accessor("hotspotHitRate", {
      header: "Hotspot Hit Rate",
      cell: info => (
        <div className="flex items-center gap-2">
           <Zap size={14} className={cn(info.getValue() > 80 ? "text-yellow-500" : "text-slate-600")} />
           <span className="font-mono font-black text-slate-200">{info.getValue()}%</span>
        </div>
      )
    }),
    columnHelperHistory.accessor("idleDuration", {
      header: "Durasi Idle",
      cell: info => <span className="text-xs font-mono text-red-400 font-bold">{info.getValue()}</span>
    }),
    columnHelperHistory.accessor("complianceScore", {
      header: "Compliance Score",
      cell: info => {
        const val = info.getValue();
        return (
          <div className="flex items-center gap-3">
             <div className="flex-1 min-w-[60px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full", val > 80 ? "bg-emerald-500" : "bg-red-500")} 
                  style={{ width: `${val}%` }} 
                />
             </div>
             <span className="text-xs font-black font-mono text-slate-300">{val}</span>
          </div>
        );
      }
    }),
    columnHelperHistory.display({
      id: "actions",
      header: "Aksi",
      cell: props => (
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg text-[10px] font-black text-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-950 transition-all cursor-pointer">
            <Play size={10} fill="currentColor" /> PLAYBACK
          </button>
          <button 
            onClick={() => handleAnevReport(props.row.original.id)}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] font-black text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
          >
            <FileDown size={12} /> ANEV REPORT
          </button>
        </div>
      )
    })
  ];

  const table = useReactTable({
    data: mockHistory,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: searchQuery },
  });

  return (
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
  );
};

// --- MAIN VIEW ---

export default function CoreDataView() {
  const [activeTab, setActiveTab] = useState<"kejadian" | "personil" | "aset" | "riwayat">("kejadian");
  const [searchQuery, setSearchQuery] = useState("");

  const handleExport = () => {
    // Technical trigger for export process
    console.log(`Exporting ${activeTab} data to CSV/Excel...`);
  };

  return (
    <div className="h-full flex flex-col bg-[#07111F] text-[#EAF2FF] overflow-hidden font-sans">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20">
                 <Activity size={24} className="text-[#D4AF37]" />
              </div>
              <div>
                 <h1 className="text-xl font-black uppercase tracking-widest text-[#EAF2FF]">Core Data Engine</h1>
                 <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">Biro Operasi Polda Nusa Tenggara Timur</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C35D] text-[#07111F] font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#D4AF37]/10 transition-all scale-press cursor-pointer"
              >
                <Download size={14} /> Export {activeTab}
              </button>
           </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="flex items-center gap-4 bg-[#0B1B32]/100 border border-white/5 p-4 rounded-2xl shadow-xl">
           <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#D4AF37] transition-all" size={18} />
              <input 
                type="text"
                placeholder="Cari data taktis, NRP, Plat Nomor, atau ID Kejadian..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#07111F] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37]/50 transition-all font-medium placeholder:text-slate-600"
              />
           </div>
           
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-[#0B1B32] border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-white/20 cursor-pointer">
                 <Calendar size={14} /> Jan 01 - Apr 04, 2026
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-[#0B1B32] border border-white/10 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:border-white/20 cursor-pointer">
                 <Filter size={14} /> Filter Akurat
              </button>
           </div>
        </div>
      </div>

      {/* TABS & TABLES AREA */}
      <Tabs 
        defaultValue="kejadian" 
        className="flex-1 flex flex-col min-h-0"
        onValueChange={(val) => setActiveTab(val as "kejadian" | "personil" | "aset" | "riwayat")}
      >
        <div className="px-6 shrink-0">
          <TabsList className="bg-[#0B1B32] border border-white/5 w-full justify-start gap-1 p-1 h-14">
            <TabsTrigger value="kejadian" className="gap-2 shrink-0"><Shield size={14} /> Kejadian</TabsTrigger>
            <TabsTrigger value="personil" className="gap-2 shrink-0"><User size={14} /> Personil</TabsTrigger>
            <TabsTrigger value="aset" className="gap-2 shrink-0"><Car size={14} /> Aset / BBM</TabsTrigger>
            <TabsTrigger value="riwayat" className="gap-2 shrink-0"><Clock size={14} /> Riwayat Lokasi</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 p-6 pt-2 overflow-hidden flex flex-col h-full min-h-0">
          <div className="bg-[#0B1B32]/60 border border-white/5 rounded-3xl overflow-hidden flex-1 flex flex-col min-h-0 shadow-2xl relative">
            
            {/* TACTICAL BACKGROUND OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[120px]" />
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 blur-[120px]" />
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar h-full min-h-0">
              <TabsContent value="kejadian" className="m-0 h-full">
                <IncidentTable searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="personil" className="m-0 h-full">
                <PersonnelTable searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="aset" className="m-0 h-full">
                <AssetTable searchQuery={searchQuery} />
              </TabsContent>
              <TabsContent value="riwayat" className="m-0 h-full">
                <HistoryTable searchQuery={searchQuery} />
              </TabsContent>
            </div>

            {/* TABLE FOOTER / STATUS BAR */}
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
          </div>
        </div>
      </Tabs>

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

const AuditTrailSheet = ({ targetId, onClose, logs }: { targetId: string, onClose: () => void, logs: AuditLogEntry[] }) => {
  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-0 right-0 h-full w-[400px] bg-[#0B1B32] border-l border-white/10 z-[100] shadow-2xl p-8 flex flex-col"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Fingerprint className="text-[#D4AF37]" size={20} />
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Audit Trail System</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-1 mb-6">
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Target Entity</span>
        <span className="text-xs font-mono text-[#D4AF37] font-black">{targetId}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {logs.length > 0 ? logs.map((log, idx) => (
          <div key={idx} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37] opacity-20" />
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-black text-slate-200 uppercase tracking-tight">{log.action}</span>
              <span className="text-[9px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{log.details}</p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[7px] text-blue-400 font-bold border border-blue-500/20">JS</div>
              <span className="text-[9px] font-bold text-slate-300">{log.actor}</span>
            </div>
          </div>
        )) : (
          <div className="h-40 flex flex-col items-center justify-center text-slate-600 italic text-[10px]">
            No audit logs found for this entity.
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PersonnelDetailSheet = ({ person, onClose }: { person: any, onClose: () => void }) => {
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

      <div className="flex items-center gap-6 mb-10">
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
            <Badge variant="gold" className="text-[8px] px-2 py-0.5 font-bold">COMMANDER PREFERRED</Badge>
          </div>
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
