import type { PublicQuestion, Question } from "./types";

export const toPublicQuestion = (question: Question): PublicQuestion =>
  Object.freeze({
    id: question.id,
    category: question.category,
    prompt: question.prompt,
    difficulty: question.difficulty,
    rarity: Object.freeze({ ...question.rarity }),
  });

export const toPublicQuestions = (
  questions: readonly Question[],
): readonly PublicQuestion[] =>
  Object.freeze(questions.map((question) => toPublicQuestion(question)));
