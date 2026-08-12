type SoundControlProps = Readonly<{
  muted: boolean;
  onToggle: () => void;
}>;

export function SoundControl({ muted, onToggle }: SoundControlProps) {
  return (
    <button
      className="sound-control pixel-control"
      type="button"
      aria-label={muted ? "Sound is muted. Turn sound on" : "Sound is on. Mute sound"}
      aria-pressed={muted}
      onClick={onToggle}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
        {muted ? <path className="sound-slash" d="m17 9 4 6m0-6-4 6" /> : <path d="M17 9.5c1.5 1.2 1.5 3.8 0 5" />}
      </svg>
      <span className="sr-only">{muted ? "muted" : "sound on"}</span>
    </button>
  );
}
