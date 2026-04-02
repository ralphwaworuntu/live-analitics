"use client";

import { useEffect } from "react";

import { fetchHeatmap, fetchPolresList } from "@/lib/api";
import { extractPolresIdFromPath } from "@/lib/nav";
import { useAppStore } from "@/store";

export default function AppBootstrap({ pathname }: { pathname: string }) {
  const setPolresData = useAppStore((state) => state.setPolresData);
  const setHeatPoints = useAppStore((state) => state.setHeatPoints);
  const setSelectedPolres = useAppStore((state) => state.setSelectedPolres);
  const timeRangeHours = useAppStore((state) => state.timeRangeHours);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      const [polres, heatPoints] = await Promise.all([
        fetchPolresList(),
        fetchHeatmap(timeRangeHours),
      ]);

      if (!active) {
        return;
      }

      setPolresData(polres);
      setHeatPoints(heatPoints);
      setSelectedPolres(extractPolresIdFromPath(pathname));
    }

    void loadInitialData();

    return () => {
      active = false;
    };
  }, [pathname, setHeatPoints, setPolresData, setSelectedPolres, timeRangeHours]);

  useEffect(() => {
    const routePolresId = extractPolresIdFromPath(pathname);
    setSelectedPolres(routePolresId);
  }, [pathname, setSelectedPolres]);

  return null;
}
