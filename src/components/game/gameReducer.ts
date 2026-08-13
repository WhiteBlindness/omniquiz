import {
  createZeroScoreResult,
  type SubmissionResult,
} from "../../lib/game/scoring";
import type { PublicQuestion } from "../../lib/questions/types";

export { METRES_PER_POINT } from "../../lib/game/scoring";

export const PREVIEW_SECONDS = 3;
export const ANSWER_SECONDS = 15;

export type GameMode = "daily" | "unlimited";
export type GamePhase =
  | "intro"
  | "loading"
  | "preview"
  | "answering"
  | "submitting"
  | "feedback"
  | "summary"
  | "error";
export type GameOutcome = "answer" | "pass" | "timeout";

export type RoundLog = Readonly<{
  questionId: string;
  prompt: string;
  outcome: GameOutcome;
  submittedAnswer: string;
  answerLabel: string;
  crowdShare: number | null;
  tier: SubmissionResult["tier"];
  score: number;
  depthMetres: number;
  commonAnswers: readonly SubmissionResult["commonAnswers"][number][];
}>;

export type GameState = Readonly<{
  mode: GameMode;
  phase: GamePhase;
  questions: readonly PublicQuestion[];
  questionIndex: number;
  answer: string;
  remainingSeconds: number;
  previewSeconds: number;
  score: number;
  depthMetres: number;
  lastResult: SubmissionResult | null;
  lastOutcome: GameOutcome | null;
  roundLog: readonly RoundLog[];
  error: string | null;
}>;

export type GameAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_QUESTIONS"; questions: readonly PublicQuestion[] }
  | { type: "LOAD_FAILED"; error: string }
  | { type: "PREVIEW_TICK" }
  | { type: "ANSWER_TICK" }
  | { type: "SET_ANSWER"; answer: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_RESOLVED"; result: SubmissionResult }
  | { type: "SUBMIT_FAILED"; error: string }
  | { type: "PASS_QUESTION" }
  | { type: "TIME_EXPIRED" }
  | { type: "NEXT_ROUND" }
  | { type: "RESTORE_PROGRESS"; progress: Partial<GameState> }
  | { type: "RESET" };

const freezeResult = (result: SubmissionResult): SubmissionResult =>
  Object.freeze({
    ...result,
    commonAnswers: Object.freeze(
      result.commonAnswers.map((answer) => Object.freeze({ ...answer })),
    ),
  });

const appendRoundLog = (
  state: GameState,
  result: SubmissionResult,
  outcome: GameOutcome,
): readonly RoundLog[] => {
  const question = state.questions[state.questionIndex];
  if (!question) return state.roundLog;
  const entry: RoundLog = Object.freeze({
    questionId: question.id,
    prompt: question.prompt,
    outcome,
    submittedAnswer: state.answer,
    answerLabel: result.answerLabel,
    crowdShare: result.crowdShare,
    tier: result.tier,
    score: result.score,
    depthMetres: result.depthMetres,
    commonAnswers: Object.freeze(
      result.commonAnswers.map((answer) => Object.freeze({ ...answer })),
    ),
  });
  return Object.freeze([...state.roundLog, entry]);
};

const completeRound = (
  state: GameState,
  result: SubmissionResult,
  outcome: GameOutcome,
): GameState => {
  const safeResult = freezeResult(result);
  const scoreDelta = Math.max(0, safeResult.score);
  const depthDelta = Math.max(0, safeResult.depthMetres);
  return Object.freeze({
    ...state,
    phase: "feedback" as const,
    score: state.score + scoreDelta,
    depthMetres: state.depthMetres + depthDelta,
    lastResult: safeResult,
    lastOutcome: outcome,
    roundLog: appendRoundLog(state, safeResult, outcome),
    remainingSeconds: 0,
    previewSeconds: 0,
    error: null,
  });
};

export const createInitialGameState = (mode: GameMode): GameState =>
  Object.freeze({
    mode,
    phase: "intro" as const,
    questions: Object.freeze([]),
    questionIndex: 0,
    answer: "",
    remainingSeconds: ANSWER_SECONDS,
    previewSeconds: 0,
    score: 0,
    depthMetres: 0,
    lastResult: null,
    lastOutcome: null,
    roundLog: Object.freeze([]),
    error: null,
  });

const prepareNextQuestion = (state: GameState, questionIndex: number): GameState =>
  Object.freeze({
    ...state,
    phase: "preview" as const,
    questionIndex,
    answer: "",
    remainingSeconds: ANSWER_SECONDS,
    previewSeconds: PREVIEW_SECONDS,
    lastResult: null,
    lastOutcome: null,
    error: null,
  });

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "LOAD_START":
      return Object.freeze({
        ...state,
        phase: "loading",
        error: null,
        lastResult: null,
        lastOutcome: null,
      });

    case "LOAD_QUESTIONS":
      return action.questions.length > 0
        ? Object.freeze({
            ...state,
            phase: "preview" as const,
            questions: Object.freeze(action.questions.map((question) => Object.freeze({ ...question }))),
            questionIndex: 0,
            answer: "",
            remainingSeconds: ANSWER_SECONDS,
            previewSeconds: PREVIEW_SECONDS,
            score: 0,
            depthMetres: 0,
            lastResult: null,
            lastOutcome: null,
            roundLog: Object.freeze([]),
            error: null,
          })
        : Object.freeze({
            ...state,
            phase: "error" as const,
            error: "No questions are available for this dive.",
          });

    case "LOAD_FAILED":
      return Object.freeze({
        ...state,
        phase: "error" as const,
        lastResult: null,
        lastOutcome: null,
        error: action.error,
      });

    case "PREVIEW_TICK":
      if (state.phase !== "preview") return state;
      return state.previewSeconds <= 1
        ? Object.freeze({
            ...state,
            phase: "answering" as const,
            previewSeconds: 0,
            remainingSeconds: ANSWER_SECONDS,
            error: null,
          })
        : Object.freeze({ ...state, previewSeconds: state.previewSeconds - 1 });

    case "ANSWER_TICK":
      if (state.phase !== "answering") return state;
      return state.remainingSeconds <= 1
        ? gameReducer(state, { type: "TIME_EXPIRED" })
        : Object.freeze({ ...state, remainingSeconds: state.remainingSeconds - 1 });

    case "SET_ANSWER":
      if (state.phase !== "answering") return state;
      return Object.freeze({ ...state, answer: action.answer, error: null });

    case "SUBMIT_START":
      if (state.phase !== "answering" || !state.answer.trim()) return state;
      return Object.freeze({ ...state, phase: "submitting" as const, error: null });

    case "SUBMIT_RESOLVED":
      if (state.phase !== "submitting") return state;
      return completeRound(state, action.result, "answer");

    case "SUBMIT_FAILED":
      return Object.freeze({ ...state, phase: "answering" as const, error: action.error });

    case "PASS_QUESTION":
      if (state.phase !== "answering") return state;
      return completeRound(
        state,
        createZeroScoreResult("pass"),
        "pass",
      );

    case "TIME_EXPIRED":
      if (state.phase !== "answering" && state.phase !== "preview") return state;
      return completeRound(
        state,
        createZeroScoreResult("timeout"),
        "timeout",
      );

    case "NEXT_ROUND":
      if (state.phase !== "feedback") return state;
      return state.questionIndex + 1 >= state.questions.length
        ? Object.freeze({ ...state, phase: "summary" as const, lastResult: null, lastOutcome: null })
        : prepareNextQuestion(state, state.questionIndex + 1);

    case "RESTORE_PROGRESS": {
      const progress = action.progress;
      const questions = progress.questions?.length
        ? Object.freeze(progress.questions.map((question) => Object.freeze({ ...question })))
        : state.questions;
      const phase = progress.phase;
      if (!phase || !questions.length || phase === "loading" || phase === "error") return state;
      if (phase === "feedback" && !progress.lastResult) return state;
      const lastResult = progress.lastResult ? freezeResult(progress.lastResult) : null;
      const roundLog = progress.roundLog?.map((entry) =>
        Object.freeze({
          ...entry,
          commonAnswers: Object.freeze(entry.commonAnswers.map((answer) => Object.freeze({ ...answer }))),
        }),
      ) ?? [];
      return Object.freeze({
        ...state,
        ...progress,
        phase,
        questions,
        questionIndex: Math.max(0, Math.min(progress.questionIndex ?? 0, questions.length - 1)),
        score: Math.max(0, progress.score ?? 0),
        depthMetres: Math.max(0, progress.depthMetres ?? 0),
        answer: progress.answer ?? "",
        remainingSeconds: Math.max(0, progress.remainingSeconds ?? ANSWER_SECONDS),
        previewSeconds: Math.max(0, progress.previewSeconds ?? 0),
        lastResult: phase === "feedback" ? lastResult : null,
        lastOutcome: phase === "feedback" ? progress.lastOutcome ?? "answer" : null,
        roundLog: Object.freeze(roundLog),
        error: null,
      });
    }

    case "RESET":
      return createInitialGameState(state.mode);

    default:
      return state;
  }
};

export const getCurrentQuestion = (state: GameState): PublicQuestion | null =>
  state.questions[state.questionIndex] ?? null;
