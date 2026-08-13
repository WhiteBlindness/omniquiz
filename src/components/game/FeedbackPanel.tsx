import { useEffect, useRef } from "react";

import type { SubmissionResult } from "../../lib/game/scoring";
import type { GameOutcome } from "./gameReducer";

type FeedbackPanelProps = Readonly<{
  result: SubmissionResult;
  submittedAnswer: string;
  score: number;
  depthMetres: number;
  isLastRound: boolean;
  onContinue: () => void;
  outcome?: GameOutcome;
}>;

const TIER_LABELS: Record<SubmissionResult["tier"], string> = {
  uncharted: "UNCHARTED",
  plankton: "PLANKTON",
  tooclever: "TOO CLEVER",
  schooler: "SCHOOLER",
  rare: "RARE CATCH",
  deepcut: "DEEP CUT",
  krillion: "ONE IN A KRILLION",
};

export function FeedbackPanel({
  result,
  submittedAnswer,
  score,
  depthMetres,
  isLastRound,
  onContinue,
  outcome = "answer",
}: FeedbackPanelProps) {
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  const heading =
    outcome === "pass"
      ? "PASS LOGGED"
      : outcome === "timeout"
        ? "TIME EXPIRED"
        : TIER_LABELS[result.tier];
  const submittedLabel = submittedAnswer.trim() || (outcome === "pass" ? "No answer" : "No signal");

  return (
    <section
      className={`feedback-panel tier-${result.tier} outcome-${outcome}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="sr-only">Answer reveal</p>
      <h1 id="feedback-title">{heading}</h1>
      <p className="feedback-answer">
        <span>YOUR SIGNAL</span>
        <strong>{submittedLabel}</strong>
        {result.recognized ? <small>ATLAS LABEL / {result.answerLabel}</small> : null}
      </p>
      <p className="feedback-quip">{result.quip}</p>
      <div className="feedback-stats">
        <span>
          <b>{result.crowdShare === null ? "--" : `${result.crowdShare}%`}</b>
          {result.crowdShare === null ? "SHARE" : "OF THE CROWD"}
        </span>
        <span><b>+{result.score}</b> POINTS</span>
        <span><b>{score}</b> TOTAL / {depthMetres}m</span>
      </div>
      {result.commonAnswers.length > 0 ? (
        <div className="common-answers" aria-label="Common answers from this prompt">
          <span className="common-answers-title">COMMON SIGNALS</span>
          {result.commonAnswers.map((answer) => (
            <span className="common-answer" key={answer.label}>
              <b>{answer.label}</b><small>{answer.share}%</small>
            </span>
          ))}
        </div>
      ) : (
        <p className="common-answers-empty">No atlas match logged; the dive continues.</p>
      )}
      <button ref={continueRef} className="continue-button" type="button" onClick={onContinue}>
        {isLastRound ? "SURFACE WITH LOG" : "CONTINUE DESCENT"}
      </button>
    </section>
  );
}
