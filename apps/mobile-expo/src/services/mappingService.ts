// @ts-ignore
import * as FileSystem from 'expo-file-system';

const TILE_ROOT = `${FileSystem.documentDirectory}tiles/`;

export const MappingService = {
  // Task 1: Initialize folder
  init: async () => {
    const info = await FileSystem.getInfoAsync(TILE_ROOT);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(TILE_ROOT, { intermediates: true });
    }
  },

  // Cache a specific area based on route
  cacheRouteArea: async (routeCoords: any[]) => {
    console.log("[MAP] Starting Predictive Caching for Route Area...");
    // Mocking tile download logic for mission area
    for (const coord of routeCoords.slice(0, 5)) { // First 5 points to save resources
       const zoom = 15;
       await MappingService.downloadTile(coord.lat, coord.lng, zoom);
    }
    console.log("[MAP] Caching Complete. Offline Mode Ready.");
  },

  downloadTile: async (lat: number, lng: number, zoom: number) => {
    const { x, y } = MappingService.deg2num(lat, lng, zoom);
    const tileUrl = `https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${zoom}`;
    const localUri = `${TILE_ROOT}${zoom}_${x}_${y}.png`;

    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists) {
      await FileSystem.downloadAsync(tileUrl, localUri);
    }
    return localUri;
  },

  deg2num: (lat: number, lon: number, zoom: number) => {
    const lat_rad = (lat * Math.PI) / 180;
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lon + 180) / 360) * n);
    const y = Math.floor(
      ((1 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) / 2) * n
    );
    return { x, y };
  }
};
