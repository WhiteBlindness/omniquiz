import type { SubmissionResult } from "../../lib/game/scoring";
import type { PublicQuestion } from "../../lib/questions/types";

export const PREVIEW_SECONDS = 3;
export const ANSWER_SECONDS = 15;
export const METRES_PER_POINT = 10;
export const DAILY_WRONG_ANSWER_PENALTY = 50;

export type GameMode = "daily" | "unlimited";

export type GamePhase =
  | "intro"
  | "loading"
  | "preview"
  | "answering"
  | "submitting"
  | "feedback"
  | "game-over"
  | "summary"
  | "error";

export type GameOutcome = "answer" | "pass" | "timeout";

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

const expiredResult = Object.freeze({
  accepted: false,
  normalizedAnswer: "",
  tier: "plankton" as const,
  score: 0,
  depth: 0.08,
  quip: "The current carried you past this prompt.",
});

const passedResult = Object.freeze({
  accepted: false,
  normalizedAnswer: "",
  tier: "plankton" as const,
  score: 0,
  depth: 0,
  quip: "Pass logged. Mission penalty applied.",
});

const getMissScore = (state: GameState): number =>
  state.mode === "daily"
    ? Math.max(0, state.score - DAILY_WRONG_ANSWER_PENALTY)
    : state.score;

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
    error: null,
  });

const prepareNextQuestion = (
  state: GameState,
  questionIndex: number,
): GameState =>
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

export const gameReducer = (
  state: GameState,
  action: GameAction,
): GameState => {
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
            phase: "preview",
            questions: Object.freeze([...action.questions]),
            questionIndex: 0,
            answer: "",
            remainingSeconds: ANSWER_SECONDS,
            previewSeconds: PREVIEW_SECONDS,
            score: 0,
            depthMetres: 0,
            lastResult: null,
            lastOutcome: null,
            error: null,
          })
        : Object.freeze({
            ...state,
            phase: "error",
            error: "No questions are available for this dive.",
          });

    case "LOAD_FAILED":
      return Object.freeze({
        ...state,
        phase: "error",
        lastResult: null,
        lastOutcome: null,
        error: action.error,
      });

    case "PREVIEW_TICK":
      if (state.phase !== "preview") return state;
      return state.previewSeconds <= 1
        ? Object.freeze({
            ...state,
            phase: "answering",
            previewSeconds: 0,
            remainingSeconds: ANSWER_SECONDS,
            error: null,
          })
        : Object.freeze({
            ...state,
            previewSeconds: state.previewSeconds - 1,
          });

    case "ANSWER_TICK":
      if (state.phase !== "answering") return state;
      return state.remainingSeconds <= 1
        ? gameReducer(state, { type: "TIME_EXPIRED" })
        : Object.freeze({
            ...state,
            remainingSeconds: state.remainingSeconds - 1,
          });

    case "SET_ANSWER":
      if (state.phase !== "answering") return state;
      return Object.freeze({ ...state, answer: action.answer, error: null });

    case "SUBMIT_START":
      if (state.phase !== "answering" || !state.answer.trim()) return state;
      return Object.freeze({ ...state, phase: "submitting", error: null });

    case "SUBMIT_RESOLVED":
      if (state.phase !== "submitting") return state;
      {
        const isWrongAnswer = !action.result.accepted;
        const scoreDelta = action.result.accepted
          ? action.result.score
          : state.mode === "daily"
            ? -DAILY_WRONG_ANSWER_PENALTY
            : 0;
        const score = Math.max(0, state.score + scoreDelta);

        return Object.freeze({
          ...state,
          phase: state.mode === "unlimited" && isWrongAnswer ? "game-over" : "feedback",
          score,
          depthMetres: Math.max(0, state.depthMetres + scoreDelta * METRES_PER_POINT),
          lastResult: action.result,
          lastOutcome: "answer",
          remainingSeconds: 0,
          error: null,
        });
      }

    case "SUBMIT_FAILED":
      return Object.freeze({
        ...state,
        phase: "answering",
        error: action.error,
      });

    case "PASS_QUESTION":
      if (state.phase !== "answering") return state;
      {
        const score = getMissScore(state);
        return Object.freeze({
          ...state,
          phase: state.mode === "unlimited" ? "game-over" : "feedback",
          answer: "",
          score,
          depthMetres: score * METRES_PER_POINT,
          remainingSeconds: 0,
          lastResult: passedResult,
          lastOutcome: "pass",
          error: null,
        });
      }

    case "TIME_EXPIRED":
      if (state.phase !== "answering" && state.phase !== "preview") return state;
      {
        const score = getMissScore(state);
        return Object.freeze({
          ...state,
          phase: state.mode === "unlimited" ? "game-over" : "feedback",
          score,
          depthMetres: score * METRES_PER_POINT,
          remainingSeconds: 0,
          previewSeconds: 0,
          lastResult: expiredResult,
          lastOutcome: "timeout",
          error: null,
        });
      }

    case "NEXT_ROUND":
      if (state.phase !== "feedback") return state;
      return state.questionIndex + 1 >= state.questions.length
        ? Object.freeze({ ...state, phase: "summary", lastResult: null, lastOutcome: null })
        : prepareNextQuestion(state, state.questionIndex + 1);

    case "RESTORE_PROGRESS": {
      const progress = action.progress;
      const questions = progress.questions?.length
        ? Object.freeze([...progress.questions])
        : state.questions;
      const phase = progress.phase;
      if (!phase || !questions.length || phase === "loading" || phase === "error") {
        return state;
      }
      if ((phase === "feedback" || phase === "game-over") && !progress.lastResult) {
        return state;
      }
      return Object.freeze({
        ...state,
        ...progress,
        phase,
        questions,
        questionIndex: Math.max(
          0,
          Math.min(progress.questionIndex ?? 0, questions.length - 1),
        ),
        score: Math.max(0, progress.score ?? 0),
        depthMetres: Math.max(0, progress.depthMetres ?? 0),
        answer: progress.answer ?? "",
        remainingSeconds: Math.max(0, progress.remainingSeconds ?? ANSWER_SECONDS),
        previewSeconds: Math.max(0, progress.previewSeconds ?? 0),
        lastResult:
          phase === "feedback" || phase === "game-over"
            ? progress.lastResult ?? null
            : null,
        lastOutcome:
          phase === "feedback" || phase === "game-over"
            ? progress.lastOutcome ?? "answer"
            : null,
        error: null,
      });
    }

    case "RESET":
      return createInitialGameState(state.mode);

    default:
      return state;
  }
};

export const getCurrentQuestion = (
  state: GameState,
): PublicQuestion | null => state.questions[state.questionIndex] ?? null;
