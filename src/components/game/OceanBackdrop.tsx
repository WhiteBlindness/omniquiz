import type { CSSProperties } from "react";

type OceanBackdropProps = Readonly<{
  depthMetres: number;
  mode: "daily" | "unlimited";
  descentMetres?: number;
  descentEventKey?: string;
}>;

const DESCENT_MIN_METRES = 100;
const DESCENT_MAX_METRES = 1_000;
const DESCENT_MIN_SHIFT = 120;
const DESCENT_MAX_SHIFT = 320;
const DESCENT_MIN_DURATION = 850;
const DESCENT_MAX_DURATION = 1_350;

const DESCENT_STREAKS = [
  { left: "16%", top: "37%", height: "30px" },
  { left: "29%", top: "57%", height: "46px" },
  { left: "44%", top: "28%", height: "22px" },
  { left: "58%", top: "64%", height: "38px" },
  { left: "72%", top: "42%", height: "52px" },
  { left: "86%", top: "69%", height: "26px" },
] as const;

const DESCENT_VELOCITY_LINES = [
  { left: "3%", top: "-8%", height: "24vh", delay: "-80ms" },
  { left: "9%", top: "17%", height: "16vh", delay: "-240ms" },
  { left: "15%", top: "54%", height: "30vh", delay: "-420ms" },
  { left: "21%", top: "-12%", height: "19vh", delay: "-140ms" },
  { left: "27%", top: "28%", height: "26vh", delay: "-540ms" },
  { left: "33%", top: "67%", height: "18vh", delay: "-300ms" },
  { left: "39%", top: "-6%", height: "32vh", delay: "-680ms" },
  { left: "45%", top: "41%", height: "21vh", delay: "-360ms" },
  { left: "51%", top: "76%", height: "24vh", delay: "-180ms" },
  { left: "57%", top: "9%", height: "18vh", delay: "-620ms" },
  { left: "63%", top: "58%", height: "31vh", delay: "-260ms" },
  { left: "69%", top: "-10%", height: "22vh", delay: "-460ms" },
  { left: "75%", top: "34%", height: "27vh", delay: "-760ms" },
  { left: "81%", top: "71%", height: "17vh", delay: "-100ms" },
  { left: "87%", top: "14%", height: "29vh", delay: "-580ms" },
  { left: "93%", top: "48%", height: "20vh", delay: "-320ms" },
  { left: "6%", top: "83%", height: "14vh", delay: "-700ms" },
  { left: "96%", top: "79%", height: "15vh", delay: "-200ms" },
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
  intensity: number;
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
    intensity: Number(ratio.toFixed(3)),
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
          "--descent-intensity": descentMotion.intensity,
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
      {hasDescent ? (
        <div className="descent-velocity-field" aria-hidden="true">
          {DESCENT_VELOCITY_LINES.map((line) => (
            <span
              className="descent-velocity"
              key={`${line.left}-${line.top}`}
              style={{
                left: line.left,
                top: line.top,
                height: line.height,
                animationDelay: line.delay,
              }}
            />
          ))}
        </div>
      ) : null}
      {hasDescent ? <div className="descent-pressure-flash" aria-hidden="true" /> : null}
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
