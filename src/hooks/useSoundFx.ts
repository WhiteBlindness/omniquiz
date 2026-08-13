"use client";

import { useAppState } from "../state/AppStateProvider";
import type { SoundCue, SoundEffects } from "../lib/audio/sfx";

export type { SoundCue, SoundEffects } from "../lib/audio/sfx";

export const useSoundFx = (): Readonly<{
  muted: boolean;
  toggleMute: () => void;
  play: (cue: SoundCue) => void;
  sfx: SoundEffects;
}> => {
  const { muted, toggleMute, play, sfx } = useAppState();
  return { muted, toggleMute, play, sfx };
};
