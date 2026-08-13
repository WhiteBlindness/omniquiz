export type SoundCue =
  | "click"
  | "start"
  | "submit"
  | "reveal"
  | "uncharted";

export type SoundEffects = Readonly<{
  click: () => void;
  start: () => void;
  submit: () => void;
  reveal: () => void;
  uncharted: () => void;
}>;

type SoundPlayer = (cue: SoundCue) => void;

export const createSfx = (play: SoundPlayer): SoundEffects =>
  Object.freeze({
    click: () => play("click"),
    start: () => play("start"),
    submit: () => play("submit"),
    reveal: () => play("reveal"),
    uncharted: () => play("uncharted"),
  });
