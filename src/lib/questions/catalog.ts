import rawQuestionBank from "../../data/questions.json";

import { validateQuestionBank } from "./validator";
import type { Question } from "./types";

export const QUESTION_BANK: readonly Question[] =
  validateQuestionBank(rawQuestionBank);

const questionsById = new Map(
  QUESTION_BANK.map((question) => [question.id, question]),
);

export const findQuestionById = (id: string): Question | undefined =>
  typeof id === "string" ? questionsById.get(id) : undefined;
