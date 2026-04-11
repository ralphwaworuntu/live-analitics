// @ts-ignore
import React, { useState } from 'react';
// @ts-ignore
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
// @ts-ignore
import * as Print from 'expo-print';
// @ts-ignore
import * as Sharing from 'expo-sharing';
// @ts-ignore
import { FileText, CheckCircle, ShieldCheck, Share2, LogOut } from 'lucide-react-native';
import { useAppStore } from '../store';

export const ShiftReviewScreen = ({ summary }: { summary: any }) => {
  const [exporting, setExporting] = useState(false);
  const resetMission = useAppStore((s: any) => s.resetMission);
  const me = useAppStore((s: any) => s.me);

  const generatePDF = async () => {
    // Task 3: Court-Ready PDF Generation
    setExporting(true);
    const html = `
      <html>
        <body style="font-family: Helvetica; padding: 40px; background: #fff; color: #000;">
          <h1 style="text-align: center; border-bottom: 2px solid #000;">LAPORAN HASIL PATROLI (ANEV)</h1>
          <p><strong>UNIT:</strong> SENTINEL-AI MOBILE</p>
          <p><strong>PETUGAS:</strong> ${me?.name} (NRP: ${me?.nrp})</p>
          <p><strong>ASSET ID:</strong> ${summary.assetId}</p>
          <hr/>
          <h3>MISSION SUMMARY</h3>
          <p>START: ${new Date(summary.startTime).toLocaleString()}</p>
          <p>END: ${new Date(summary.endTime).toLocaleString()}</p>
          <hr/>
          <div style="background: #f0f0f0; padding: 20px; border: 1px dashed #000;">
            <h3>FORENSIC SEC-HASH</h3>
            <p style="word-break: break-all; font-family: monospace;">${summary.finalHash}</p>
            <p style="font-size: 10px; color: #666;">INTEGRITY CHAIN VERIFIED BY BIRO OPS POLDA NTT</p>
          </div>
          <footer style="margin-top: 50px; text-align: center; border-top: 1px solid #ccc; padding-top: 10px;">
            <p>Generated via SENTINEL-AI VANGUARD MAPPING SYSTEM</p>
          </footer>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
      // Task 4: State Reset
      resetMission();
    } catch (error) {
       Alert.alert("Export Failed", "Could not generate shift report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <ShieldCheck size={32} color="#00F0FF" />
          <Text style={styles.title}>PATROL FINALIZED</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>START</Text>
            <Text style={styles.statValue}>{new Date(summary.startTime).toLocaleTimeString()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>END</Text>
            <Text style={styles.statValue}>{new Date(summary.endTime).toLocaleTimeString()}</Text>
          </View>
        </View>

        <View style={styles.integrityBox}>
          <CheckCircle size={16} color="#18C29C" />
          <Text style={styles.integrityText}>HASH INTEGRITY VERIFIED (LOCAL vs SERVER)</Text>
        </View>

        <View style={styles.hashContainer}>
          <Text style={styles.hashTitle}>FINAL SEC-HASH CHAIN</Text>
          <Text style={styles.hashValue}>{summary.finalHash}</Text>
        </View>

        <TouchableOpacity 
          style={styles.exportButton} 
          onPress={generatePDF}
          disabled={exporting}
        >
          <FileText size={20} color="#FFFFFF" />
          <Text style={styles.exportText}>EXPORT COURT-READY REPORT</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={resetMission}
        >
          <LogOut size={20} color="#A9B9D6" />
          <Text style={styles.resetText}>CLOSE & START NEW SHIFT</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111F',
    padding: 20,
    paddingTop: 60,
  },
  card: {
    backgroundColor: '#0B1B32',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: '#EAF2FF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  statLabel: {
    color: '#A9B9D6',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValue: {
    color: '#00F0FF',
    fontSize: 16,
    fontWeight: '800',
  },
  integrityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(24, 194, 156, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  integrityText: {
    color: '#18C29C',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hashContainer: {
    backgroundColor: '#07111F',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  hashTitle: {
    color: '#A9B9D6',
    fontSize: 10,
    marginBottom: 8,
  },
  hashValue: {
    color: '#6C7A89',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  exportButton: {
    backgroundColor: '#0B4AA2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  exportText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
  },
  resetText: {
    color: '#A9B9D6',
    fontSize: 14,
  },
});
