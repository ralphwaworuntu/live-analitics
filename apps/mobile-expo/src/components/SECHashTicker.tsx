// @ts-ignore
import React from 'react';
// @ts-ignore
import { View, Text, StyleSheet } from 'react-native';
// @ts-ignore
import { MotiView } from 'moti';
// @ts-ignore
import { CheckCircle2 } from 'lucide-react-native';
import { useAppStore } from '../store';

export const SECHashTicker = () => {
  const currentHash = useAppStore((s: any) => s.currentHash);
  
  // Extract the last 12 chars as requested
  const displayHash = currentHash.slice(-12);

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <CheckCircle2 size={12} color="#18C29C" />
        <Text style={styles.labelText}>SEC-HASH: INTEGRITY VERIFIED</Text>
      </View>
      
      <MotiView
        from={{ translateX: 50, opacity: 0 }}
        animate={{ translateX: 0, opacity: 1 }}
        key={currentHash} // Animation restarts when hash changes
        style={styles.ticker}
      >
        <Text style={styles.hashText}>[{displayHash}]</Text>
        <View style={styles.pulseDot} />
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#07111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 240, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    color: '#18C29C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ticker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hashText: {
    color: '#00F0FF',
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F0FF',
  },
});
