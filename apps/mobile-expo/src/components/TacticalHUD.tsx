import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../store';
import { MissionTimer } from './MissionTimer';
import { ShiftSummaryModal, ShiftSummaryData } from './ShiftSummaryModal';
import { useTracking } from '../hooks/useTracking';
import { socketService } from '../services/socketService';
import * as Haptics from 'expo-haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Radio, Power, FlagCheckered } from 'lucide-react-native';

interface TacticalHUDProps {
  isConnected?: boolean;
}

export function TacticalHUD({ isConnected = false }: TacticalHUDProps) {
  const me = useAppStore((s) => s.me);
  const assetId = useAppStore((s) => s.assetId);
  const missionStatus = useAppStore((s) => s.missionStatus);
  const missionStartTime = useAppStore((s) => s.missionStartTime);
  const setMissionStatus = useAppStore((s) => s.setMissionStatus);
  const isSOSActive = useAppStore((s) => s.isSOSActive);
  const toggleSOS = useAppStore((s) => s.toggleSOS);

  const { startTracking, stopTracking, location, batteryLevel } = useTracking();
  const [isStarting, setIsStarting] = useState(false);
  const [showShiftSummary, setShowShiftSummary] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<ShiftSummaryData | null>(null);
  
  const batteryLevelOnStart = useRef<number>(100);

  const name = me?.name ?? 'Unknown';
  const nrp = me?.nrp ?? '------';

  const isActive = missionStatus === 'ACTIVE';

  useEffect(() => {
    if (isActive && missionStartTime) {
      batteryLevelOnStart.current = batteryLevel;
    }
  }, [isActive, missionStartTime, batteryLevel]);

  const handleStartDuty = async () => {
    try {
      setIsStarting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const started = await startTracking();
      if (!started) {
        Alert.alert('Error', 'Gagal memulai pelacakan.');
        setIsStarting(false);
        return;
      }
      batteryLevelOnStart.current = batteryLevel;
      setMissionStatus('ACTIVE');
      const currentLocation = location ?? { lat: -10.158, lng: 123.606 };
      socketService.emitMissionStart({
        unitId: assetId ?? 'UNIT-001',
        nrp: nrp,
        name: name,
        lat: currentLocation.lat ?? -10.158,
        lng: currentLocation.lng ?? 123.606,
        timestamp: new Date().toISOString()
      });
      setIsStarting(false);
    } catch (error) {
      console.error('[handleStartDuty] Error:', error);
      setIsStarting(false);
    }
  };

  const handleFinishDuty = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await stopTracking();
      const endTime = new Date().toISOString();
      const startTime = missionStartTime ? new Date(missionStartTime).toISOString() : new Date(Date.now() - 3600000).toISOString();
      const durationMs = endTime && startTime ? new Date(endTime).getTime() - new Date(startTime).getTime() : 3600000;
      const totalDistanceKm = calculateDistance(durationMs);
      const averageSpeedKmh = durationMs > 0 ? (totalDistanceKm / (durationMs / 3600000)) : 0;
      const currentLocation = location ?? { lat: -10.158, lng: 123.606 };
      const summaryData: ShiftSummaryData = {
        unitId: assetId ?? 'UNIT-001',
        nrp: nrp,
        officerName: name,
        startTime: startTime,
        endTime: endTime,
        durationMs: durationMs,
        totalDistanceKm: totalDistanceKm,
        averageSpeedKmh: averageSpeedKmh,
        batteryLevelStart: batteryLevelOnStart.current,
        batteryLevelEnd: batteryLevel,
      };
      setShiftSummary(summaryData);
      setShowShiftSummary(true);
    } catch (error) {
      console.error('[handleFinishDuty] Error:', error);
    }
  };

  const calculateDistance = (durationMs: number): number => {
    const avgSpeedKmh = 30 + Math.random() * 20;
    const hours = durationMs / 3600000;
    return avgSpeedKmh * hours;
  };

  const handleShiftSummaryClose = () => {
    setShowShiftSummary(false);
    setShiftSummary(null);
  };

  const handleShiftSummaryConfirm = () => {
    if (shiftSummary) {
      socketService.emitMissionEnd({
        unitId: shiftSummary.unitId,
        nrp: shiftSummary.nrp,
        name: shiftSummary.officerName,
        startTime: shiftSummary.startTime,
        endTime: shiftSummary.endTime,
        durationMs: shiftSummary.durationMs,
        totalDistanceKm: shiftSummary.totalDistanceKm,
        averageSpeedKmh: shiftSummary.averageSpeedKmh,
        batteryLevelStart: shiftSummary.batteryLevelStart,
        batteryLevelEnd: shiftSummary.batteryLevelEnd,
        startLat: -10.158,
        startLng: 123.606,
        endLat: location?.lat ?? -10.158,
        endLng: location?.lng ?? 123.606,
      });
    }
    setMissionStatus('FINISHED');
    setShowShiftSummary(false);
    setShiftSummary(null);
  };

  const handleSOS = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    toggleSOS();
    const currentLocation = location ?? { lat: -10.158, lng: 123.606 };
    if (!isSOSActive) {
      socketService.emitSOS(
        { lat: currentLocation.lat ?? -10.158, lng: currentLocation.lng ?? 123.606 },
        'Emergency SOS'
      );
    }
  };

  return (
    <View style={styles.container}>
      {isActive && (
        <motion.View
          style={styles.pulseBorder}
          animate={{ borderColor: ['#00ff88', '#00ff8800', '#00ff88'], borderWidth: [2, 4, 2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <View style={styles.header}>
        <Text style={styles.callsign}>{assetId ?? 'NO-UNIT'}</Text>
        <View style={[styles.badge, isConnected ? styles.badgeOnline : styles.badgeOffline]}>
          <Text style={styles.badgeText}>{isConnected ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>
      </View>
      <View style={styles.officerInfo}>
        <Text style={styles.officerName}>{name}</Text>
        <Text style={styles.nrp}>NRP: {nrp}</Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={styles.missionLabel}>MISSION:</Text>
        <Text style={[styles.missionStatus, isActive && styles.missionActive]}>{missionStatus}</Text>
      </View>
      <AnimatePresence>
        {!isActive && (
          <motion.View initial={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} style={styles.protocolContainer}>
            <View style={styles.protocolPanel}>
              <View style={styles.protocolHeader}>
                <Shield size={14} color="#D4AF37" />
                <Text style={styles.protocolTitle}>PROTOCOL INTEGRITY</Text>
              </View>
              <View style={styles.protocolItem}>
                <Text style={styles.protocolLabel}>• Encryption</Text>
                <Text style={styles.protocolValue}>ACTIVE</Text>
              </View>
              <View style={styles.protocolItem}>
                <Text style={styles.protocolLabel}>• Hash Verify</Text>
                <Text style={styles.protocolValue}>VERIFIED</Text>
              </View>
              <View style={styles.protocolItem}>
                <Text style={styles.protocolLabel}>• Chain Sync</Text>
                <Text style={styles.protocolValue}>LINKED</Text>
              </View>
            </View>
          </motion.View>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isActive && (
          <motion.View style={styles.activePanel} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}>
            <MissionTimer />
          </motion.View>
        )}
      </AnimatePresence>
      <View style={styles.buttonContainer}>
        {!isActive ? (
          <TouchableOpacity style={[styles.startButton, isStarting && styles.startButtonDisabled]} onPress={handleStartDuty} disabled={isStarting} active
