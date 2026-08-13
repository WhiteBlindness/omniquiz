export type SoundCue =
  | "click"
  | "start"
  | "submit"
  | "correct"
  | "wrong"
  | "gameOver";

export type SoundEffects = Readonly<{
  click: () => void;
  start: () => void;
  submit: () => void;
  correct: () => void;
  wrong: () => void;
  gameOver: () => void;
}>;

type SoundPlayer = (cue: SoundCue) => void;

export const createSfx = (play: SoundPlayer): SoundEffects =>
  Object.freeze({
    click: () => play("click"),
    start: () => play("start"),
    submit: () => play("submit"),
    correct: () => play("correct"),
    wrong: () => play("wrong"),
    gameOver: () => play("gameOver"),
  });
