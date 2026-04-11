// @ts-ignore
import * as TaskManager from 'expo-task-manager';
// @ts-ignore
import * as Location from 'expo-location';
// @ts-ignore
import * as Battery from 'expo-battery';
import { socketService } from './socketService';

export const BACKGROUND_TRACKING_TASK = 'SENTINEL_BACKGROUND_TRACKING';

/**
 * Task Definition for Expo Task Manager
 * Handles persistent tracking even when app is backgrounded or killed.
 */
TaskManager.defineTask(BACKGROUND_TRACKING_TASK, async ({ data, error }: { data: any, error: any }) => {
  if (error) {
    console.error(`[BACKGROUND-TASK] Error: ${error.message}`);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (!location) return;

    const batteryLevel = await Battery.getBatteryLevelAsync();
    const speed = (location.coords.speed ?? 0) * 3.6;

    // SEC-HASH and Queuing are handled inside socketService.emitPosition
    await socketService.emitPosition({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      speed: speed,
      battery: batteryLevel,
      source: 'background-engine'
    });
  }
});

/**
 * Configures the background tracking with adaptive intervals
 */
export const startBackgroundTracking = async (batteryLevel: number, isStandby: boolean) => {
  let interval = 5000;
  let fastInterval = 5000;
  
  if (batteryLevel < 0.15) {
    interval = 120000; // Power Save
    fastInterval = 60000;
  } else if (isStandby) {
    interval = 60000; // Standby
    fastInterval = 30000;
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_TRACKING_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: interval,
    deferredUpdatesInterval: interval,
    foregroundService: {
      notificationTitle: "SENTINEL-AI ACTIVE",
      notificationBody: "Monitoring position for Biro Ops Polda NTT.",
      notificationColor: "#0B4AA2"
    },
    pausesLocationUpdatesAutomatically: false, // We control pausing manually via Standby Mode
  });
};
