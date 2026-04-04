"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Download, 
  MapPin, 
  Eye, 
  MoreVertical,
  Activity,
  Shield,
  User,
  Car,
  Clock,
  Navigation,
  Fuel,
  Info,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Play
} from "lucide-react";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Badge } from "@/components/ui/badge";
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
import { motion } from "framer-motion";

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
  );
};

const PersonnelTable = ({ searchQuery }: { searchQuery: string }) => {
  const setMapCenter = useAppStore(state => state.setMapCenter);

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
                    <img src={info.row.original.photo} alt="" className="w-full h-full object-cover" />
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
  );
};

const AssetTable = ({ searchQuery }: { searchQuery: string }) => {
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
      cell: () => (
        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg text-[10px] font-black text-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-950 transition-all cursor-pointer">
          <Play size={10} fill="currentColor" /> PLAYBACK ROUTE
        </button>
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
        onValueChange={(val) => setActiveTab(val as any)}
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
