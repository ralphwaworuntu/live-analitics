// @ts-ignore
import React, { useEffect } from 'react';
// @ts-ignore
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
// @ts-ignore
import { MotiView, AnimatePresence } from 'moti';
// @ts-ignore
import * as Haptics from 'expo-haptics';
// @ts-ignore
import { AlertTriangle, X, ShieldAlert } from 'lucide-react-native';
import { useAppStore } from '../store';

export const NotificationBanner = () => {
  const activeAlerts = useAppStore((s: any) => s.activeAlerts);
  const removeAlert = useAppStore((s: any) => s.removeAlert);

  useEffect(() => {
    if (activeAlerts.length > 0) {
      // Haptic Feedback Task 2
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [activeAlerts.length]);

  return (
    <View style={styles.container}>
      <AnimatePresence>
        {activeAlerts.map((alert: any) => (
          <MotiView
            key={alert.id}
            from={{ translateY: -100, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: -100, opacity: 0 }}
            style={styles.banner}
          >
            <View style={styles.iconContainer}>
              <ShieldAlert size={24} color="#FF4D6D" />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>AI TURANGGA: {alert.title}</Text>
              <Text style={styles.description}>{alert.description}</Text>
            </View>
            <TouchableOpacity onPress={() => removeAlert(alert.id)}>
              <X size={20} color="#A9B9D6" />
            </TouchableOpacity>
          </MotiView>
        ))}
      </AnimatePresence>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    gap: 10,
  },
  banner: {
    backgroundColor: '#0E2442',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF4D6D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#FF4D6D',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  description: {
    color: '#EAF2FF',
    fontSize: 14,
    fontWeight: '500',
  },
});
