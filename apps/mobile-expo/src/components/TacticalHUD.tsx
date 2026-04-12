// @ts-ignore
import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { View, Text, StyleSheet } from 'react-native';
// @ts-ignore
import { MotiView } from 'moti';
// @ts-ignore
import * as Haptics from 'expo-haptics';
// @ts-ignore
import { Shield, Battery, Radio, Wifi, WifiOff, Zap } from 'lucide-react-native';
import { useAppStore } from '../store';
import { useTracking } from '../hooks/useTracking';

const COLORS = {
  ACTIVE: '#00F0FF',    // Neon Cyan
  STANDBY: '#D4AF37',   // Gold
  POWER_SAVE: '#FF4D6D', // Red
  ONLINE: '#18C29C',     // Emerald Green
  OFFLINE: '#64748B',    // Slate Gray
};

export const TacticalHUD = () => {
  const me = useAppStore((s) => s.me);
  const assetId = useAppStore((s) => s.assetId);
  const riskScore = useAppStore((s) => s.riskScore);
  
  const { 
    isTracking, 
    isStandby, 
    batteryLevel, 
    speed, 
    isOnline 
  } = useTracking();

  // Determine status based on tracking state
  const getStatus = (): 'ACTIVE' | 'STANDBY' | 'POWER_SAVE' => {
    if (batteryLevel < 15) return 'POWER_SAVE';
    if (isStandby) return 'STANDBY';
    if (isTracking) return 'ACTIVE';
    return 'STANDBY';
  };

  const status = getStatus();

  // Haptic feedback when transitioning from Standby to Active
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current === 'STANDBY' && status === 'ACTIVE') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    prevStatusRef.current = status;
  }, [status]);

  // Dynamic color based on status and risk
  let color = COLORS[status] || COLORS.ACTIVE;
  if (riskScore > 75) color = COLORS.POWER_SAVE;
  else if (riskScore > 40) color = COLORS.STANDBY;

  // Connection status color
  const connectionColor = isOnline ? COLORS.ONLINE : COLORS.OFFLINE;

  return (
    <View style={styles.container}>
      <MotiView
        from={{ shadowOpacity: 0.2, scale: 1 }}
        animate={{ shadowOpacity: 0.8, scale: 1.02 }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
        }}
        style={[styles.glowBox, { shadowColor: color, borderColor: color }]}
      >
        {/* Asset ID & Connection Status Row */}
        <View style={styles.topBar}>
          <View style={styles.assetIdContainer}>
            <Zap size={12} color={color} />
            <Text style={[styles.assetId, { color }]}>{assetId || 'NO-UNIT'}</Text>
          </View>
          <View style={[styles.connectionBadge, { borderColor: connectionColor }]}>
            {isOnline ? (
              <Wifi size={12} color={connectionColor} />
            ) : (
              <WifiOff size={12} color={connectionColor} />
            )}
            <Text style={[styles.connectionText, { color: connectionColor }]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* Header with Status & Metrics */}
        <View style={styles.header}>
          <Text style={[styles.statusLabel, { color }]}>{status} MODE</Text>
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Battery size={16} color={batteryLevel < 20 ? '#FF4D6D' : '#A9B9D6'} />
              <Text style={[styles.metricText, batteryLevel < 20 && styles.warningText]}>
                {Math.round(batteryLevel)}%
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Radio size={16} color="#A9B9D6" />
              <Text style={styles.metricText}>{Math.round(speed)}km/h</Text>
            </View>
          </View>
        </View>
        
        {/* Identity Row - Real Name & NRP */}
        <View style={styles.identity}>
          <Shield size={20} color={color} />
          <Text style={styles.unitName}>
            {me?.name || 'Unknown'} | {me?.nrp || 'N/A'}
          </Text>
        </View>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 60,
    width: '100%',
  },
  glowBox: {
    backgroundColor: '#0B1B32',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  assetIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assetId: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  connectionText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  metrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: '#EAF2FF',
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    color: '#FF4D6D',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  unitName: {
    color: '#EAF2FF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
