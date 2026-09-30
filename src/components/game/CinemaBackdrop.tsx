import type { CSSProperties } from "react";

import { useEnvironment } from "./EnvironmentContext";
import type { GamePhase } from "./gameReducer";

type CinemaBackdropProps = Readonly<{
  route: number;
  stageIndex: number;
  phase: GamePhase;
  streak: number;
  streakMultiplier: number;
}>;

const PIECES = [
  { id: "city-limits", glow: ["sign"] },
  { id: "cinema-district", glow: ["marquee", "blade"] },
  { id: "neon-boulevard", glow: ["neon", "board"] },
  { id: "drive-in", glow: ["screen"] },
  { id: "premiere-night", glow: ["marquee"] },
] as const;

const CARS = ["a", "b", "c", "a"] as const;

export function CinemaBackdrop({
  route,
  stageIndex,
  phase,
  streak,
  streakMultiplier,
}: CinemaBackdropProps) {
  const stops = useEnvironment().stages ?? [];
  const arrived = phase === "summary" && route >= 1;
  const style = { "--route": route } as CSSProperties;

  return (
    <div
      className="cinema-backdrop"
      data-stage={stageIndex}
      data-arrived={arrived ? "true" : "false"}
      data-streak={streak > 0 ? "active" : "idle"}
      style={style}
    >
      <div className="cinema-world" aria-hidden="true">
        <div className="cinema-sky">
          <span className="cinema-stars" />
          <span className="cinema-moon" />
          <span className="cinema-horizon-glow" />
        </div>
        <div className="cinema-beams">
          <span className="cinema-beam cinema-beam-a" />
          <span className="cinema-beam cinema-beam-b" />
          <span className="cinema-beam cinema-beam-c" />
        </div>
        <div className="cinema-layer cinema-far" />
        <div className="cinema-layer cinema-mid" />
        <div className="cinema-route">
          {PIECES.map((piece, index) => (
            <div
              className={`cinema-piece piece-${piece.id}`}
              data-active={index === stageIndex ? "true" : "false"}
              key={piece.id}
              style={{ "--k": index } as CSSProperties}
            >
              {piece.glow.map((name) => (
                <span className={`piece-glow glow-${name}`} key={name} />
              ))}
            </div>
          ))}
        </div>
        <div className="cinema-layer cinema-lamps" />
        <div className="cinema-road">
          <span className="cinema-lane" />
          {CARS.map((kind, index) => (
            <span className={`cinema-car car-${kind} car-lane-${index}`} key={index} />
          ))}
        </div>
        {stageIndex > 0 ? (
          <div className="cinema-stage-sweep" key={`sweep-${stageIndex}`} />
        ) : null}
        {streakMultiplier > 1 ? (
          <div className="cinema-boost" key={`boost-${streakMultiplier}`} />
        ) : null}
      </div>
      <div className="scanlines" aria-hidden="true" />
      <div className="route-ruler" aria-hidden="true">
        {stops.map((stage, index) => (
          <span
            className="route-stop"
            data-reached={index <= stageIndex ? "true" : "false"}
            key={stage.id}
            style={{ top: `${6 + (index / (stops.length - 1)) * 88}%` }}
          >
            <i />
            <b className="telemetry-data">{stage.short}</b>
          </span>
        ))}
        <span className="route-marker" style={{ top: `${6 + route * 88}%` }} />
      </div>
    </div>
  );
}
