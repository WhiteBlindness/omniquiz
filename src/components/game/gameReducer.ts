import type { SubmissionResult } from "../../lib/game/scoring";
import type { PublicQuestion } from "../../lib/questions/types";

export const PREVIEW_SECONDS = 3;
export const ANSWER_SECONDS = 15;
export const METRES_PER_POINT = 10;

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
      return Object.freeze({
        ...state,
        phase: "feedback",
        score: state.score + action.result.score,
        depthMetres: state.depthMetres + action.result.score * METRES_PER_POINT,
        lastResult: action.result,
        remainingSeconds: 0,
        error: null,
      });

    case "SUBMIT_FAILED":
      return Object.freeze({
        ...state,
        phase: "answering",
        error: action.error,
      });

    case "TIME_EXPIRED":
      if (state.phase !== "answering" && state.phase !== "preview") return state;
      return Object.freeze({
        ...state,
        phase: "feedback",
        remainingSeconds: 0,
        previewSeconds: 0,
        lastResult: expiredResult,
        error: null,
      });

    case "NEXT_ROUND":
      if (state.phase !== "feedback") return state;
      return state.questionIndex + 1 >= state.questions.length
        ? Object.freeze({ ...state, phase: "summary", lastResult: null })
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
      if (phase === "feedback" && !progress.lastResult) return state;
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
        lastResult: phase === "feedback" ? progress.lastResult ?? null : null,
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
