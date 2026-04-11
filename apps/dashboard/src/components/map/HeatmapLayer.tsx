import React, { useEffect, useState } from 'react';
// @ts-ignore
import { HeatmapLayer as DeckHeatmapLayer } from '@deck.gl/aggregation-layers';
// @ts-ignore
import { GoogleMapsOverlay } from '@deck.gl/google-maps';

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}

export const HeatmapLayer = ({ map }: { map: google.maps.Map | null }) => {
  const [data, setData] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const resp = await fetch('/api/intel/heatmap');
        const json = await resp.json();
        if (json.status === 'success') {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load heatmap", err);
      }
    };

    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 60000); // 1 minute sync
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!map || data.length === 0) return;

    // Task 4: Frontend Map Integration (Deck.gl)
    const overlay = new GoogleMapsOverlay({
      layers: [
        new DeckHeatmapLayer({
          id: 'heatmap-risk-layer',
          data,
          getPosition: (d: HeatmapPoint) => [d.lng, d.lat],
          getWeight: (d: HeatmapPoint) => d.weight,
          radiusPixels: 60,
          intensity: 1,
          threshold: 0.05,
          // Task 4 Aesthetics: Transparent -> Blue -> Cyan -> Orange -> Neon Red
          colorRange: [
            [0, 240, 255, 0],     // Transparent
            [7, 17, 31, 150],     // Dark Blue
            [0, 240, 255, 200],   // Cyan
            [255, 171, 0, 220],   // Orange
            [255, 77, 109, 255]   // Neon Red
          ]
        })
      ]
    });

    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, data]);

  return null;
};
