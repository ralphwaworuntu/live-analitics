// @ts-ignore
import React from 'react';
// @ts-ignore
import { View, Text, StyleSheet } from 'react-native';
// @ts-ignore
import { MotiView } from 'moti';
// @ts-ignore
import { Shield, Battery, Radio } from 'lucide-react-native';

interface TacticalHUDProps {
  status: 'ACTIVE' | 'STANDBY' | 'POWER_SAVE';
  battery: number;
  speed: number;
  riskScore: number;
}

const COLORS = {
  ACTIVE: '#00F0FF', // Neon Cyan
  STANDBY: '#D4AF37', // Gold
  POWER_SAVE: '#FF4D6D', // Red
};

export const TacticalHUD = ({ status, battery, speed, riskScore }: TacticalHUDProps) => {
  // Task 3: Dynamic HUD Mapping
  let color = COLORS[status] || COLORS.ACTIVE;
  
  if (riskScore > 75) color = COLORS.POWER_SAVE; // Danger
  else if (riskScore > 40) color = COLORS.STANDBY; // Cautious

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
        <View style={styles.header}>
          <Text style={[styles.statusLabel, { color }]}>{status} MODE</Text>
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Battery size={16} color="#A9B9D6" />
              <Text style={styles.metricText}>{Math.round(battery * 100)}%</Text>
            </View>
            <View style={styles.metricItem}>
              <Radio size={16} color="#A9B9D6" />
              <Text style={styles.metricText}>{speed}km/h</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.identity}>
          <Shield size={20} color={color} />
          <Text style={styles.unitName}>UNIT: POL-R4-NTT</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 18,
    fontFamily: 'JetBrainsMono-Bold',
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  unitName: {
    color: '#A9B9D6',
    fontSize: 12,
    letterSpacing: 2,
  },
});
