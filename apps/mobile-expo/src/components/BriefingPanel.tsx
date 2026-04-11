// @ts-ignore
import React from 'react';
// @ts-ignore
import { StyleSheet, Text, View, ScrollView } from 'react-native';
// @ts-ignore
import { BookOpen, Info } from 'lucide-react-native';
import { useAppStore } from '../store';

export const BriefingPanel = () => {
  const briefing = useAppStore((s: any) => s.briefing);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BookOpen size={18} color="#D4AF37" />
        <Text style={styles.title}>MISSION BRIEFING / REN GIAT</Text>
      </View>
      <ScrollView style={styles.contentBox}>
        <Text style={styles.text}>{briefing || "No active briefing for this shift."}</Text>
      </ScrollView>
      <View style={styles.footer}>
        <Info size={12} color="#A9B9D6" />
        <Text style={styles.footerText}>Updated: Today, 22:00 WITA</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B1B32',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  contentBox: {
    maxHeight: 150,
  },
  text: {
    color: '#EAF2FF',
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  footerText: {
    color: '#A9B9D6',
    fontSize: 10,
  },
});
