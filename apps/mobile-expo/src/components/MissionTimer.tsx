import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../store';

export function MissionTimer() {
  const missionStatus = useAppStore((s) => s.missionStatus);
  const missionStartTime = useAppStore((s) => s.missionStartTime);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (missionStatus !== 'ACTIVE' || !missionStartTime) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      setElapsed(Date.now() - missionStartTime);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [missionStatus, missionStartTime]);

  if (missionStatus !== 'ACTIVE') {
    return null;
  }

  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const duration = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PATROL DURATION</Text>
      <Text style={styles.timer}>{duration}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 10,
    color: '#00ff88',
    fontWeight: '600',
    letterSpacing: 1,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
});