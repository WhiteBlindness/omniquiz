import type { CSSProperties } from "react";

type SpeedBackdropProps = Readonly<{
  score: number;
  streak: number;
  streakMultiplier: number;
}>;

const SPEED_LINES = [
  { left: "5%", height: "22vh", delay: "0ms" },
  { left: "12%", height: "16vh", delay: "-380ms" },
  { left: "19%", height: "28vh", delay: "-720ms" },
  { left: "27%", height: "18vh", delay: "-160ms" },
  { left: "35%", height: "24vh", delay: "-540ms" },
  { left: "43%", height: "14vh", delay: "-280ms" },
  { left: "51%", height: "26vh", delay: "-660ms" },
  { left: "59%", height: "20vh", delay: "-100ms" },
  { left: "67%", height: "16vh", delay: "-440ms" },
  { left: "75%", height: "30vh", delay: "-800ms" },
  { left: "83%", height: "18vh", delay: "-200ms" },
  { left: "91%", height: "22vh", delay: "-580ms" },
] as const;

const GRID_NODES = [
  { left: "10%", top: "72%", delay: "-1s" },
  { left: "25%", top: "81%", delay: "-3.5s" },
  { left: "42%", top: "76%", delay: "-6s" },
  { left: "58%", top: "84%", delay: "-2s" },
  { left: "74%", top: "69%", delay: "-4.5s" },
  { left: "89%", top: "78%", delay: "-7s" },
] as const;

export function SpeedBackdrop({ score, streak, streakMultiplier }: SpeedBackdropProps) {
  const intensity = Math.min(1, score / 3000);
  const style = {
    "--speed-intensity": intensity,
  } as CSSProperties;

  return (
    <div className="speed-backdrop" data-streak={streak > 0 ? "active" : "idle"} style={style}>
      <div className="speed-grid-world" aria-hidden="true">
        <div className="speed-grid-floor" />
        <div className="speed-horizon-glow" />
      </div>
      <div className="speed-line-field" aria-hidden="true">
        {SPEED_LINES.map((line) => (
          <span
            className="speed-line"
            key={line.left}
            style={{ left: line.left, height: line.height, animationDelay: line.delay }}
          />
        ))}
      </div>
      <div className="speed-node-field" aria-hidden="true">
        {GRID_NODES.map((node) => (
          <span
            className="speed-node"
            key={`${node.left}-${node.top}`}
            style={{ left: node.left, top: node.top, animationDelay: node.delay }}
          />
        ))}
      </div>
      {streakMultiplier > 1 ? (
        <div className="speed-boost-flash" key={`boost-${streakMultiplier}`} aria-hidden="true" />
      ) : null}
      <div className="scanlines" aria-hidden="true" />
    </div>
  );
}
