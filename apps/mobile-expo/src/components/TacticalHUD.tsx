import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../store';
import { MissionTimer } from './MissionTimer';

interface TacticalHUDProps {
  isConnected?: boolean;
}

export function TacticalHUD({ isConnected = false }: TacticalHUDProps) {
  const me = useAppStore((s) => s.me);
  const assetId = useAppStore((s) => s.assetId);
  const missionStatus = useAppStore((s) => s.missionStatus);

  const name = me?.name ?? 'Unknown';
  const nrp = me?.nrp ?? '------';

  return (
    <View style={styles.container}>
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
        <Text style={[styles.missionStatus, missionStatus === 'ACTIVE' && styles.missionActive]}>
          {missionStatus}
        </Text>
      </View>

      <MissionTimer />
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
    marginBottom: 8,
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
});