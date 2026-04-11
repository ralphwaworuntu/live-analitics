// @ts-ignore
import { useState, useEffect, useRef } from 'react';
// @ts-ignore
import * as Location from 'expo-location';
// @ts-ignore
import * as Battery from 'expo-battery';
import { useAppStore } from '../store';
import { socketService } from '../services/socketService';
import { generateIntegrityHash } from '../utils/crypto';

const ACTIVE_INTERVAL = 5000;      // 5s
const STANDBY_INTERVAL = 60000;   // 1m
const POWER_SAVE_INTERVAL = 120000; // 2m
const STANDBY_THRESHOLD_MS = 120000; // 2 minutes immobile
const MOVEMENT_THRESHOLD_METERS = 10;

export const useTracking = () => {
  const [speed, setSpeed] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(1);
  const [isStandby, setIsStandby] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  const lastActiveTimeRef = useRef(Date.now());
  const lastLocationRef = useRef<Location.LocationObject | null>(null);
  const watchIdRef = useRef<Location.LocationSubscription | null>(null);

  const { isSOSActive, me } = useAppStore();

  useEffect(() => {
    let batterySubscription: Battery.Subscription;

    const setupTelemetry = async () => {
      // 1. Initial Battery Check
      const battery = await Battery.getBatteryLevelAsync();
      setBatteryLevel(battery);
      
      batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }: Battery.BatteryLevelEvent) => {
        setBatteryLevel(batteryLevel);
        if (batteryLevel < 0.15) {
          socketService.emit('LOW_BATTERY_ALERT', { unitId: me?.id, level: batteryLevel });
        }
      });

      // 2. Start Geolocation Watch
      watchIdRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1, // Track every meter for movement detection
        },
        async (loc: Location.LocationObject) => {
          setLocation(loc);
          const currentSpeed = (loc.coords.speed ?? 0) * 3.6; // m/s to km/h
          setSpeed(currentSpeed);

          // Task 3: Wake-on-Motion (> 10m detection)
          if (lastLocationRef.current) {
            const distance = getDistance(
              lastLocationRef.current.coords.latitude,
              lastLocationRef.current.coords.longitude,
              loc.coords.latitude,
              loc.coords.longitude
            );

            if (distance > MOVEMENT_THRESHOLD_METERS) {
              lastActiveTimeRef.current = Date.now();
              setIsStandby(false);
            }
          }

          // Task 1: Standby Logic (Speed <= 5 km/h for > 2 mins)
          if (currentSpeed > 5) {
            lastActiveTimeRef.current = Date.now();
            setIsStandby(false);
          } else {
            if (Date.now() - lastActiveTimeRef.current > STANDBY_THRESHOLD_MS) {
              setIsStandby(true);
            }
          }

          lastLocationRef.current = loc;

          // Determine current polling necessity (This hook runs on every bridge event, 
          // but we only emit based on the calculated dynamic interval elsewhere or throttle here)
          handleConditionalEmit(loc, currentSpeed, batteryLevel, isStandby);
        }
      );
    };

    setupTelemetry();

    return () => {
      batterySubscription?.remove();
      watchIdRef.current?.remove();
    };
  }, [me?.id, batteryLevel, isStandby]);

  const handleConditionalEmit = async (loc: Location.LocationObject, speed: number, battery: number, standby: boolean) => {
    // Determine interval
    let interval = ACTIVE_INTERVAL;
    if (battery < 0.15) interval = POWER_SAVE_INTERVAL;
    else if (standby) interval = STANDBY_INTERVAL;
    else if (speed > 5) interval = ACTIVE_INTERVAL;

    // We use a throttling mechanism here for the socket emission
    // (Actual background logic is governed by backgroundTrackingService)
    socketService.emitPositionWithThrottling(loc, interval);
  };

  const finishMission = async () => {
    // Task 1: Mission Finalization Logic
    const startTime = lastLocationRef.current ? lastActiveTimeRef.current : Date.now();
    const summary = {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      assetId: useAppStore.getState().assetId,
      finalHash: useAppStore.getState().currentHash,
      nrp: useAppStore.getState().me?.nrp,
    };

    console.log("[MISSION] Finalizing SEC-HASH sync...");
    // Trigger a final sync
    if (lastLocationRef.current) {
      await socketService.emitPosition(lastLocationRef.current);
    }

    // Stop location watch
    watchIdRef.current?.remove();
    useAppStore.getState().setMissionStatus('FINISHED');
    
    return summary;
  };

  return { location, speed, batteryLevel, isStandby, finishMission };
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
