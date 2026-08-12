import type { SubmissionResult } from "../../lib/game/scoring";

type FeedbackPanelProps = Readonly<{
  result: SubmissionResult;
  score: number;
  depthMetres: number;
  isLastRound: boolean;
  onContinue: () => void;
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
  onContinue,
}: FeedbackPanelProps) {
  return (
    <section className={`feedback-panel tier-${result.tier}`} role="status" aria-live="polite">
      <p className="feedback-kicker">ANSWER LOGGED</p>
      <h1>{result.accepted ? TIER_LABELS[result.tier] : "NOT THIS TIME"}</h1>
      <p className="feedback-quip">{result.quip}</p>
      <div className="feedback-stats">
        <span><b>+{result.score}</b> PTS</span>
        <span><b>{score}</b> TOTAL</span>
        <span><b>{depthMetres}m</b> DEPTH</span>
      </div>
      <button className="continue-button" type="button" onClick={onContinue}>
        {isLastRound ? "SURFACE WITH SCORE" : "CONTINUE DESCENT"}
      </button>
    </section>
  );
}
