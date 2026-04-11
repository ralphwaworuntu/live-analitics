// @ts-ignore
import React from 'react';
// @ts-ignore
import { StyleSheet, View, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { TacticalHUD } from '../components/TacticalHUD';
import { AssetScanner } from '../components/AssetScanner';
import { SOSButton } from '../components/SOSButton';
import { SECHashTicker } from '../components/SECHashTicker';
import { NotificationBanner } from '../components/NotificationBanner';
import { EvidenceVault } from '../components/EvidenceVault';
import { BriefingPanel } from '../components/BriefingPanel';
import { TacticalMap } from '../components/TacticalMap';
import { ShiftReviewScreen } from './ShiftReviewScreen';
import { useTracking } from '../hooks/useTracking';
import { useAppStore } from '../store';
import { verifyIdentity } from '../utils/security';
// @ts-ignore
import { Play, Square } from 'lucide-react-native';

export default function MainScreen() {
  const { speed, batteryLevel, isStandby, finishMission } = useTracking();
  const assetId = useAppStore((s: any) => s.assetId);
  const isSOSActive = useAppStore((s: any) => s.isSOSActive);
  const riskScore = useAppStore((s: any) => s.riskScore);
  const missionStatus = useAppStore((s: any) => s.missionStatus);
  const setMissionStatus = useAppStore((s: any) => s.setMissionStatus);
  const [summary, setSummary] = React.useState<any>(null);

  if (missionStatus === 'FINISHED' && summary) {
    return <ShiftReviewScreen summary={summary} />;
  }

  const getStatus = () => {
    if (batteryLevel < 0.15) return 'POWER_SAVE';
    if (isStandby) return 'STANDBY';
    return 'ACTIVE';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <NotificationBanner />
      
      <TacticalHUD 
        status={getStatus()} 
        battery={batteryLevel} 
        speed={speed} 
        riskScore={riskScore}
      />

      <AssetScanner />
      
      <BriefingPanel />

      <View style={styles.center}>
        <SOSButton />
      </View>

      <EvidenceVault />

      <View style={styles.footer}>
        {missionStatus === 'ACTIVE' ? (
          <TouchableOpacity 
            style={[styles.startDuty, styles.finishBtn]}
            onPress={async () => {
              // Task 1: Biometric Lockdown for Finish Mission
              const isVerified = await verifyIdentity("Finalize Mission Patrol");
              if (!isVerified) return;

              const res = await finishMission();
              setSummary(res);
            }}
          >
            <Square size={20} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startText}>FINISH MISSION PATROL</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            disabled={!assetId}
            style={[styles.startDuty, !assetId && styles.locked]}
            onPress={() => {
              console.log("Duty Started");
              setMissionStatus('ACTIVE');
            }}
          >
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startText}>START MISSION DUTY</Text>
          </TouchableOpacity>
        )}
      </View>

      <SECHashTicker />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F', // Military Dark
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for ticker
  },
  startDuty: {
    backgroundColor: '#0B4AA2', // Brand Primary
    height: 64,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  locked: {
    backgroundColor: '#0E2442',
    opacity: 0.5,
  },
  finishBtn: {
    backgroundColor: '#FF4D6D',
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
