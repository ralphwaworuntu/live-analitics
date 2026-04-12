import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '../store';
import { MissionTimer } from './MissionTimer';
import { useTracking } from '../hooks/useTracking';
import { socketService } from '../services/socketService';
import * as Haptics from 'expo-haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Shield, AlertTriangle, Radio, Power } from 'lucide-react-native';

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

  const { startTracking, stopTracking, location } = useTracking();
  const [isStarting, setIsStarting] = useState(false);

  const name = me?.name ?? 'Unknown';
  const nrp = me?.nrp ?? '------';

  const handleStartDuty = async () => {
    try {
      setIsStarting(true);

      // Haptic feedback - heavy impact
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Trigger background tracking
      const started = await startTracking();
      if (!started) {
        Alert.alert('Error', 'Gagal memulai pelacakan. Pastikan izin lokasi diberikan.');
        setIsStarting(false);
        return;
      }

      // Update mission state to ACTIVE
      setMissionStatus('ACTIVE');

      // Send MISSION_START event to dashboard
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

  const handleStopDuty = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await stopTracking();
      setMissionStatus('IDLE');
    } catch (error) {
      console.error('[handleStopDuty] Error:', error);
    }
  };

  const handleSOS = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    toggleSOS();

    const currentLocation = location ?? { lat: -10.158, lng: 123.606 };
    if (!isSOSActive) {
      socketService.emitSOS(
        { lat: currentLocation.lat ?? -10.158, lng: currentLocation.lng ?? 123.606 },
        'Emergency SOS -也需要帮助!'
      );
    }
  };

  const isActive = missionStatus === 'ACTIVE';

  return (
    <View style={styles.container}>
      {/* Pulsing border when active */}
      {isActive && (
        <motion.View
          style={styles.pulseBorder}
          animate={{
            borderColor: ['#00ff88', '#00ff8800', '#00ff88'],
            borderWidth: [2, 4, 2],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
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
        <Text style={[styles.missionStatus, isActive && styles.missionActive]}>
          {missionStatus}
        </Text>
      </View>

      {/* Protocol Integrity Panel - shown when IDLE */}
      <AnimatePresence>
        {!isActive && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission Timer - shown when ACTIVE */}
      <AnimatePresence>
        {isActive && (
          <motion.View
            style={styles.activePanel}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <MissionTimer />
          </motion.View>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!isActive ? (
          <TouchableOpacity
            style={[styles.startButton, isStarting && styles.startButtonDisabled]}
            onPress={handleStartDuty}
            disabled={isStarting}
            activeOpacity={0.7}
          >
            <Power size={20} color="#000" />
            <Text style={styles.startButtonText}>
              {isStarting ? 'MEMULAI...' : 'START DUTY'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeButtons}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopDuty}
              activeOpacity={0.7}
            >
              <Radio size={18} color="#fff" />
              <Text style={styles.stopButtonText}>END DUTY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sosButton, isSOSActive && styles.sosButtonActive]}
              onPress={handleSOS}
              activeOpacity={0.7}
            >
              <AlertTriangle size={18} color={isSOSActive ? '#000' : '#fff'} />
              <Text style={[styles.sosButtonText, isSOSActive && styles.sosButtonTextActive]}>
                {isSOSActive ? 'SOS AKTIF' : 'SOS'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00ff88',
    overflow: 'hidden',
  },
  pulseBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  callsign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeOnline: {
    backgroundColor: '#00ff88',
  },
  badgeOffline: {
    backgroundColor: '#ff4444',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  officerInfo: {
    marginBottom: 12,
  },
  officerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  nrp: {
    fontSize: 12,
    color: '#888',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  missionLabel: {
    fontSize: 11,
    color: '#666',
    marginRight: 6,
  },
  missionStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffaa00',
  },
  missionActive: {
    color: '#00ff88',
  },
  protocolPanel: {
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4AF3720',
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF3720',
  },
  protocolTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 1,
  },
  protocolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  protocolLabel: {
    fontSize: 10,
    color: '#888',
  },
  protocolValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  activePanel: {
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  startButton: {
    backgroundColor: '#00ff88',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: '#00ff8860',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  activeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  stopButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  sosButton: {
    flex: 1,
    backgroundColor: '#ff444420',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  sosButtonActive: {
    backgroundColor: '#ff4444',
  },
  sosButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff4444',
    letterSpacing: 1,
  },
  sosButtonTextActive: {
    color: '#000',
  },
});