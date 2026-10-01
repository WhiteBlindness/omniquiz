import type { CSSProperties } from "react";

type SurvivalBackdropProps = Readonly<{
  lives: number;
  score: number;
}>;

const EMBERS = [
  { left: "7%", top: "82%", delay: "-1s" },
  { left: "18%", top: "91%", delay: "-5s" },
  { left: "29%", top: "76%", delay: "-9s" },
  { left: "41%", top: "88%", delay: "-3s" },
  { left: "53%", top: "79%", delay: "-7s" },
  { left: "64%", top: "93%", delay: "-11s" },
  { left: "76%", top: "84%", delay: "-2s" },
  { left: "87%", top: "71%", delay: "-6s" },
  { left: "15%", top: "66%", delay: "-13s" },
  { left: "48%", top: "69%", delay: "-8s" },
  { left: "82%", top: "89%", delay: "-4s" },
] as const;

const VOID_CRACKS = [
  { left: "20%", top: "35%", rotation: "12deg", width: "80px" },
  { left: "65%", top: "55%", rotation: "-18deg", width: "60px" },
  { left: "40%", top: "72%", rotation: "8deg", width: "100px" },
] as const;

export function SurvivalBackdrop({ lives, score }: SurvivalBackdropProps) {
  const danger = Math.min(1, Math.max(0, (3 - lives) / 3));
  const intensity = Math.min(1, score / 5000);
  const style = {
    "--danger-level": danger,
    "--survival-intensity": intensity,
  } as CSSProperties;

  return (
    <div className="survival-backdrop" data-lives={lives} style={style}>
      <div className="survival-void" aria-hidden="true">
        <div className="survival-ambient-glow" />
      </div>
      <div className="survival-heartbeat" aria-hidden="true" />
      <div className="survival-ember-field" aria-hidden="true">
        {EMBERS.map((ember, i) => (
          <span
            className="survival-ember"
            key={`${ember.left}-${i}`}
            style={{ left: ember.left, top: ember.top, animationDelay: ember.delay }}
          />
        ))}
      </div>
      <div className="survival-crack-field" aria-hidden="true">
        {VOID_CRACKS.map((crack) => (
          <span
            className="survival-crack"
            key={`${crack.left}-${crack.top}`}
            style={{
              left: crack.left,
              top: crack.top,
              width: crack.width,
              transform: `rotate(${crack.rotation})`,
            }}
          />
        ))}
      </div>
      <div className="scanlines" aria-hidden="true" />
    </div>
  );
}
