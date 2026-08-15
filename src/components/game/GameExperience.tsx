"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useGameLoop } from "../../hooks/useGameLoop";
import type { Category } from "../../lib/questions/types";
import { AppStateProvider } from "../../state/AppStateProvider";
import { OceanBackdrop } from "./OceanBackdrop";
import { DiveForm } from "./DiveForm";
import { FeedbackPanel } from "./FeedbackPanel";
import { GameHud, getWindowLabel } from "./GameHud";
import { GameSummary } from "./GameSummary";
import {
  getCurrentQuestion,
  type GameMode,
} from "./gameReducer";
import { PromptCard } from "./PromptCard";
import { SoundControl } from "./SoundControl";
import { ThemeControl } from "./ThemeControl";

type GameExperienceProps = Readonly<{
  mode: GameMode;
  category?: Category;
  dailyLabel?: string;
}>;

type GameSessionProps = GameExperienceProps & Readonly<{
  onModeChange: (mode: GameMode) => void;
}>;

const DAILY_RULES = [
  "Seven prompts a day. Same for everyone.",
  "15 seconds to name one honest thing.",
  "The atlas recognizes answer families, not one fixed fact.",
  "Crowd share maps to rarity, points, and depth.",
  "Pass, timeout, or an uncharted answer scores zero and keeps the dive moving.",
  "Every point sinks you 10 metres. Surface with a full dive log.",
] as const;

const ARCADE_RULES = [
  "Fifteen prompts. Every run reaches the surface.",
  "15 seconds to name one honest thing.",
  "The atlas recognizes many reasonable answer families.",
  "Crowd share maps to rarity, points, and depth.",
  "Pass, timeout, or an uncharted answer scores zero and keeps the dive moving.",
  "Replay to chart a different route through the crowd.",
] as const;

const MODE_OPTIONS: readonly Readonly<{
  mode: GameMode;
  label: string;
  detail: string;
}>[] = [
  { mode: "daily", label: "DAILY", detail: "7 PROMPTS / 1 RUN" },
  { mode: "unlimited", label: "UNLIMITED", detail: "15 PROMPTS / FULL RUN" },
];

export function GameExperience(props: GameExperienceProps) {
  const [activeMode, setActiveMode] = useState<GameMode>(props.mode);
  const router = useRouter();

  const selectMode = useCallback(
    (nextMode: GameMode) => {
      setActiveMode(nextMode);
      router.replace(nextMode === "unlimited" ? "/unlimited/classic" : "/");
    },
    [router],
  );

  return (
    <AppStateProvider>
      <GameSession
        key={`${activeMode}-${props.category ?? "all"}`}
        {...props}
        mode={activeMode}
        onModeChange={selectMode}
      />
    </AppStateProvider>
  );
}

function GameSession({ mode, category, dailyLabel, onModeChange }: GameSessionProps) {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState("SHARE DIVE LOG");
  const {
    state,
    stats,
    remainingMilliseconds,
    dayLabel,
    theme,
    muted,
    toggleMute,
    toggleTheme,
    startDive,
    submitAnswer,
    passQuestion,
    setAnswer,
    continueDive,
    sfx,
  } = useGameLoop(mode, category);

  const question = getCurrentQuestion(state);
  const title = mode === "unlimited" ? "THE ARCADE DIVE" : "THE DAILY DIVE";
  const description = mode === "unlimited"
    ? "15 prompts · repeatable crowd-rarity expeditions"
    : "7 prompts · 15 seconds each · rarer recognizable answers sink deeper";
  const isLastRound = state.questionIndex + 1 >= state.questions.length;
  const feedbackResult = state.phase === "feedback" ? state.lastResult : null;
  const descentMetres =
    feedbackResult &&
    state.lastOutcome === "answer" &&
    feedbackResult.recognized &&
    feedbackResult.depthMetres > 0
      ? feedbackResult.depthMetres
      : 0;
  const descentEventKey = descentMetres > 0
    ? `${state.questionIndex}-${state.depthMetres}-${descentMetres}`
    : undefined;
  const rules = mode === "unlimited" ? ARCADE_RULES : DAILY_RULES;
  const diveLabel = mode === "unlimited"
    ? dayLabel ? `ARCADE / UTC DAY ${dayLabel}` : "ARCADE RUN #1"
    : dailyLabel ?? (dayLabel ? `DIVE #${dayLabel}` : "TODAY'S DIVE");

  const handleShare = useCallback(async () => {
    const shareText = `OMNIQUIZ ${mode === "unlimited" ? "arcade" : "daily"} dive: ${state.score} points, ${state.depthMetres}m deep.`;
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

  const handleModeChange = useCallback(
    (nextMode: GameMode) => {
      if (nextMode === mode) return;
      sfx.click();
      onModeChange(nextMode);
    },
    [mode, onModeChange, sfx],
  );

  return (
    <div
      className={`game-shell phase-${state.phase} mode-${mode}`}
      data-phase={state.phase}
      data-theme={theme}
    >
      <OceanBackdrop
        depthMetres={state.depthMetres}
        mode={mode}
        descentMetres={descentMetres}
        descentEventKey={descentEventKey}
      />

      <aside className="global-controls" aria-label="Display and sound controls">
        <ThemeControl
          theme={theme}
          onToggle={() => {
            sfx.click();
            toggleTheme();
          }}
        />
        <SoundControl
          muted={muted}
          onToggle={() => {
            sfx.click();
            toggleMute();
          }}
        />
      </aside>

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

            <div className="mode-selector" role="group" aria-label="Select game mode">
              <span className="mode-selector-label">SELECT A DIVE MODE</span>
              <div className="mode-selector-options">
                {MODE_OPTIONS.map((option) => (
                  <button
                    key={option.mode}
                    className={`mode-option ${mode === option.mode ? "is-selected" : ""}`}
                    type="button"
                    aria-label={`${option.label} mode`}
                    aria-pressed={mode === option.mode}
                    onClick={() => handleModeChange(option.mode)}
                  >
                    <span>{option.label}</span>
                    <small>{option.detail}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className={`tutorial-console ${tutorialOpen ? "is-open" : ""}`}>
              <button
                className="tutorial-toggle"
                type="button"
                aria-expanded={tutorialOpen}
                aria-controls="tutorial-rules"
                onClick={() => {
                  sfx.click();
                  setTutorialOpen((open) => !open);
                }}
              >
                <span className="pixel-chevron" aria-hidden="true" /> HOW TO PLAY
              </button>
              {tutorialOpen ? (
                <ul className="tutorial-rules" id="tutorial-rules">
                  {rules.map((rule) => <li key={rule}>{rule}</li>)}
                </ul>
              ) : null}
            </div>

            <button
              className="begin-button"
              type="button"
              onClick={() => {
                sfx.click();
                void startDive();
              }}
              disabled={state.phase === "loading"}
            >
              <span className="pixel-descent-mark" aria-hidden="true" />
              {state.phase === "loading" ? "LOADING QUESTIONS" : state.phase === "error" ? "RETRY DESCENT" : "BEGIN DESCENT"}
              <span className="pixel-descent-mark" aria-hidden="true" />
            </button>

            <div className="launch-rail">
              <span>{diveLabel}</span>
              <nav aria-label="Other dives">
                <Link href="/packs">THEMED PACKS</Link>
                <Link href={mode === "daily" ? "/unlimited/classic" : "/"}>
                  {mode === "daily" ? "ARCADE ∞" : "TODAY'S DIVE"}
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
            roundLog={state.roundLog}
            onReplay={() => {
              sfx.click();
              void startDive();
            }}
          />
          <button
            className="share-button pixel-control"
            type="button"
            onClick={() => {
              sfx.click();
              void handleShare();
            }}
          >
            {shareLabel}
          </button>
        </main>
      ) : (
        <main
          className="game-layer"
          aria-labelledby={feedbackResult ? "feedback-title" : "current-prompt"}
        >
          <div className="feed-plate" aria-hidden="true">CAM 01 · ROV FEED</div>
          <div className="timecode-plate telemetry-data" aria-hidden="true">
            {getWindowLabel(state.phase, remainingMilliseconds)}
          </div>
          <GameHud state={state} mode={mode} remainingMilliseconds={remainingMilliseconds} />
          <div className="prompt-zone">
            {feedbackResult ? (
              <FeedbackPanel
                result={feedbackResult}
                submittedAnswer={state.answer}
                score={state.score}
                depthMetres={state.depthMetres}
                isLastRound={isLastRound}
                outcome={state.lastOutcome ?? "answer"}
                onContinue={() => {
                  sfx.click();
                  continueDive();
                }}
              />
            ) : (
              <PromptCard state={state} phase={state.phase} />
            )}
          </div>

          {state.phase === "answering" || state.phase === "submitting" ? (
            <DiveForm
              state={state}
              onAnswer={setAnswer}
              onSubmit={() => {
                void submitAnswer();
              }}
              onPass={passQuestion}
              remainingMilliseconds={remainingMilliseconds}
            />
          ) : null}

          {state.phase === "preview" ? (
            <p className="preview-footer" aria-live="polite">descending · the clock starts in {state.previewSeconds}</p>
          ) : null}

          {question && state.phase === "answering" ? (
            <p className="live-prompt-announcement sr-only" aria-live="polite">
              {question.prompt}. You have 15 seconds.
            </p>
          ) : null}
        </main>
      )}
    </div>
  );
}
