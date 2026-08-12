"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { useGameLoop } from "../../hooks/useGameLoop";
import type { Category } from "../../lib/questions/types";
import { OceanBackdrop } from "./OceanBackdrop";
import { DiveForm } from "./DiveForm";
import { FeedbackPanel } from "./FeedbackPanel";
import { GameHud } from "./GameHud";
import { GameSummary } from "./GameSummary";
import { getCurrentQuestion, type GameMode } from "./gameReducer";
import { PromptCard } from "./PromptCard";
import { SoundControl } from "./SoundControl";

type GameExperienceProps = Readonly<{
  mode: GameMode;
  category?: Category;
}>;

const RULES = [
  "Seven prompts a day. Same for everyone.",
  "15 seconds to name one thing.",
  "Rare answers score big. Obvious ones float.",
  "The pick that feels clever? The school thought of it too.",
  "Every point sinks you 10 metres. 700 is the trench.",
  "One dive per day. No second chances.",
] as const;

export function GameExperience({ mode, category }: GameExperienceProps) {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState("SHARE DIVE LOG");
  const {
    state,
    stats,
    muted,
    toggleMute,
    startDive,
    submitAnswer,
    setAnswer,
    continueDive,
  } = useGameLoop(mode, category);

  const question = getCurrentQuestion(state);
  const title = mode === "unlimited" ? "THE ENDLESS DIVE" : "THE DAILY DIVE";
  const description = mode === "unlimited"
    ? "dive after dive · rarer answers sink deeper"
    : "7 prompts · 15 seconds each · rarer answers sink deeper";
  const isLastRound = state.questionIndex + 1 >= state.questions.length;

  const handleShare = useCallback(async () => {
    const shareText = `OMNIQUIZ ${mode === "unlimited" ? "endless" : "daily"} dive: ${state.score} points, ${state.depthMetres}m deep.`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "OMNIQUIZ", text: shareText });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
      }
      setShareLabel("LOG COPIED");
      window.setTimeout(() => setShareLabel("SHARE DIVE LOG"), 1_800);
    } catch {
      setShareLabel("SHARE UNAVAILABLE");
      window.setTimeout(() => setShareLabel("SHARE DIVE LOG"), 1_800);
    }
  }, [mode, state.depthMetres, state.score]);

  return (
    <div className={`game-shell phase-${state.phase} mode-${mode}`} data-phase={state.phase}>
      {/* Visual contract: retro pixel ocean, centered title/boat/waterline, submerged fixed CTA, HUD/game loop, OMNIQUIZ brand. */}
      <OceanBackdrop depthMetres={state.depthMetres} mode={mode} />
      <SoundControl muted={muted} onToggle={toggleMute} />

      {state.phase === "intro" || state.phase === "loading" || state.phase === "error" ? (
        <main className="landing-layer" aria-labelledby="brand-title">
          <div className="brand-stage">
            <h1 className="chromatic-title" id="brand-title" data-text="OMNIQUIZ">OMNIQUIZ</h1>
            <p className="mode-title">{title}</p>
            <p className="mode-description">{description}</p>
          </div>

          <div className="landing-console">
            {state.phase === "error" ? (
              <div className="signal-error" role="alert">
                <span>SIGNAL LOST</span>
                <p>{state.error}</p>
              </div>
            ) : null}

            <div className={`tutorial-console ${tutorialOpen ? "is-open" : ""}`}>
              <button
                className="tutorial-toggle"
                type="button"
                aria-expanded={tutorialOpen}
                aria-controls="tutorial-rules"
                onClick={() => setTutorialOpen((open) => !open)}
              >
                <span aria-hidden="true">▸</span> HOW TO PLAY
              </button>
              {tutorialOpen ? (
                <ul className="tutorial-rules" id="tutorial-rules">
                  {RULES.map((rule) => <li key={rule}>{rule}</li>)}
                </ul>
              ) : null}
            </div>

            <button
              className="begin-button"
              type="button"
              onClick={() => { void startDive(); }}
              disabled={state.phase === "loading"}
            >
              <span aria-hidden="true">▼</span>
              {state.phase === "loading" ? "LOADING QUESTIONS" : state.phase === "error" ? "RETRY DESCENT" : "BEGIN DESCENT"}
              <span aria-hidden="true">▼</span>
            </button>

            <div className="launch-rail">
              <span>{mode === "unlimited" ? "ENDLESS DIVE #1" : "DIVE #25"}</span>
              <nav aria-label="Other dives">
                {mode === "daily" ? <Link href="/packs">THEMED PACKS</Link> : <Link href="/packs">THEMED PACKS</Link>}
                <Link href={mode === "daily" ? "/unlimited/classic" : "/"}>
                  {mode === "daily" ? "UNLIMITED ∞" : "TODAY'S DIVE"}
                </Link>
              </nav>
            </div>
          </div>
        </main>
      ) : state.phase === "summary" ? (
        <main className="summary-layer" aria-live="polite">
          <GameSummary
            score={state.score}
            depthMetres={state.depthMetres}
            mode={mode}
            stats={stats}
            onReplay={() => { void startDive(); }}
          />
          <button className="share-button pixel-control" type="button" onClick={() => { void handleShare(); }}>
            {shareLabel}
          </button>
        </main>
      ) : (
        <main className="game-layer" aria-labelledby="current-prompt">
          <GameHud state={state} mode={mode} />
          <div className="game-title-echo" aria-hidden="true">{title}</div>
          <div className="prompt-zone">
            <PromptCard state={state} phase={state.phase} />
          </div>

          {state.phase === "answering" || state.phase === "submitting" ? (
            <DiveForm
              state={state}
              onAnswer={setAnswer}
              onSubmit={() => { void submitAnswer(); }}
            />
          ) : null}

          {state.phase === "feedback" && state.lastResult ? (
            <FeedbackPanel
              result={state.lastResult}
              score={state.score}
              depthMetres={state.depthMetres}
              isLastRound={isLastRound}
              onContinue={continueDive}
            />
          ) : null}

          {state.phase === "preview" ? (
            <p className="preview-footer" aria-live="polite">descending · the clock starts in {state.previewSeconds}</p>
          ) : null}

          {question && state.phase === "answering" ? (
            <p className="live-prompt-announcement sr-only" aria-live="polite">
              {question.prompt}. {state.remainingSeconds} seconds remaining.
            </p>
          ) : null}
        </main>
      )}
    </div>
  );
}
