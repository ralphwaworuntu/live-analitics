import { useEffect, useRef } from "react";
import { useAppStore } from "@/store";

export function useEmergencySound() {
  const isEmergency = useAppStore((state) => state.emergency.active);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (isEmergency && !hasPlayedRef.current) {
      if (!audioCtxRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3); // drop to A4

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      hasPlayedRef.current = true;
    }

    if (!isEmergency) {
      hasPlayedRef.current = false;
    }
  }, [isEmergency]);
}
