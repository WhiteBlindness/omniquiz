import Image from "next/image";

import type { CSSProperties } from "react";

type OceanBackdropProps = Readonly<{
  depthMetres: number;
  mode: "daily" | "unlimited";
}>;

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

export function OceanBackdrop({ depthMetres, mode }: OceanBackdropProps) {
  const depthFactor = Math.min(1, Math.max(0, depthMetres / 7_000));
  const style = {
    "--depth-factor": depthFactor,
    "--depth-metres": `${Math.round(depthMetres)}m`,
  } as CSSProperties;

  return (
    <div className="ocean-backdrop" data-mode={mode} data-depth={depthMetres} style={style}>
      <div className="sky-layer" aria-hidden="true" />
      <div className="surface-glow" aria-hidden="true" />
      <div className="water-layer water-layer-top" aria-hidden="true" />
      <div className="water-layer water-layer-mid" aria-hidden="true" />
      <div className="water-layer water-layer-trench" aria-hidden="true" />
      <div className="surface-line" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      <div className="fish-field" aria-hidden="true">
        {FISH.map((fish, index) => (
          <span
            className={`fish ${fish.size}`}
            key={`${fish.left}-${index}`}
            style={{ left: fish.left, top: fish.top, animationDelay: fish.delay }}
          />
        ))}
      </div>

      <div className="particle-field" aria-hidden="true">
        {PARTICLES.map((particle, index) => (
          <span
            className="particle"
            key={`${particle.left}-${index}`}
            style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
          />
        ))}
      </div>

      <div className="krill-marker" aria-hidden="true">
        <Image src="/ocean/tier-krillion.png" alt="" width={96} height={96} priority />
      </div>

      <aside className="depth-ruler" aria-label="Depth scale">
        {[0, 100, 200, 300, 400, 500].map((mark) => (
          <span className="depth-mark" key={mark} style={{ top: `${15 + mark / 7}%` }}>
            <i aria-hidden="true" />
            <b>{mark === 0 ? "0m" : `-${mark}m`}</b>
          </span>
        ))}
      </aside>
    </div>
  );
}
