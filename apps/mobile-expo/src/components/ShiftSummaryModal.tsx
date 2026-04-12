import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Gauge, Battery, CheckCircle, XCircle, Navigation } from 'lucide-react-native';

export interface ShiftSummaryData {
  unitId: string;
  nrp: string;
  officerName: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  totalDistanceKm: number;
  averageSpeedKmh: number;
  batteryLevelStart: number;
  batteryLevelEnd: number;
}

interface ShiftSummaryModalProps {
  visible: boolean;
  summary: ShiftSummaryData | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function ShiftSummaryModal({ visible, summary, onClose, onConfirm }: ShiftSummaryModalProps) {
  if (!summary) return null;

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const batteryDrain = summary.batteryLevelStart - summary.batteryLevelEnd;
  const batteryIcon = summary.batteryLevelEnd > 50 ? '🟢' : summary.batteryLevelEnd > 20 ? '🟡' : '🔴';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <AnimatePresence>
          <motion.View
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={styles.modal}
          >
            <View style={styles.header}>
              <CheckCircle size={24} color="#00ff88" />
              <Text style={styles.title}>SHIFT SUMMARY</Text>
            </View>

            <View style={styles.officerInfo}>
              <Text style={styles.officerName}>{summary.officerName}</Text>
              <Text style={styles.unitId}>{summary.unitId} • {summary.nrp}</Text>
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>START</Text>
                <Text style={styles.timeValue}>{formatTime(summary.startTime)}</Text>
              </View>
              <View style={styles.arrow}>
                <Navigation size={16} color="#D4AF37" />
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>END</Text>
                <Text style={styles.timeValue}>{formatTime(summary.endTime)}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>PATROL STATISTICS</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Clock size={18} color="#D4AF37" />
                </View>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{formatDuration(summary.durationMs)}</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <MapPin size={18} color="#D4AF37" />
                </View>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{summary.totalDistanceKm.toFixed(2)} km</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Gauge size={18} color="#D4AF37" />
                </View>
                <Text style={styles.statLabel}>Avg Speed</Text>
                <Text style={styles.statValue}>{summary.averageSpeedKmh.toFixed(1)} km/h</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Battery size={18} color="#D4AF37" />
                </View>
                <Text style={styles.statLabel}>Battery Used</Text>
                <Text style={[styles.statValue, batteryDrain > 30 && styles.statWarning]}>
                  {batteryDrain.toFixed(0)}% {batteryIcon}
                </Text>
              </View>
            </View>

            <View style={styles.batteryRow}>
              <View style={styles.batteryBlock}>
                <Text style={styles.batteryLabel}>Start</Text>
                <Text style={styles.batteryValue}>{summary.batteryLevelStart.toFixed(0)}%</Text>
              </View>
              <View style={styles.batteryArrow}>
                <Text style={styles.batteryArrowText}>→</Text>
              </View>
              <View style={styles.batteryBlock}>
                <Text style={styles.batteryLabel}>End</Text>
                <Text style={styles.batteryValue}>{summary.batteryLevelEnd.toFixed(0)}%</Text>
              </View>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <XCircle size={18} color="#ff4444" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                <CheckCircle size={18} color="#000" />
                <Text style={styles.confirmButtonText}>Submit & Close</Text>
              </TouchableOpacity>
            </View>
          </motion.View>
        </AnimatePresence>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
    letterSpacing: 2,
  },
  officerInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  officerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  unitId: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff88',
    marginTop: 4,
  },
  arrow: {
    paddingHorizontal: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  statWarning: {
    color: '#ff4444',
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  batteryBlock: {
    alignItems: 'center',
    flex: 1,
  },
  bat
