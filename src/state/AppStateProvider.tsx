"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { createSfx, type SoundCue, type SoundEffects } from "../lib/audio/sfx";
import {
  readMutePreference,
  readThemePreference,
  writeMutePreference,
  writeThemePreference,
} from "../components/game/storage";

export type Theme = "dark" | "light";

type Tone = Readonly<{
  frequency: number;
  duration: number;
  offset?: number;
}>;

const CUE_PATTERNS: Readonly<Record<SoundCue, readonly Tone[]>> = {
  click: [{ frequency: 392, duration: 0.045 }],
  start: [
    { frequency: 196, duration: 0.08 },
    { frequency: 262, duration: 0.08, offset: 0.08 },
    { frequency: 392, duration: 0.14, offset: 0.16 },
  ],
  submit: [{ frequency: 246, duration: 0.09 }],
  correct: [
    { frequency: 523, duration: 0.08 },
    { frequency: 659, duration: 0.08, offset: 0.08 },
    { frequency: 784, duration: 0.16, offset: 0.16 },
  ],
  wrong: [
    { frequency: 220, duration: 0.1 },
    { frequency: 164, duration: 0.18, offset: 0.1 },
  ],
  gameOver: [
    { frequency: 392, duration: 0.1 },
    { frequency: 330, duration: 0.1, offset: 0.1 },
    { frequency: 262, duration: 0.22, offset: 0.2 },
  ],
};

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let sharedAudioContext: AudioContext | null = null;

const playAudioCue = (cue: SoundCue): void => {
  if (typeof window === "undefined") return;

  try {
    const audioWindow = window as AudioWindow;
    const AudioContextConstructor =
      audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioContextConstructor) return;

    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = new AudioContextConstructor();
    }

    const context = sharedAudioContext;
    if (context.state === "suspended") void context.resume();

    const now = context.currentTime;
    CUE_PATTERNS[cue].forEach((tone) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + (tone.offset ?? 0);
      const end = start + tone.duration;

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(tone.frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.04, start + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(end + 0.015);
    });
  } catch {
    // Audio is an enhancement. Browser policy or unavailable hardware must not block play.
  }
};

type AppState = Readonly<{
  muted: boolean;
  theme: Theme;
  toggleMute: () => void;
  toggleTheme: () => void;
  play: (cue: SoundCue) => void;
  sfx: SoundEffects;
}>;

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [muted, setMuted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    let hydrationCancelled = false;
    queueMicrotask(() => {
      if (hydrationCancelled) return;
      setMuted(readMutePreference());
      setTheme(readThemePreference());
    });

    return () => {
      hydrationCancelled = true;
    };
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      writeMutePreference(next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      writeThemePreference(next);
      return next;
    });
  }, []);

  const play = useCallback(
    (cue: SoundCue) => {
      if (!muted) playAudioCue(cue);
    },
    [muted],
  );

  const sfx = useMemo(() => createSfx(play), [play]);
  const value = useMemo(
    () => Object.freeze({ muted, theme, toggleMute, toggleTheme, play, sfx }),
    [muted, play, sfx, theme, toggleMute, toggleTheme],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppState = (): AppState => {
  const state = useContext(AppStateContext);
  if (!state) throw new Error("useAppState must be used inside AppStateProvider");
  return state;
};
