"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useGameLoop } from "../../hooks/useGameLoop";
import type { Category } from "../../lib/questions/types";
import { AppStateProvider } from "../../state/AppStateProvider";
import { OceanBackdrop } from "./OceanBackdrop";
import { SpeedBackdrop } from "./SpeedBackdrop";
import { SurvivalBackdrop } from "./SurvivalBackdrop";
import { DiveForm } from "./DiveForm";
import { FeedbackPanel } from "./FeedbackPanel";
import { GameHud, getWindowLabel } from "./GameHud";
import { GameSummary } from "./GameSummary";
import {
  answerSecondsForMode,
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

const SPEED_RULES = [
  "Ten prompts. Eight seconds each. No room to hesitate.",
  "Consecutive correct answers build a streak multiplier.",
  "3 in a row = 2× points. 5 in a row = 3× points.",
  "A miss, pass, or timeout resets your streak to zero.",
  "The atlas still recognizes answer families. Speed rewards instinct.",
  "Chase the highest multiplied score across runs.",
] as const;

const SURVIVAL_RULES = [
  "You start with three lives. Every miss costs one.",
  "When your lives run out, the run ends immediately.",
  "15 seconds per prompt from a pool of 30 questions.",
  "Recognized answers keep you alive and add to your score.",
  "Uncharted answers, passes, and timeouts all cost a life.",
  "How deep can you go before the signal fades?",
] as const;

const MODE_OPTIONS: readonly Readonly<{
  mode: GameMode;
  label: string;
  detail: string;
}>[] = [
  { mode: "daily", label: "DAILY", detail: "7 PROMPTS / 1 RUN" },
  { mode: "unlimited", label: "UNLIMITED", detail: "15 PROMPTS / ∞ RUNS" },
  { mode: "speed", label: "SPEED", detail: "10 PROMPTS / 8 SEC" },
  { mode: "survival", label: "SURVIVAL", detail: "3 LIVES / 30 PROMPTS" },
];

export function GameExperience(props: GameExperienceProps) {
  const [activeMode, setActiveMode] = useState<GameMode>(props.mode);
  const router = useRouter();

  const selectMode = useCallback(
    (nextMode: GameMode) => {
      setActiveMode(nextMode);
      const routes: Record<GameMode, string> = {
        daily: "/",
        unlimited: "/unlimited/classic",
        speed: "/speed-run",
        survival: "/survival",
      };
      router.replace(routes[nextMode]);
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
    skipPreview,
    sfx,
  } = useGameLoop(mode, category);

  useEffect(() => {
    const base = "OMNIQUIZ";
    let suffix = "";
    if (state.phase === "answering" || state.phase === "submitting" || state.phase === "preview") {
      suffix = ` — Round ${state.questionIndex + 1}/${state.questions.length}`;
    } else if (state.phase === "feedback") {
      suffix = ` — ${state.score} pts · ${state.depthMetres}m`;
    } else if (state.phase === "summary") {
      suffix = ` — Dive Complete`;
    }
    document.title = base + suffix;
    return () => { document.title = "OMNIQUIZ — Dive Control"; };
  }, [state.phase, state.questionIndex, state.questions.length, state.score, state.depthMetres]);

  useEffect(() => {
    if (state.phase !== "preview") return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter" || event.key === "Escape") {
        event.preventDefault();
        skipPreview();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, skipPreview]);

  const question = getCurrentQuestion(state);
  const titles: Record<GameMode, string> = {
    daily: "THE DAILY DIVE",
    unlimited: "THE ARCADE DIVE",
    speed: "SPEED RUN",
    survival: "SURVIVAL MODE",
  };
  const descriptions: Record<GameMode, string> = {
    daily: "7 prompts · 15 seconds each · rarer recognizable answers sink deeper",
    unlimited: "15 prompts · repeatable crowd-rarity expeditions",
    speed: "10 prompts · 8 seconds each · streak multipliers reward momentum",
    survival: "3 lives · 30 prompts · every miss brings you closer to the end",
  };
  const title = titles[mode];
  const description = descriptions[mode];
  const isLastRound = mode === "survival"
    ? state.questionIndex + 1 >= state.questions.length || state.lives <= 0
    : state.questionIndex + 1 >= state.questions.length;
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
  const rulesMap: Record<GameMode, readonly string[]> = {
    daily: DAILY_RULES,
    unlimited: ARCADE_RULES,
    speed: SPEED_RULES,
    survival: SURVIVAL_RULES,
  };
  const rules = rulesMap[mode];
  const diveLabel = mode === "speed"
    ? dayLabel ? `SPEED / UTC DAY ${dayLabel}` : "SPEED RUN #1"
    : mode === "survival"
      ? dayLabel ? `SURVIVAL / UTC DAY ${dayLabel}` : "SURVIVAL RUN #1"
      : mode === "unlimited"
        ? dayLabel ? `ARCADE / UTC DAY ${dayLabel}` : "ARCADE RUN #1"
        : dailyLabel ?? (dayLabel ? `DIVE #${dayLabel}` : "TODAY'S DIVE");

  const handleShare = useCallback(async () => {
    const modeNames: Record<GameMode, string> = { daily: "daily", unlimited: "arcade", speed: "speed run", survival: "survival" };
    const shareText = `OMNIQUIZ ${modeNames[mode]}: ${state.score} points, ${state.depthMetres}m deep.`;
    const flash = (label: string) => {
      setShareLabel(label);
      window.setTimeout(() => setShareLabel("SHARE DIVE LOG"), 1_800);
    };
    const canShare =
      typeof navigator !== "undefined" && typeof navigator.share === "function";
    const canCopy =
      typeof navigator !== "undefined" &&
      !!navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function";

    if (canShare) {
      try {
        await navigator.share({ title: "OMNIQUIZ", text: shareText });
        flash("LOG SHARED");
      } catch (error) {
        // A dismissed native share sheet is a cancellation, not a failure.
        if (error && typeof error === "object" && (error as { name?: string }).name === "AbortError") {
          setShareLabel("SHARE DIVE LOG");
        } else {
          flash("SHARE UNAVAILABLE");
        }
      }
      return;
    }

    if (canCopy) {
      try {
        await navigator.clipboard.writeText(shareText);
        flash("LOG COPIED");
      } catch {
        flash("SHARE UNAVAILABLE");
      }
      return;
    }

    flash("SHARE UNAVAILABLE");
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
      <a className="skip-to-content sr-only" href="#main-stage">Skip to content</a>
      {mode === "speed" ? (
        <SpeedBackdrop
          score={state.score}
          streak={state.streak}
          streakMultiplier={state.streakMultiplier}
        />
      ) : mode === "survival" ? (
        <SurvivalBackdrop
          lives={state.lives}
          score={state.score}
        />
      ) : (
        <OceanBackdrop
          depthMetres={state.depthMetres}
          mode={mode}
          descentMetres={descentMetres}
          descentEventKey={descentEventKey}
        />
      )}

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
        <main id="main-stage" className="landing-layer" aria-labelledby="brand-title">
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
              <span className="mode-selector-label">SELECT A MODE</span>
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
              {state.phase === "loading" ? "LOADING QUESTIONS" : state.phase === "error" ? "RETRY" : mode === "speed" ? "START THE CLOCK" : mode === "survival" ? "ENTER THE ABYSS" : "BEGIN DESCENT"}
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
        <main id="main-stage" className="summary-layer" aria-live="polite">
          <GameSummary
            score={state.score}
            depthMetres={state.depthMetres}
            mode={mode}
            stats={stats}
            roundLog={state.roundLog}
            shareLabel={shareLabel}
            lives={state.lives}
            bestStreak={Math.max(state.streak, ...state.roundLog.reduce<number[]>((acc, entry) => {
              const last = acc.length > 0 ? acc[acc.length - 1] : 0;
              acc.push(entry.outcome === "answer" && entry.score > 0 ? last + 1 : 0);
              return acc;
            }, []))}
            onReplay={() => {
              sfx.click();
              void startDive();
            }}
            onShare={() => {
              sfx.click();
              void handleShare();
            }}
          />
        </main>
      ) : (
        <main
          id="main-stage"
          className="game-layer"
          aria-labelledby={feedbackResult ? "feedback-title" : "current-prompt"}
        >
          <div className="feed-plate" aria-hidden="true">CAM 01 · ROV FEED</div>
          <div className="timecode-plate telemetry-data" aria-hidden="true">
            {getWindowLabel(state.phase, remainingMilliseconds)}
          </div>
          <GameHud state={state} mode={mode} remainingMilliseconds={remainingMilliseconds} />
          {mode === "speed" && state.streak > 0 ? (
            <div className="streak-indicator" aria-live="polite">
              <span className="streak-count telemetry-data">{state.streak}× STREAK</span>
              {state.streakMultiplier > 1 ? (
                <span className="streak-multiplier telemetry-data">{state.streakMultiplier}× POINTS</span>
              ) : null}
            </div>
          ) : null}
          {mode === "survival" ? (
            <div className="lives-indicator" aria-live="polite" aria-label={`${state.lives} lives remaining`}>
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={`life-pip ${i < state.lives ? "is-alive" : "is-lost"}`} aria-hidden="true" />
              ))}
              <span className="lives-label telemetry-data">{state.lives} {state.lives === 1 ? "LIFE" : "LIVES"}</span>
            </div>
          ) : null}
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
            <p className="preview-footer" aria-live="polite">
              descending · the clock starts in {state.previewSeconds}
              <button className="preview-skip" type="button" onClick={skipPreview}>SKIP</button>
            </p>
          ) : null}

          {question && state.phase === "answering" ? (
            <p className="live-prompt-announcement sr-only" aria-live="polite">
              {question.prompt}. You have {answerSecondsForMode(mode)} seconds.
            </p>
          ) : null}
        </main>
      )}
    </div>
  );
}
