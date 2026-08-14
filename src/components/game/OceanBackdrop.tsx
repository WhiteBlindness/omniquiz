import type { CSSProperties } from "react";

type OceanBackdropProps = Readonly<{
  depthMetres: number;
  mode: "daily" | "unlimited";
  descentMetres?: number;
  descentEventKey?: string;
}>;

const DESCENT_MIN_METRES = 100;
const DESCENT_MAX_METRES = 1_000;
const DESCENT_MIN_SHIFT = 28;
const DESCENT_MAX_SHIFT = 104;
const DESCENT_MIN_DURATION = 420;
const DESCENT_MAX_DURATION = 720;

const DESCENT_STREAKS = [
  { left: "16%", top: "37%", height: "30px" },
  { left: "29%", top: "57%", height: "46px" },
  { left: "44%", top: "28%", height: "22px" },
  { left: "58%", top: "64%", height: "38px" },
  { left: "72%", top: "42%", height: "52px" },
  { left: "86%", top: "69%", height: "26px" },
] as const;

const FISH = [
  { left: "5%", top: "77%", size: "fish-small", delay: "-2s" },
  { left: "14%", top: "69%", size: "fish-tiny", delay: "-6s" },
  { left: "24%", top: "80%", size: "fish-small", delay: "-10s" },
  { left: "39%", top: "74%", size: "fish-tiny", delay: "-4s" },
  { left: "52%", top: "83%", size: "fish-small", delay: "-8s" },
  { left: "69%", top: "71%", size: "fish-medium", delay: "-12s" },
  { left: "83%", top: "79%", size: "fish-small", delay: "-1s" },
  { left: "91%", top: "64%", size: "fish-tiny", delay: "-5s" },
] as const;

const PARTICLES = [
  { left: "8%", top: "63%", delay: "-1s" },
  { left: "19%", top: "88%", delay: "-8s" },
  { left: "31%", top: "68%", delay: "-4s" },
  { left: "47%", top: "91%", delay: "-12s" },
  { left: "61%", top: "61%", delay: "-3s" },
  { left: "73%", top: "86%", delay: "-9s" },
  { left: "88%", top: "73%", delay: "-6s" },
] as const;

export const getDescentMotion = (earnedDepthMetres: number): Readonly<{
  shift: number;
  duration: number;
}> => {
  const safeDepth = Number.isFinite(earnedDepthMetres) ? Math.max(0, earnedDepthMetres) : 0;
  const ratio = Math.min(
    1,
    Math.max(
      0,
      (safeDepth - DESCENT_MIN_METRES) / (DESCENT_MAX_METRES - DESCENT_MIN_METRES),
    ),
  );
  return Object.freeze({
    shift: Math.round(DESCENT_MIN_SHIFT + ratio * (DESCENT_MAX_SHIFT - DESCENT_MIN_SHIFT)),
    duration: Math.round(
      DESCENT_MIN_DURATION + ratio * (DESCENT_MAX_DURATION - DESCENT_MIN_DURATION),
    ),
  });
};

export function OceanBackdrop({
  depthMetres,
  mode,
  descentMetres = 0,
  descentEventKey,
}: OceanBackdropProps) {
  const depthFactor = Math.min(1, Math.max(0, depthMetres / 7_000));
  const showMidwater = depthMetres >= 1_400;
  const showTrench = depthMetres >= 4_200;
  const safeDescentMetres = Number.isFinite(descentMetres) ? Math.max(0, descentMetres) : 0;
  const hasDescent = safeDescentMetres > 0;
  const descentMotion = getDescentMotion(safeDescentMetres);
  const style = {
    "--depth-factor": depthFactor,
    "--depth-metres": `${Math.round(depthMetres)}m`,
    "--depth-marker": `${4 + depthFactor * 92}%`,
    ...(hasDescent
      ? {
          "--descent-shift": `${descentMotion.shift}px`,
          "--descent-duration": `${descentMotion.duration}ms`,
        }
      : {}),
  } as CSSProperties;

  return (
    <div
      className="ocean-backdrop"
      data-mode={mode}
      data-depth={depthMetres}
      data-descent={hasDescent ? "active" : "idle"}
      style={style}
    >
      <div
        className="ocean-world"
        data-descent={hasDescent ? "active" : "idle"}
        data-descent-event={descentEventKey}
        key={descentEventKey ?? "resting-world"}
        aria-hidden="true"
      >
        <div className="mission-panorama" />
        {showMidwater ? <div className="water-layer water-layer-mid" /> : null}
        {showTrench ? <div className="water-layer water-layer-trench" /> : null}

        <div className="fish-field">
          {FISH.map((fish, index) => (
            <span
              className={`fish ${fish.size}`}
              key={`${fish.left}-${index}`}
              style={{ left: fish.left, top: fish.top, animationDelay: fish.delay }}
            />
          ))}
        </div>

        <div className="particle-field">
          {PARTICLES.map((particle, index) => (
            <span
              className="particle"
              key={`${particle.left}-${index}`}
              style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
            />
          ))}
        </div>

        {hasDescent ? (
          <div className="descent-streak-field" aria-hidden="true">
            {DESCENT_STREAKS.map((streak) => (
              <span
                className="descent-streak"
                key={`${streak.left}-${streak.top}`}
                style={{ left: streak.left, top: streak.top, height: streak.height }}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="scanlines" aria-hidden="true" />
      <aside className="depth-ruler" aria-label="Depth scale">
        {[0, 1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_000].map((mark) => (
          <span
            className="depth-mark"
            key={mark}
            style={{ top: `${4 + (mark / 7_000) * 92}%` }}
          >
            <i aria-hidden="true" />
            <b className="telemetry-data">{mark === 0 ? "0m" : `${mark}m`}</b>
          </span>
        ))}
        <span className="current-depth-marker" style={{ top: "var(--depth-marker)" }}>
          <i aria-hidden="true" />
          <b className="telemetry-data">{Math.round(depthMetres)}m current depth</b>
        </span>
      </aside>
    </div>
  );
}
