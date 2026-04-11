// @ts-ignore
import React from 'react';
// @ts-ignore
import { StyleSheet, View, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { TacticalHUD } from '../components/TacticalHUD';
import { AssetScanner } from '../components/AssetScanner';
import { SOSButton } from '../components/SOSButton';
import { SECHashTicker } from '../components/SECHashTicker';
import { useTracking } from '../hooks/useTracking';
import { useAppStore } from '../store';
// @ts-ignore
import { Play } from 'lucide-react-native';

export default function MainScreen() {
  const { speed, batteryLevel, isStandby } = useTracking();
  const assetId = useAppStore((s: any) => s.assetId);
  const isSOSActive = useAppStore((s: any) => s.isSOSActive);

  const getStatus = () => {
    if (batteryLevel < 0.15) return 'POWER_SAVE';
    if (isStandby) return 'STANDBY';
    return 'ACTIVE';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <TacticalHUD 
        status={getStatus()} 
        battery={batteryLevel} 
        speed={speed} 
      />

      <AssetScanner />

      <View style={styles.center}>
        <SOSButton />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          disabled={!assetId}
          style={[styles.startDuty, !assetId && styles.locked]}
          onPress={() => console.log("Duty Started")}
        >
          <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.startText}>START MISSION DUTY</Text>
        </TouchableOpacity>
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
  startText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
