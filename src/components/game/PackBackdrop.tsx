import type { LiveEnvironmentId } from "../../lib/packs/environment";
import { CinemaBackdrop } from "./CinemaBackdrop";
import type { GameMode, GamePhase } from "./gameReducer";
import { OceanBackdrop } from "./OceanBackdrop";
import { SpeedBackdrop } from "./SpeedBackdrop";
import { SurvivalBackdrop } from "./SurvivalBackdrop";

export type PackBackdropProps = Readonly<{
  environment: LiveEnvironmentId;
  mode: GameMode;
  phase: GamePhase;
  depthMetres: number;
  descentMetres: number;
  descentEventKey?: string;
  score: number;
  streak: number;
  streakMultiplier: number;
  lives: number;
  route: number;
  stageIndex: number;
  stageCount: number;
}>;

const OceanWorld = (props: PackBackdropProps) => {
  if (props.mode === "speed") {
    return (
      <SpeedBackdrop
        score={props.score}
        streak={props.streak}
        streakMultiplier={props.streakMultiplier}
      />
    );
  }
  if (props.mode === "survival") {
    return <SurvivalBackdrop lives={props.lives} score={props.score} />;
  }
  return (
    <OceanBackdrop
      depthMetres={props.depthMetres}
      mode={props.mode}
      descentMetres={props.descentMetres}
      descentEventKey={props.descentEventKey}
    />
  );
};

const CinemaWorld = (props: PackBackdropProps) => (
  <CinemaBackdrop
    route={props.route}
    stageIndex={props.stageIndex}
    phase={props.phase}
    streak={props.streak}
    streakMultiplier={props.streakMultiplier}
  />
);

/** Exhaustive over live environments: adding one to `LiveEnvironmentId` fails to compile until it has a renderer. */
const RENDERERS: Readonly<Record<LiveEnvironmentId, (props: PackBackdropProps) => React.ReactElement>> = {
  ocean: OceanWorld,
  cinema: CinemaWorld,
};

export function PackBackdrop(props: PackBackdropProps) {
  return RENDERERS[props.environment](props);
}
