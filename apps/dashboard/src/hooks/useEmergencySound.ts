import { useCallback, useEffect, useRef } from "react";
import { useAppStore } from "@/store";

export function useEmergencySound() {
  const isEmergency = useAppStore((state) => state.emergency.active);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasPlayedRef = useRef(false);

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    return ctx;
  }, []);

  const playSweep = useCallback((fromHz: number, toHz: number, duration: number, type: OscillatorType = "sine") => {
    if (typeof window === "undefined") {
      return;
    }

    const ctx = ensureAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(fromHz, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(toHz, ctx.currentTime + duration * 0.65);

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [ensureAudioContext]);

  const playTacticalBeep = useCallback(() => {
    playSweep(1200, 760, 0.24, "square");
  }, [playSweep]);

  useEffect(() => {
    if (isEmergency && !hasPlayedRef.current) {
      playSweep(880, 440, 0.5, "sine");

      hasPlayedRef.current = true;
    }

    if (!isEmergency) {
      hasPlayedRef.current = false;
    }
  }, [isEmergency, playSweep]);

  return { playTacticalBeep };
}
