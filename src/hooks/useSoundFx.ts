"use client";

import { useCallback, useState } from "react";

import { readMutePreference, writeMutePreference } from "../components/game/storage";

export type SoundCue = "start" | "tick" | "submit" | "success" | "miss";

const CUE_SETTINGS: Record<SoundCue, Readonly<{ frequency: number; duration: number }>> = {
  start: { frequency: 164, duration: 0.18 },
  tick: { frequency: 440, duration: 0.045 },
  submit: { frequency: 246, duration: 0.1 },
  success: { frequency: 523, duration: 0.24 },
  miss: { frequency: 116, duration: 0.16 },
};

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export const useSoundFx = () => {
  const [muted, setMuted] = useState(() => readMutePreference());

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      writeMutePreference(next);
      return next;
    });
  }, []);

  const play = useCallback(
    (cue: SoundCue) => {
      if (muted || typeof window === "undefined") return;

      try {
        const audioWindow = window as AudioWindow;
        const AudioContextConstructor =
          audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
        if (!AudioContextConstructor) return;

        const context = new AudioContextConstructor();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const settings = CUE_SETTINGS[cue];
        const now = context.currentTime;

        oscillator.type = cue === "success" ? "square" : "triangle";
        oscillator.frequency.setValueAtTime(settings.frequency, now);
        if (cue === "success") {
          oscillator.frequency.exponentialRampToValueAtTime(
            settings.frequency * 1.5,
            now + settings.duration,
          );
        }
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.035, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + settings.duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + settings.duration + 0.02);
        oscillator.addEventListener("ended", () => {
          void context.close();
        });
      } catch {
        // Audio is a flourish. Browser policy or unavailable hardware must not block play.
      }
    },
    [muted],
  );

  return { muted, toggleMute, play };
};
