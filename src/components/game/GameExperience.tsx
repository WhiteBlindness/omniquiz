"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useGameLoop } from "../../hooks/useGameLoop";
import { rarityForCrowdShare } from "../../lib/game/scoring";
import {
  ENVIRONMENTS,
  isLiveEnvironment,
  routeProgress,
  stageIndexFor,
} from "../../lib/packs/environment";
import { PACK_LIST, PACKS, packHref, type PackId } from "../../lib/packs/meta";
import type { Category } from "../../lib/questions/types";
import { AppStateProvider } from "../../state/AppStateProvider";
import { EnvironmentProvider, useEnvironment } from "./EnvironmentContext";
import { ExitConfirm } from "./ExitConfirm";
import { PackBackdrop } from "./PackBackdrop";
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
import { LastRunBadge } from "./LastRunBadge";
import { SoundControl } from "./SoundControl";
import { ThemeControl } from "./ThemeControl";
import { SiteFooter } from "../SiteFooter";
import { WorldCard } from "../WorldCards";

type GameExperienceProps = Readonly<{
  mode: GameMode;
  category?: Category;
  pack?: PackId;
  dailyLabel?: string;
}>;

type GameSessionProps = GameExperienceProps & Readonly<{
  onModeChange: (mode: GameMode) => void;
  onGoHome: () => void;
  offerResume: boolean;
}>;

const ATLAS_NOTE = "Atlas shares are curated estimates for gameplay, not live poll results.";

/** One representative share per tier; points come from the scoring function, never from copy. */
export const RARITY_SCALE = [
  { tier: "common", share: 30 },
  { tier: "familiar", share: 18 },
  { tier: "notable", share: 10 },
  { tier: "rare", share: 5 },
  { tier: "obscure", share: 2 },
  { tier: "unique", share: 1 },
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
  const pack = props.pack ?? "core";
  const [resetKey, setResetKey] = useState(0);
  const [offerResume, setOfferResume] = useState(false);
  const environmentId = PACKS[pack].environment;
  const environment = ENVIRONMENTS[isLiveEnvironment(environmentId) ? environmentId : "ocean"];

  const goHome = useCallback(() => {
    if (pack === "core" && activeMode === "daily") {
      setOfferResume(true);
      setResetKey((key) => key + 1);
      return;
    }
    router.push("/");
  }, [activeMode, pack, router]);

  const selectMode = useCallback(
    (nextMode: GameMode) => {
      setActiveMode(nextMode);
      router.replace(packHref(pack, nextMode));
    },
    [pack, router],
  );

  return (
    <AppStateProvider>
      <EnvironmentProvider environment={environment}>
        <GameSession
          key={`${pack}-${activeMode}-${props.category ?? "all"}-${resetKey}`}
          {...props}
          mode={activeMode}
          onModeChange={selectMode}
          onGoHome={goHome}
          offerResume={offerResume}
        />
      </EnvironmentProvider>
    </AppStateProvider>
  );
}

function GameSession({
  mode,
  category,
  pack = "core",
  dailyLabel,
  onModeChange,
  onGoHome,
  offerResume,
}: GameSessionProps) {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [exitOpenAt, setExitOpenAt] = useState<number | null>(null);
  const exitTriggerRef = useRef<HTMLElement | null>(null);
  const environment = useEnvironment();
  const lex = environment.lexicon;
  const packMeta = PACKS[pack];
  const isPack = pack !== "core";
  const modeOptions = MODE_OPTIONS.filter((option) => packMeta.modes.includes(option.mode));
  const shareLogName = lex.logName[mode];
  const [shareLabel, setShareLabel] = useState(`SHARE ${shareLogName}`);
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
    savedRun,
    resumeSavedRun,
  } = useGameLoop(mode, category, pack, { autoRestore: !offerResume });

  useEffect(() => {
    const base = "OMNIQUIZ";
    let suffix = "";
    if (state.phase === "answering" || state.phase === "submitting" || state.phase === "preview") {
      suffix = ` — Round ${state.questionIndex + 1}/${state.questions.length}`;
    } else if (state.phase === "feedback") {
      suffix = ` — ${state.score} pts${lex.travel ? ` · ${state.depthMetres}m` : ""}`;
    } else if (state.phase === "summary") {
      suffix = ` — ${lex.summaryTitle[mode].toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase())}`;
    }
    document.title = base + suffix;
    return () => {
      document.title = isPack
        ? `OMNIQUIZ — ${packMeta.title}`
        : mode === "speed"
          ? "OMNIQUIZ — Race Control"
          : mode === "survival"
            ? "OMNIQUIZ — Hazard Control"
            : "OMNIQUIZ — Dive Control";
    };
  }, [isPack, lex, mode, packMeta.title, state.phase, state.questionIndex, state.questions.length, state.score, state.depthMetres]);

  useEffect(() => {
    if (state.phase !== "preview" || exitOpenAt !== null) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter" || event.key === "Escape") {
        event.preventDefault();
        skipPreview();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, skipPreview, exitOpenAt]);

  const question = getCurrentQuestion(state);
  const title = isPack ? `${packMeta.title} / ${lex.modeTitle[mode]}` : lex.modeTitle[mode];
  const description = lex.modeDescription[mode];
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
  const rules = [
    ...(isPack ? [`Every prompt in this run comes from the ${packMeta.shortName} pack.`] : []),
    ...lex.rules[mode],
    ATLAS_NOTE,
  ];
  const route = routeProgress(state.phase, state.questionIndex, state.questions.length);
  const stages = environment.stages;
  const stageIndex = stages ? stageIndexFor(stages, route) : 0;
  const stage = stages ? stages[stageIndex] : undefined;
  const stageName = stage?.label;
  const isRunPhase =
    state.phase === "preview" || state.phase === "answering" || state.phase === "submitting";
  const requestExit = useCallback(() => {
    if (isRunPhase) {
      exitTriggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setExitOpenAt(state.questionIndex);
    } else {
      onGoHome();
    }
  }, [isRunPhase, onGoHome, state.questionIndex]);
  const closeExit = useCallback(() => {
    setExitOpenAt(null);
    const trigger = exitTriggerRef.current;
    exitTriggerRef.current = null;
    window.setTimeout(() => trigger?.focus(), 0);
  }, []);
  const exitAllowed = exitOpenAt === state.questionIndex && isRunPhase;
  const diveLabel = mode === "speed"
    ? dayLabel ? `SPEED / UTC DAY ${dayLabel}` : "SPEED RUN #1"
    : mode === "survival"
      ? dayLabel ? `SURVIVAL / UTC DAY ${dayLabel}` : "SURVIVAL RUN #1"
      : mode === "unlimited"
        ? dayLabel ? `ARCADE / UTC DAY ${dayLabel}` : "ARCADE RUN #1"
        : dailyLabel ?? (dayLabel ? `EXPEDITION #${dayLabel}` : "TODAY'S EXPEDITION");

  const handleShare = useCallback(async () => {
    const tierSquare: Record<string, string> = {
      unique: "\u{1f7e7}",
      obscure: "\u{1f7e8}",
      rare: "\u{1f7e9}",
      notable: "\u{1f7e6}",
      common: "⬜",
      familiar: "\u{1f7ea}",
      uncharted: "⬛",
    };
    const modeEmoji: Record<GameMode, string> = environment.id === "cinema"
      ? { daily: "\u{1f3ac}", unlimited: "\u{1f3ac}", speed: "⚡", survival: "\u{1f480}" }
      : { daily: "\u{1f30a}", unlimited: "♾️", speed: "⚡", survival: "\u{1f480}" };
    const grid = state.roundLog
      .map((r) => r.outcome === "pass" || r.outcome === "timeout" ? "⬛" : (tierSquare[r.tier] ?? "⬛"))
      .join("");
    const recognized = state.roundLog.filter((r) => r.outcome === "answer" && r.tier !== "uncharted").length;
    const isPB = state.score > 0 && state.score >= stats.bestScore && stats.runs > 1;
    const scoreLine = `${state.score} pts${lex.travel ? ` · ${state.depthMetres}m` : ""} · ${recognized}/${state.roundLog.length} recognized`;
    const lines = [
      `OMNIQUIZ ${modeEmoji[mode]} ${isPack ? `${packMeta.title} / ` : ""}${diveLabel}`,
      isPB ? `${scoreLine} \u{1f3c6} PB!` : scoreLine,
      grid,
    ];
    if (mode === "daily" && stats.dailyStreak > 1) {
      lines.push(`\u{1f525} ${stats.dailyStreak}-day streak`);
    }
    if (mode === "speed") {
      const best = Math.max(state.streak, ...state.roundLog.reduce<number[]>((acc, entry) => {
        const last = acc.length > 0 ? acc[acc.length - 1] : 0;
        acc.push(entry.outcome === "answer" && entry.score > 0 ? last + 1 : 0);
        return acc;
      }, []));
      if (best > 0) lines.push(`\u{1f525} Best streak: ${best}`);
    }
    if (mode === "survival") lines.push(`❤️ ${state.lives} lives remaining`);
    lines.push("omniquiz.com");
    const shareText = lines.join("\n");

    const flash = (label: string) => {
      setShareLabel(label);
      window.setTimeout(() => setShareLabel(`SHARE ${shareLogName}`), 1_800);
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
        if (error && typeof error === "object" && (error as { name?: string }).name === "AbortError") {
          setShareLabel(`SHARE ${shareLogName}`);
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
  }, [mode, isPack, environment.id, lex.travel, packMeta.title, state.depthMetres, state.score, state.roundLog, state.streak, state.lives, stats, diveLabel, shareLogName]);

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
      className={`game-shell phase-${state.phase} mode-${environment.id === "ocean" ? mode : environment.id}`}
      data-phase={state.phase}
      data-theme={theme}
      data-environment={environment.id}
      data-stage={stages ? stages[stageIndex].id : undefined}
    >
      <nav aria-label="Skip links">
        <a className="skip-to-content sr-only" href="#main-stage">Skip to content</a>
      </nav>
      <PackBackdrop
        environment={environment.id}
        mode={mode}
        phase={state.phase}
        depthMetres={state.depthMetres}
        descentMetres={descentMetres}
        descentEventKey={descentEventKey}
        score={state.score}
        streak={state.streak}
        streakMultiplier={state.streakMultiplier}
        lives={state.lives}
        route={route}
        stageIndex={stageIndex}
        stageCount={stages?.length ?? 0}
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
        <main id="main-stage" className="landing-layer" aria-labelledby="brand-title">
          <div className="brand-stage">
            <h1 className="chromatic-title" id="brand-title" data-text="OMNIQUIZ">
              <Link className="brand-home" href="/" aria-label="OMNIQUIZ home">OMNIQUIZ</Link>
            </h1>
            <p className="mode-title">{title}</p>
            <p className="mode-description">{description}</p>
            {isPack ? <p className="pack-intro">{packMeta.intro}</p> : null}
          </div>

          <div className="landing-console">
            {state.phase === "error" ? (
              <div className="signal-error" role="alert">
                <span>{lex.errorTitle}</span>
                <p>{state.error}</p>
              </div>
            ) : null}

            <div className="mode-selector" role="group" aria-label="Select game mode">
              <span className="mode-selector-label">SELECT A MODE</span>
              <div className="mode-selector-options">
                {modeOptions.map((option) => (
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
                <div id="tutorial-rules">
                  <ul className="tutorial-rules">
                    {rules.map((rule) => <li key={rule}>{rule}</li>)}
                  </ul>
                  <div className="rarity-scale" aria-label="Rarity tier scale">
                    <span className="rarity-scale-label">RARITY SCALE</span>
                    <div className="rarity-scale-tiers">
                      {RARITY_SCALE.map((entry) => (
                        <span className={`rarity-tier tier-${entry.tier}`} key={entry.tier}>
                          <b>{lex.tierScale[entry.tier]}</b>
                          <small>{rarityForCrowdShare(entry.share).score} PTS</small>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <LastRunBadge mode={mode} pack={pack} />

            {savedRun ? (
              <button
                className="resume-button"
                type="button"
                onClick={() => {
                  sfx.click();
                  resumeSavedRun();
                }}
              >
                RESUME YOUR SAVED RUN
              </button>
            ) : null}

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
              {state.phase === "loading" ? "LOADING QUESTIONS" : state.phase === "error" ? "RETRY" : lex.begin[mode]}
              <span className="pixel-descent-mark" aria-hidden="true" />
            </button>

            <div className="launch-rail">
              <span>{diveLabel}</span>
              <nav aria-label="Other modes">
                <Link href="/packs">{isPack ? "ALL PACKS" : "PACKS"}</Link>
                <Link href={!isPack && mode === "daily" ? "/unlimited/classic" : "/"}>
                  {!isPack && mode === "daily" ? "ARCADE ∞" : isPack ? "MAIN GAME" : "TODAY'S EXPEDITION"}
                </Link>
              </nav>
            </div>

            <section className="worlds-strip" aria-labelledby="worlds-strip-title">
              <span className="worlds-strip-title" id="worlds-strip-title">CHOOSE A WORLD</span>
              <div className="worlds-strip-grid">
                {PACK_LIST.filter((entry) => entry.id !== pack).map((entry) => (
                  <WorldCard key={entry.id} pack={entry} variant="compact" />
                ))}
              </div>
            </section>
          </div>
          <SiteFooter />
        </main>
      ) : state.phase === "summary" ? (
        <main id="main-stage" className="summary-layer" aria-live="polite">
          <Link className="summary-brand" href="/" aria-label="OMNIQUIZ home">OMNIQUIZ</Link>
          <GameSummary
            score={state.score}
            depthMetres={state.depthMetres}
            mode={mode}
            stats={stats}
            roundLog={state.roundLog}
            shareLabel={shareLabel}
            pack={pack}
            stageName={stageName}
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
          inert={exitAllowed || undefined}
        >
          <div className="feed-plate" aria-hidden="true">
            {lex.feedPlate[mode]}
          </div>
          <div className="timecode-plate telemetry-data" aria-hidden="true">
            {getWindowLabel(state.phase, remainingMilliseconds)}
          </div>
          <GameHud
            state={state}
            mode={mode}
            remainingMilliseconds={remainingMilliseconds}
            bestScore={stats.bestScore}
            atlasLabel={packMeta.atlasLabel}
            stage={stage}
            onExit={requestExit}
          />
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
                mode={mode}
                streak={state.streak}
                streakMultiplier={state.streakMultiplier}
                lives={state.lives}
                onContinue={() => {
                  sfx.click();
                  continueDive();
                }}
              />
            ) : (
              <PromptCard state={state} phase={state.phase} atlasLabel={packMeta.atlasLabel} />
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
              {lex.previewVerb[mode]} · the clock starts in {state.previewSeconds}
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
      {exitAllowed ? <ExitConfirm onStay={closeExit} onLeave={onGoHome} /> : null}
    </div>
  );
}
