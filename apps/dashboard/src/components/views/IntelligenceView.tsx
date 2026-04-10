"use client";

import React, { useState } from "react";
import { Search, Bot, User, CheckCircle2, MessageSquare, TrendingUp, Hash } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const sentimentData = [
  { day: "Sen", score: 65 },
  { day: "Sel", score: 58 },
  { day: "Rab", score: 72 },
  { day: "Kam", score: 80 },
  { day: "Jum", score: 85 },
  { day: "Sab", score: 78 },
  { day: "Min", score: 82 },
];

export default function IntelligenceView() {
  const [activeTab, setActiveTab] = useState<"turangga" | "osint">("turangga");

  return (
    <div className="h-full flex flex-col relative w-full overflow-hidden">
      <div className="bg-[#0B1B32] border-b border-white/10 px-6 pt-4 flex gap-6 shrink-0 z-10 w-full overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab("turangga")}
          className={`pb-4 whitespace-nowrap px-2 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === "turangga" ? "text-white border-[#D4AF37]" : "text-slate-500 border-transparent hover:text-slate-300"
          }`}
        >
          Turangga-AI Intelligence
        </button>
        <button 
          onClick={() => setActiveTab("osint")}
          className={`pb-4 whitespace-nowrap px-2 font-semibold transition-colors border-b-2 cursor-pointer ${
            activeTab === "osint" ? "text-white border-[#D4AF37]" : "text-slate-500 border-transparent hover:text-slate-300"
          }`}
        >
          Pulse OSINT
        </button>
      </div>

      <div className="flex-1 overflow-hidden w-full relative">
        {activeTab === "turangga" ? <TuranggaAI /> : <PulseOSINT />}
      </div>
    </div>
  );
}

import { useAppStore } from "@/store";

function TuranggaAI() {
  const [inputVal, setInputVal] = useState("");
  const aiMessages = useAppStore(state => state.aiMessages);
  const addAIMessage = useAppStore(state => state.addAIMessage);

  const handleSend = () => {
    if (!inputVal.trim()) return;

    // Add User message
    addAIMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: inputVal,
      createdAt: new Date().toISOString()
    });

    const currentInput = inputVal.toLowerCase();
    setInputVal("");

    let reply = `Berdasarkan analisis Turangga-AI terkait "${inputVal}", tidak ditemukan anomali kritis. Parameter operasional berada pada ambang normal.`;
    let references = ["Core Data", "Anev Logs"];

    if (currentInput.includes("labuan bajo")) {
      reply = "Situasi di Labuan Bajo saat ini kondusif dengan penjagaan difokuskan pada event internasional. Terdapat 12 unit patroli aktif dan 1 posko utama. Tidak ada eskalasi SOS dalam 24 jam terakhir. Cuaca dilaporkan cerah, sehingga aktivitas maritim berjalan normal.";
      references = ["Polres Mabar Livestream", "BMKG Integrations", "Patroli R2/R4 Data"];
    } else if (currentInput.includes("ringkasan") || currentInput.includes("situasi")) {
      reply = "Ringkasan Situasi Nusa Tenggara Timur: Status Siaga 2. Terdeteksi peningkatan curah hujan di wilayah Sumba dan TTS. Terjadi 3 insiden Laka Lantas di area Kupang. Tingkat ketersediaan pasukan (Readiness) berada pada 92%. Rekomendasi: Tingkatkan patroli preventif pada jam rawan (22:00 - 04:00) di sektor timur.";
      references = ["Live Operations", "Statistics K2", "OSINT Pulse"];
    } else if (currentInput.includes("aset") || currentInput.includes("bahan bakar")) {
      reply = "Memindai data Core Data... Ditemukan 2 unit kendaraan (R4) yang menunjukkan anomali konsumsi bahan bakar lebih dari 20% dibandingkan jarak tempuh GPS. Odometer juga menunjukkan 4 unit memerlukan servis berkala. Silakan cek tab 'Core Data' untuk daftar terperinci.";
      references = ["GPS Odometer", "Fuel Logs"];
    }

    // Simulate AI response
    setTimeout(() => {
      addAIMessage({
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: reply,
        references,
        createdAt: new Date().toISOString(),
      });
    }, 1500);
  };

  return (
    <div className="flex h-full w-full wrapper overflow-hidden">
      <div className="flex-1 flex flex-col relative shrink-0 min-w-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {aiMessages.map((msg) => (
            <div key={msg.id} className="flex gap-4 max-w-3xl mx-auto w-full">
              {msg.role === "user" ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-900/50 flex flex-shrink-0 items-center justify-center">
                    <User size={20} className="text-blue-400" />
                  </div>
                  <div className="pt-2 flex-1 min-w-0">
                    <p className="text-slate-200">{msg.content}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex flex-shrink-0 items-center justify-center">
                    <Bot size={20} className="text-[#D4AF37]" />
                  </div>
                  <div className="bg-[#0B1B32] border border-white/10 p-5 rounded-2xl rounded-tl-none w-full shadow-lg flex-1 min-w-0">
                    <p className="text-slate-300 leading-relaxed mb-4">
                      {msg.content}
                    </p>
                    {msg.references && msg.references.length > 0 && (
                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span className="break-all">Verified Source: <strong>{msg.references.join(", ")}</strong></span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#0B1B32] border-t border-white/10 shrink-0 w-full">
          <div className="max-w-3xl mx-auto relative flex overflow-hidden">
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white focus:outline-none focus:border-[#D4AF37] focus:bg-white/10 transition-colors"
              placeholder="Tanyakan analisis strategis kepada Turangga-AI..."
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#D4AF37] rounded-lg text-slate-900 hover:bg-[#b8952b] cursor-pointer"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden xl:flex w-72 bg-[#0B1B32] border-l border-white/10 flex-col shrink-0">
        <div className="p-4 border-b border-white/10 shrink-0">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-[#D4AF37]"/>
            Recent Analysis
          </h3>
        </div>
        <div className="p-3 space-y-2 overflow-y-auto flex-1">
          {["Analisa Banjir Kupang", "Plotting Pasukan Pemilu", "Evaluasi Respon Dalmas", "Pola Kerawanan Malam"].map((item, i) => (
            <div key={i} className="p-3 rounded-lg hover:bg-white/5 cursor-pointer border border-transparent hover:border-white/10 transition-colors">
              <p className="text-sm font-medium text-slate-300 truncate">{item}</p>
              <p className="text-xs text-slate-500 mt-1">2 jam yang lalu</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PulseOSINT() {
  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto w-full">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
        <div className="xl:col-span-2 flex flex-col gap-6 min-w-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-[#D4AF37]" />
            Live Feed Media Sosial
          </h2>
          <div className="space-y-4">
            {[
              { author: "@rakyat_ntt", text: "Terima kasih respon cepat tim patroli di jalan El Tari. Kondisi sudah aman. 🙏", sentiment: "Positif", source: "Twitter" },
              { author: "Warga Info", text: "Macet parah di area Oesapa, tidak ada petugas yang mengatur.", sentiment: "Negatif", source: "Facebook" },
              { author: "@kabar_timor", text: "Info cuaca: Hujan deras diprediksi mengguyur wilayah TTS malam ini.", sentiment: "Netral", source: "Twitter" }
            ].map((feed, i) => (
              <div key={i} className="bg-[#0B1B32] p-4 rounded-xl border border-white/10 flex flex-col break-words shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="font-medium text-blue-400 break-all">{feed.author} <span className="text-slate-500 text-xs ml-2">via {feed.source}</span></span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${
                    feed.sentiment === "Positif" ? "bg-emerald-500/20 text-emerald-400" :
                    feed.sentiment === "Negatif" ? "bg-red-500/20 text-red-400" :
                    "bg-slate-500/20 text-slate-300"
                  }`}>{feed.sentiment}</span>
                </div>
                <p className="text-slate-300 text-sm">{feed.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <div className="bg-[#0B1B32] p-5 rounded-xl border border-white/10 shadow-md">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Hash className="text-[#D4AF37]" />
              Trending Topics NTT
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-[#D4AF37]">#BanjirKupang</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300">#LakaLantasOesapa</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300">#PatroliMalam</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300">#CuacaEkstrem</span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-emerald-400">#PolisiMantap</span>
            </div>
          </div>

          <div className="bg-[#0B1B32] p-5 rounded-xl border border-white/10 shadow-md flex-1 min-h-[300px] flex flex-col">
             <h3 className="font-semibold text-white mb-4">Sentiment Tracker Mingguan</h3>
             <div className="flex-1 w-full relative min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentimentData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0B1B32', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
