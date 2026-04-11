// @ts-ignore
import React, { useState, useRef } from 'react';
// @ts-ignore
import { StyleSheet, Text, View, Pressable, Vibration } from 'react-native';
// @ts-ignore
import { MotiView, MotiText } from 'moti';
// @ts-ignore
import { AlertCircle } from 'lucide-react-native';
import { useAppStore } from '../store';

export const SOSButton = () => {
  const [progress, setProgress] = useState(0);
  const isSOSActive = useAppStore((s: any) => s.isSOSActive);
  const toggleSOS = useAppStore((s: any) => s.toggleSOS);
  const timerRef = useRef<any>(null);

  const startPress = () => {
    if (isSOSActive) return;
    
    setProgress(0);
    const step = 0.05;
    timerRef.current = setInterval(() => {
      setProgress((prev: number) => {
        if (prev >= 1) {
          clearInterval(timerRef.current!);
          triggerSOS();
          return 1;
        }
        return prev + step;
      });
    }, 150); // 3 seconds total (20 steps * 150ms)
  };

  const endPress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isSOSActive) setProgress(0);
  };

  const triggerSOS = () => {
    Vibration.vibrate([100, 200, 100, 200]);
    toggleSOS();
  };

  return (
    <View style={styles.container}>
      {isSOSActive && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ type: 'timing', duration: 500, loop: true }}
          style={styles.sosFlash}
        />
      )}

      <Pressable
        onPressIn={startPress}
        onPressOut={endPress}
        style={({ pressed }: any) => [
          styles.button,
          isSOSActive ? styles.active : (pressed ? styles.pressed : null)
        ]}
      >
        <MotiView
          animate={{
            scale: isSOSActive ? [1, 1.1, 1] : 1,
          }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
          }}
          style={styles.iconContainer}
        >
          <AlertCircle size={64} color={isSOSActive ? "#FFFFFF" : "#FF4D6D"} />
        </MotiView>

        <Text style={styles.buttonText}>
          {isSOSActive ? "SOS BROADCASTING" : "HOLD 3S FOR SOS"}
        </Text>

        {progress > 0 && progress < 1 && (
          <View style={styles.progressContainer}>
            <MotiView
              animate={{ width: `${progress * 100}%` }}
              style={styles.progressBar}
            />
          </View>
        )}
      </Pressable>

      {isSOSActive && (
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.sosAlert}
        >
          CRISIS MODE: COMMAND CENTER NOTIFIED
        </MotiText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    width: '100%',
  },
  button: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 77, 109, 0.1)',
    borderWidth: 4,
    borderColor: '#FF4D6D',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  active: {
    backgroundColor: '#FF4D6D',
    borderColor: '#FFFFFF',
  },
  pressed: {
    backgroundColor: 'rgba(255, 77, 109, 0.3)',
  },
  iconContainer: {
    marginBottom: 10,
  },
  buttonText: {
    color: '#EAF2FF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  sosFlash: {
    position: 'absolute',
    width: 1000,
    height: 1000,
    backgroundColor: '#FF4D6D',
    zIndex: -1,
  },
  sosAlert: {
    color: '#FF4D6D',
    fontWeight: 'bold',
    marginTop: 20,
    letterSpacing: 1,
  },
});
