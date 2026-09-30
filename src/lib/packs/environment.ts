import type { GameMode, GamePhase } from "../../components/game/gameReducer";
import type { RarityTier } from "../questions/types";

/**
 * A pack's environment is the world the run happens in: how it looks, how it
 * progresses and what its interface calls things. `stadium` and `venue` are
 * reserved for planned packs and have no renderer yet.
 */
export type EnvironmentId = "ocean" | "cinema" | "stadium" | "venue";
export type LiveEnvironmentId = Extract<EnvironmentId, "ocean" | "cinema">;

type ModeText = Readonly<Record<GameMode, string>>;
type ModeLines = Readonly<Record<GameMode, readonly string[]>>;

export type TravelLexicon = Readonly<{
  label: string;
  aria: string;
  deltaLabel: string;
  deltaAria: (metres: number) => string;
  summaryLabel: string;
  srNote: string;
}>;

export type Lexicon = Readonly<{
  modeTitle: ModeText;
  modeDescription: ModeText;
  hudAria: ModeText;
  feedPlate: ModeText;
  begin: ModeText;
  submit: ModeText;
  nextPrompt: ModeText;
  lastPrompt: ModeText;
  previewVerb: ModeText;
  logName: ModeText;
  logAria: ModeText;
  summaryTitle: ModeText;
  summaryTitleLoss: string;
  summarySr: ModeText;
  replay: ModeText;
  promptHint: ModeText;
  noMatchNote: ModeText;
  rules: ModeLines;
  tierHeading: Readonly<Record<RarityTier, string>>;
  tierScale: Readonly<Record<RarityTier, string>>;
  legend: readonly Readonly<{ tier: "plankton" | "rare" | "krillion"; label: string }>[];
  yourAnswer: string;
  commonAnswers: string;
  noAnswer: string;
  noSignal: string;
  bestEntry: string;
  typedLabel: string;
  errorTitle: string;
  travel: TravelLexicon | null;
  stageLabel: string;
  stageSummaryLabel: string;
}>;

export type StageDef = Readonly<{ id: string; label: string; short: string }>;

export type PackEnvironment = Readonly<{
  id: LiveEnvironmentId;
  /** Ordered progression stages, or null when progress is shown as depth. */
  stages: readonly StageDef[] | null;
  lexicon: Lexicon;
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
  "How far can you go before the signal fades?",
] as const;

const OCEAN_LEXICON: Lexicon = Object.freeze({
  modeTitle: {
    daily: "THE DAILY DIVE",
    unlimited: "THE ARCADE DIVE",
    speed: "SPEED RUN",
    survival: "SURVIVAL MODE",
  },
  modeDescription: {
    daily: "7 prompts · 15 seconds each · rarer recognizable answers sink deeper",
    unlimited: "15 prompts · repeatable crowd-rarity expeditions",
    speed: "10 prompts · 8 seconds each · streak multipliers reward momentum",
    survival: "3 lives · 30 prompts · every miss brings you closer to the end",
  },
  hudAria: {
    daily: "Dive telemetry",
    unlimited: "Dive telemetry",
    speed: "Race telemetry",
    survival: "Threat telemetry",
  },
  feedPlate: {
    daily: "CAM 01 · ROV FEED",
    unlimited: "CAM 01 · ROV FEED",
    speed: "CAM 01 · GRID FEED",
    survival: "CAM 01 · VOID FEED",
  },
  begin: {
    daily: "BEGIN DESCENT",
    unlimited: "BEGIN DESCENT",
    speed: "START THE CLOCK",
    survival: "ENTER THE ABYSS",
  },
  submit: { daily: "DIVE", unlimited: "DIVE", speed: "LOCK", survival: "LOCK" },
  nextPrompt: {
    daily: "CONTINUE DESCENT",
    unlimited: "CONTINUE DESCENT",
    speed: "NEXT PROMPT",
    survival: "NEXT PROMPT",
  },
  lastPrompt: {
    daily: "SURFACE WITH LOG",
    unlimited: "SURFACE WITH LOG",
    speed: "FINISH RUN",
    survival: "VIEW LOG",
  },
  previewVerb: {
    daily: "descending",
    unlimited: "descending",
    speed: "loading",
    survival: "entering",
  },
  logName: {
    daily: "DIVE LOG",
    unlimited: "DIVE LOG",
    speed: "RACE LOG",
    survival: "THREAT LOG",
  },
  logAria: {
    daily: "Dive log",
    unlimited: "Dive log",
    speed: "Race log",
    survival: "Threat log",
  },
  summaryTitle: {
    daily: "DIVE COMPLETE",
    unlimited: "ARCADE RUN COMPLETE",
    speed: "SPEED RUN COMPLETE",
    survival: "SURVIVAL COMPLETE",
  },
  summaryTitleLoss: "SIGNAL LOST",
  summarySr: {
    daily: "Dive logged after the final prompt",
    unlimited: "Dive logged after the final prompt",
    speed: "Race complete",
    survival: "Run ended",
  },
  replay: {
    daily: "DIVE AGAIN",
    unlimited: "DIVE AGAIN",
    speed: "RACE AGAIN",
    survival: "ENTER AGAIN",
  },
  promptHint: {
    daily: "Name the first honest answer that surfaces. Rarer recognizable signals sink deeper.",
    unlimited: "Name the first honest answer that surfaces. Rarer recognizable signals sink deeper.",
    speed: "Name the first honest answer that comes to mind. Rarer recognizable signals score higher.",
    survival: "Name the first honest answer that comes to mind. Rarer recognizable signals keep you alive.",
  },
  noMatchNote: {
    daily: "No atlas match logged; the dive continues.",
    unlimited: "No atlas match logged; the dive continues.",
    speed: "No atlas match logged; the clock keeps running.",
    survival: "No atlas match logged; the void deepens.",
  },
  rules: {
    daily: DAILY_RULES,
    unlimited: ARCADE_RULES,
    speed: SPEED_RULES,
    survival: SURVIVAL_RULES,
  },
  tierHeading: {
    uncharted: "UNCHARTED",
    plankton: "PLANKTON",
    tooclever: "TOO CLEVER",
    schooler: "SCHOOLER",
    rare: "RARE CATCH",
    deepcut: "DEEP CUT",
    krillion: "ONE IN A KRILLION",
  },
  tierScale: {
    uncharted: "UNCHARTED",
    plankton: "PLANKTON",
    tooclever: "TOO CLEVER",
    schooler: "SCHOOLER",
    rare: "RARE",
    deepcut: "DEEP CUT",
    krillion: "KRILLION",
  },
  legend: [
    { tier: "plankton" as const, label: "PLANKTON" },
    { tier: "rare" as const, label: "RARE CATCH" },
    { tier: "krillion" as const, label: "KRILLION" },
  ],
  yourAnswer: "YOUR SIGNAL",
  commonAnswers: "COMMON SIGNALS",
  noAnswer: "No answer",
  noSignal: "No signal",
  bestEntry: "BEST SIGNAL",
  typedLabel: "YOU TYPED",
  errorTitle: "SIGNAL LOST",
  travel: {
    label: "DEPTH",
    aria: "Current depth",
    deltaLabel: "DESCENT",
    deltaAria: (metres) => `Earned depth ${metres} metres`,
    summaryLabel: "YOU REACHED",
    srNote: "points; every point adds 10 metres",
  },
  stageLabel: "",
  stageSummaryLabel: "",
});

const CINEMA_RULES_COMMON = [
  "Crowd share maps to rarity and points.",
  "The atlas recognizes answer families, not one fixed fact.",
] as const;

const CINEMA_LEXICON: Lexicon = Object.freeze({
  modeTitle: {
    daily: "THE LATE SHOW",
    unlimited: "THE LATE SHOW",
    speed: "SPEED RUN",
    survival: "SURVIVAL RUN",
  },
  modeDescription: {
    daily: "7 prompts · 15 seconds each · rarer answers score higher",
    unlimited: "15 prompts · repeatable screenings · rarer answers score higher",
    speed: "10 prompts · 8 seconds each · streak multipliers reward momentum",
    survival: "3 lives · 30 prompts · every miss costs a life",
  },
  hudAria: {
    daily: "Run status",
    unlimited: "Run status",
    speed: "Run status",
    survival: "Run status",
  },
  feedPlate: {
    daily: "CAM 01 · BOULEVARD",
    unlimited: "CAM 01 · BOULEVARD",
    speed: "CAM 01 · FAST LANE",
    survival: "CAM 01 · LAST SCREENING",
  },
  begin: {
    daily: "START THE SHOW",
    unlimited: "START THE SHOW",
    speed: "START THE CLOCK",
    survival: "START SURVIVAL",
  },
  submit: { daily: "SUBMIT", unlimited: "SUBMIT", speed: "LOCK", survival: "LOCK" },
  nextPrompt: {
    daily: "NEXT SCENE",
    unlimited: "NEXT SCENE",
    speed: "NEXT PROMPT",
    survival: "NEXT PROMPT",
  },
  lastPrompt: {
    daily: "ROLL CREDITS",
    unlimited: "ROLL CREDITS",
    speed: "FINISH RUN",
    survival: "VIEW RESULTS",
  },
  previewVerb: {
    daily: "next scene",
    unlimited: "next scene",
    speed: "cueing up",
    survival: "cueing up",
  },
  logName: {
    daily: "SCREENING LOG",
    unlimited: "SCREENING LOG",
    speed: "RACE LOG",
    survival: "RUN LOG",
  },
  logAria: {
    daily: "Screening log",
    unlimited: "Screening log",
    speed: "Race log",
    survival: "Run log",
  },
  summaryTitle: {
    daily: "THAT'S A WRAP",
    unlimited: "THAT'S A WRAP",
    speed: "SPEED RUN COMPLETE",
    survival: "RUN COMPLETE",
  },
  summaryTitleLoss: "RUN ENDED",
  summarySr: {
    daily: "Screening logged after the final prompt",
    unlimited: "Screening logged after the final prompt",
    speed: "Race complete",
    survival: "Run ended",
  },
  replay: {
    daily: "PLAY AGAIN",
    unlimited: "PLAY AGAIN",
    speed: "RACE AGAIN",
    survival: "RUN IT AGAIN",
  },
  promptHint: {
    daily: "Name the first honest answer that comes to mind. Rarer recognizable answers score higher.",
    unlimited: "Name the first honest answer that comes to mind. Rarer recognizable answers score higher.",
    speed: "Name the first honest answer that comes to mind. Rarer recognizable answers score higher.",
    survival: "Name the first honest answer that comes to mind. Rarer recognizable answers keep you alive.",
  },
  noMatchNote: {
    daily: "No atlas match logged; the show goes on.",
    unlimited: "No atlas match logged; the show goes on.",
    speed: "No atlas match logged; the clock keeps running.",
    survival: "No atlas match logged; that costs a life.",
  },
  rules: {
    daily: [
      "Seven prompts. Same for everyone.",
      "15 seconds to name one honest thing.",
      ...CINEMA_RULES_COMMON,
      "Pass, timeout, or an answer outside the atlas scores zero and keeps the show moving.",
      "Every prompt moves you further down the boulevard, from the city limits to premiere night.",
    ],
    unlimited: [
      "Fifteen prompts. Every run reaches premiere night.",
      "15 seconds to name one honest thing.",
      ...CINEMA_RULES_COMMON,
      "Pass, timeout, or an answer outside the atlas scores zero and keeps the show moving.",
      "Every prompt moves you further down the boulevard, from the city limits to premiere night.",
    ],
    speed: [
      "Ten prompts. Eight seconds each. No room to hesitate.",
      "Consecutive correct answers build a streak multiplier.",
      "3 in a row = 2× points. 5 in a row = 3× points.",
      "A miss, pass, or timeout resets your streak to zero.",
      "The atlas still recognizes answer families. Speed rewards instinct.",
      "The road keeps moving as you go: chase the highest multiplied score.",
    ],
    survival: [
      "You start with three lives. Every miss costs one.",
      "When your lives run out, the run ends immediately.",
      "15 seconds per prompt from a pool of 30 questions.",
      "Recognized answers keep you alive and add to your score.",
      "Answers outside the atlas, passes, and timeouts all cost a life.",
      "See how far down the boulevard you can get.",
    ],
  },
  tierHeading: {
    uncharted: "NOT IN THE ATLAS",
    plankton: "EXTRA",
    tooclever: "TOO CLEVER",
    schooler: "SUPPORTING ROLE",
    rare: "CULT FIND",
    deepcut: "DEEP CUT",
    krillion: "ONE OF A KIND",
  },
  tierScale: {
    uncharted: "NOT LISTED",
    plankton: "EXTRA",
    tooclever: "TOO CLEVER",
    schooler: "SUPPORTING",
    rare: "CULT FIND",
    deepcut: "DEEP CUT",
    krillion: "ONE-OFF",
  },
  legend: [
    { tier: "plankton" as const, label: "EXTRA" },
    { tier: "rare" as const, label: "CULT FIND" },
    { tier: "krillion" as const, label: "ONE-OFF" },
  ],
  yourAnswer: "YOUR ANSWER",
  commonAnswers: "COMMON ANSWERS",
  noAnswer: "No answer",
  noSignal: "No answer",
  bestEntry: "BEST ANSWER",
  typedLabel: "YOU TYPED",
  errorTitle: "CONNECTION LOST",
  travel: null,
  stageLabel: "LOCATION",
  stageSummaryLabel: "YOU REACHED",
});

const CINEMA_STAGES: readonly StageDef[] = Object.freeze([
  { id: "city-limits", label: "CITY LIMITS", short: "LIMITS" },
  { id: "cinema-district", label: "CINEMA DISTRICT", short: "DISTRICT" },
  { id: "neon-boulevard", label: "NEON BOULEVARD", short: "BOULEVARD" },
  { id: "drive-in-row", label: "DRIVE-IN ROW", short: "DRIVE-IN" },
  { id: "premiere-night", label: "PREMIERE NIGHT", short: "PREMIERE" },
]);

const OCEAN: PackEnvironment = Object.freeze({ id: "ocean", stages: null, lexicon: OCEAN_LEXICON });
const CINEMA: PackEnvironment = Object.freeze({
  id: "cinema",
  stages: CINEMA_STAGES,
  lexicon: CINEMA_LEXICON,
});

/** Environments with a renderer. Typing this as an exhaustive Record makes a new live environment fail to compile until it is added. */
export const ENVIRONMENTS: Readonly<Record<LiveEnvironmentId, PackEnvironment>> = Object.freeze({
  ocean: OCEAN,
  cinema: CINEMA,
});

export const isLiveEnvironment = (id: EnvironmentId): id is LiveEnvironmentId =>
  id === "ocean" || id === "cinema";

/** Run progress from 0 to 1, taken from where the player is in the prompt list. */
export const routeProgress = (
  phase: GamePhase,
  questionIndex: number,
  questionCount: number,
): number => {
  if (phase === "intro" || phase === "loading" || phase === "error") return 0;
  if (questionCount <= 1) return 0;
  return Math.min(1, Math.max(0, questionIndex / (questionCount - 1)));
};

export const stageIndexFor = (stages: readonly StageDef[], progress: number): number =>
  Math.min(stages.length - 1, Math.max(0, Math.floor(progress * stages.length)));
