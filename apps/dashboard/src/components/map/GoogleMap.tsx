"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, AdvancedMarker, Map, Pin, useMap } from "@vis.gl/react-google-maps";

import TimeSlider from "@/components/map/TimeSlider";
import PatrolBreadcrumbs from "@/components/map/PatrolBreadcrumbs";
import { getSelectedPolres, useAppStore } from "@/store";
import type { PolresItem } from "@/lib/types";

function MapController({ selectedPolres }: { selectedPolres: PolresItem | null }) {
  const map = useMap();
  const emergency = useAppStore((state) => state.emergency);
  
  useEffect(() => {
    if (!map) return;
    if (selectedPolres) {
      map.panTo({ lat: selectedPolres.lat, lng: selectedPolres.lng });
      map.setZoom(12);
    } else {
      map.panTo({ lat: -9.0, lng: 121.5 });
      map.setZoom(7);
    }
  }, [map, selectedPolres]);

  useEffect(() => {
    if (!map) return;

    const flyToEmergency = () => {
      if (emergency.lat && emergency.lng) {
        map.panTo({ lat: emergency.lat, lng: emergency.lng });
        map.setZoom(16);
      }
    };

    window.addEventListener('map:fly-to-emergency', flyToEmergency);
    return () => window.removeEventListener('map:fly-to-emergency', flyToEmergency);
  }, [map, emergency]);

  return null;
}

export default function GoogleMap() {
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
  const polres = useAppStore((state) => state.polres);
  const heatPoints = useAppStore((state) => state.heatPoints);
  const heatmapEnabled = useAppStore((state) => state.heatmapEnabled);
  const emergency = useAppStore((state) => state.emergency);
  const selectedPolres = useAppStore(getSelectedPolres);
  const setSelectedPolres = useAppStore((state) => state.setSelectedPolres);

  const visiblePolres = useMemo(() => {
    if (!selectedPolres) {
      return polres;
    }
    return polres.filter((item) => item.id === selectedPolres.id);
  }, [polres, selectedPolres]);

  const highlightedHeatPoints = useMemo(() => {
    if (!selectedPolres) {
      return heatPoints;
    }
    return heatPoints.filter((item) => item.polresId === selectedPolres.id);
  }, [heatPoints, selectedPolres]);

  if (!apiKey) {
    return (
      <div className="relative flex h-full min-h-[480px] items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#fdfefe,#f1f6fc)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,103,204,0.03)_1px,transparent_1px),linear-gradient(rgba(31,103,204,0.03)_1px,transparent_1px)] bg-[size:34px_34px]" />
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6">
          <div className="rounded-[30px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-float)] sm:p-8">
            <div className="eyebrow">Fallback Tactical View</div>
            <h3 className="mt-4 text-2xl font-semibold text-[var(--color-text)]">Map engine belum diaktifkan</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-[15px]">
              Tambahkan `NEXT_PUBLIC_GOOGLE_MAPS_KEY` untuk memunculkan peta live. Sementara itu, navigasi wilayah tetap aktif dan sinkron ke seluruh workspace.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {visiblePolres.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedPolres(item.id);
                    router.push(`/polres/${item.id}`);
                  }}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-4 text-left transition-colors hover:border-[var(--color-brand-primary)]/40 hover:bg-[var(--color-surface-2)]"
                >
                  <div className="text-sm font-medium text-[var(--color-text)]">{item.name}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                    {item.status} | {item.island}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <TimeSlider />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[480px] w-full overflow-hidden">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: -9.0, lng: 121.5 }}
          defaultZoom={7}
          mapId="SENTINEL_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI
          style={{ width: "100%", height: "100%" }}
        >
          {polres.map((item) => (
            <AdvancedMarker
              key={item.id}
              position={{ lat: item.lat, lng: item.lng }}
              onClick={() => {
                setSelectedPolres(item.id);
                router.push(`/polres/${item.id}`);
              }}
              className="group cursor-pointer"
            >
              <div className="relative">
                <Pin
                  background={
                    item.status === "kondusif"
                      ? "var(--color-success)"
                      : item.status === "waspada"
                        ? "var(--color-brand-gold)"
                        : "var(--color-danger)"
                  }
                  borderColor={selectedPolres?.id === item.id ? "#18324d" : "rgba(24,50,77,0.28)"}
                  glyphColor="white"
                />
                
                {/* TACTICAL HOVERCARD */}
                <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 flex-col items-center group-hover:flex">
                  <div className="glass-card flex min-w-[200px] flex-col overflow-hidden rounded-xl border border-[var(--color-border)] p-3 shadow-lg">
                    <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-brand-gold)]">
                      {item.name}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-[var(--color-text)]">
                      <span>Status:</span>
                      <span className="font-semibold uppercase text-white">{item.status}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-[var(--color-text)]">
                      <span>Personil:</span>
                      <span className="font-mono text-white">{item.online}/{item.personnel} Aktif</span>
                    </div>
                  </div>
                  <div className="h-2 w-2 origin-top-left -translate-x-1/2 rotate-45 border-b border-r border-[var(--color-border)] bg-[rgba(11,27,50,0.8)]" />
                </div>

              </div>
            </AdvancedMarker>
          ))}

          <MapController selectedPolres={selectedPolres} />
          
          <PatrolBreadcrumbs />

          {heatmapEnabled
            ? highlightedHeatPoints.map((point) => (
                <AdvancedMarker key={point.id} position={{ lat: point.lat, lng: point.lng }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-[rgba(216,79,95,0.82)] text-[11px] font-semibold text-white shadow-[0_0_16px_rgba(216,79,95,0.22)]">
                    {point.weight}
                  </div>
                </AdvancedMarker>
              ))
            : null}
        </Map>
        <div className="pointer-events-none absolute inset-0 bg-transparent" />
        <TimeSlider />
        <div className="pointer-events-none absolute left-5 top-5 z-10 max-w-sm rounded-[24px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.92)] px-4 py-4 backdrop-blur-xl">
          <div className="eyebrow">Map Overlay</div>
          <div className="mt-3 text-sm text-[var(--color-text)]">
            {selectedPolres ? selectedPolres.name : "Regional Situation Board"}
          </div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">
            {heatmapEnabled ? "Heat layer active. " : "Marker focus active. "}
            Klik wilayah untuk mengunci context drawer, AI brief, dan dashboard state.
          </div>
        </div>
        {emergency.active ? (
          <div className="pointer-events-none absolute right-5 top-5 z-10 rounded-[24px] border border-[var(--color-danger)] bg-[rgba(255,255,255,0.95)] px-4 py-4 text-xs shadow-[var(--shadow-glow-danger)] backdrop-blur-xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-danger)]">Emergency Focus</div>
            <div className="mt-2 text-sm text-[var(--color-text)]">{emergency.message}</div>
            <div className="mt-1 text-[var(--color-muted)]">{emergency.location}</div>
          </div>
        ) : null}
      </APIProvider>
    </div>
  );
}
