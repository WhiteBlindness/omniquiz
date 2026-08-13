import type { SubmissionResult } from "../../lib/game/scoring";
import { useEffect, useRef } from "react";

import type { GameOutcome } from "./gameReducer";

type FeedbackPanelProps = Readonly<{
  result: SubmissionResult;
  score: number;
  depthMetres: number;
  isLastRound: boolean;
  penaltyPoints?: number;
  onContinue: () => void;
  outcome?: GameOutcome;
}>;

const TIER_LABELS: Record<SubmissionResult["tier"], string> = {
  plankton: "PLANKTON",
  tooclever: "TOO CLEVER",
  schooler: "SCHOOLER",
  rare: "RARE CATCH",
  deepcut: "DEEP CUT",
  krillion: "KRILLION",
};

export function FeedbackPanel({
  result,
  score,
  depthMetres,
  isLastRound,
  penaltyPoints = 0,
  onContinue,
  outcome = "answer",
}: FeedbackPanelProps) {
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  const kicker = outcome === "pass"
    ? "PASS LOGGED"
    : outcome === "timeout"
      ? "TIME EXPIRED"
      : "ANSWER LOGGED";
  const heading = outcome === "pass"
    ? "PASS RECORDED"
    : outcome === "timeout"
      ? "CURRENT MISSED"
      : result.accepted
        ? TIER_LABELS[result.tier]
        : "NOT THIS TIME";

  return (
    <section
      className={`feedback-panel tier-${result.tier} outcome-${outcome}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="sr-only">{kicker}</p>
      <h1 id="feedback-title">{heading}</h1>
      <p className="feedback-quip">{result.quip}</p>
      <div className="feedback-stats">
        <span>
          {penaltyPoints > 0 ? <><b>{penaltyPoints}</b> PT PENALTY</> : <><b>+{result.score}</b> PTS</>}
        </span>
        <span><b>{score}</b> TOTAL</span>
        <span><b>{depthMetres}m</b> DEPTH</span>
      </div>
      <button
        ref={continueRef}
        className="continue-button"
        type="button"
        onClick={onContinue}
      >
        {isLastRound ? "SURFACE WITH SCORE" : "CONTINUE DESCENT"}
      </button>
    </section>
  );
}
