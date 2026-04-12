"use client";

import { useEffect, useState } from "react";

interface HeatmapLayerProps {
  map: google.maps.Map | null;
}

export function HeatmapLayer({ map }: HeatmapLayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!map) return;
    setIsLoaded(true);
  }, [map]);

  return null;
}

export default HeatmapLayer;