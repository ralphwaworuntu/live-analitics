// @ts-ignore
import * as TaskManager from 'expo-task-manager';
// @ts-ignore
import * as Location from 'expo-location';
// @ts-ignore
import * as Battery from 'expo-battery';
import { socketService } from './socketService';

export const BACKGROUND_TRACKING_TASK = 'SENTINEL_BACKGROUND_TRACKING';

let currentBatteryLevel = 1.0;
let currentIsCharging = false;
let batterySubscription: { remove: () => void } | null = null;

/**
 * Initialize battery monitoring with expo-battery
 */
export const initBatteryMonitoring = async () => {
  try {
    currentBatteryLevel = await Battery.getBatteryLevelAsync();
    const batteryState = await Battery.getBatteryStateAsync();
    currentIsCharging = batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL;
    
    batterySubscription = Battery.addBatteryStateListener(({ state }) => {
      currentIsCharging = state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
    });
    
    console.log('[BATTERY] Initialized:', { level: Math.round(currentBatteryLevel * 100) + '%', charging: currentIsCharging });
  } catch (error) {
    console.warn('[BATTERY] Not available:', error);
  }
};

/**
 * Cleanup battery monitoring
 */
export const cleanupBatteryMonitoring = () => {
  if (batterySubscription) {
    batterySubscription.remove();
    batterySubscription = null;
  }
};

/**
 * Task Definition for Expo Task Manager
 * Handles persistent tracking even when app is backgrounded or killed.
 * Minimum distance: 10 meters between updates.
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

    // Convert speed from m/s to km/h
    const speedMs = location.coords.speed ?? 0;
    const speedKmh = speedMs * 3.6;
    
    // Convert battery level (0-1) to percentage (0-100)
    const batteryPct = currentBatteryLevel * 100;

    // Emit position update with battery and charging state
    // Matches PersonnelTelemetry interface from types/telemetry.ts
    await socketService.emitPosition({
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      speed: speedKmh,
      batteryLevel: batteryPct,
      isCharging: currentIsCharging,
      timestamp: new Date().toISOString(),
      source: 'background-engine'
    });
  }
});

/**
 * Request location permissions
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status: foreground } = await Location.requestForegroundPermissionsAsync();
    if (foreground !== 'granted') return false;
    
    const { status: background } = await Location.requestBackgroundPermissionsAsync();
    return background === 'granted';
  } catch (error) {
    console.error('[LOCATION] Permission error:', error);
    return false;
  }
};

/**
 * Configures the background tracking with adaptive intervals based on battery
 * Minimum distance filter: 10 meters
 */
export const startBackgroundTracking = async (isStandby: boolean = false) => {
  await initBatteryMonitoring();
  
  let interval = 5000; // 5 seconds default
  let distanceFilter = 10; // 10 meters minimum movement
  
  if (currentBatteryLevel < 0.15) {
    interval = 120000; // Power Save - 2 minutes
    distanceFilter = 50;
  } else if (isStandby) {
    interval = 60000; // Standby - 1 minute
    distanceFilter = 20;
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_TRACKING_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: interval,
    distanceInterval: distanceFilter,
    deferredUpdatesInterval: interval,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "SENTINEL-AI ACTIVE",
      notificationBody: "Monitoring position for Biro Ops Pvt Ltd NTT.",
      notificationColor: "#0B4AA2"
    },
    pausesLocationUpdatesAutomatically: false,
  });
  
  console.log('[TRACKING] Started - interval:', interval + 'ms, distance:', distanceFilter + 'm');
};

/**
 * Stop background tracking
 */
export const stopBackgroundTracking = async () => {
  cleanupBatteryMonitoring();
  await Location.stopLocationUpdatesAsync(BACKGROUND_TRACKING_TASK);
};

/**
 * Get current battery state
 */
export const getBatteryState = () => ({
  level: Math.round(currentBatteryLevel * 100),
  isCharging: currentIsCharging
});
