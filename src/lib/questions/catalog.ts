import rawQuestionBank from "../../data/questions.json";
import rawMoviesBank from "../../data/packs/movies.json";

import { PACKS, type PackId } from "../packs/meta";
import { QUESTIONS_PER_MODE } from "./selection";
import { validateQuestionBank, type AtlasSpec } from "./validator";
import type { Question } from "./types";

export const QUESTION_BANK: readonly Question[] =
  validateQuestionBank(rawQuestionBank);

/** A pack must hold enough prompts to fill its largest supported mode. */
export const minimumPromptsForPack = (pack: PackId): number =>
  Math.max(0, ...PACKS[pack].modes.map((mode) => QUESTIONS_PER_MODE[mode]));

const packSpec = (pack: PackId, idPrefix: string): AtlasSpec =>
  Object.freeze({
    categories: PACKS[pack].topics,
    idPrefix: () => idPrefix,
    minimumQuestionCount: minimumPromptsForPack(pack),
  });

const EMPTY_BANK: readonly Question[] = Object.freeze([]);

const PACK_QUESTION_BANKS: Readonly<Record<PackId, readonly Question[]>> = Object.freeze({
  core: QUESTION_BANK,
  movies: validateQuestionBank(rawMoviesBank, packSpec("movies", "movies")),
  sports: EMPTY_BANK,
  music: EMPTY_BANK,
});

for (const pack of Object.values(PACKS)) {
  const size = PACK_QUESTION_BANKS[pack.id].length;
  if (pack.status === "planned" && size > 0) {
    throw new Error(`Planned pack ${pack.id} must not ship an atlas`);
  }
}

export const questionsForPack = (pack: PackId): readonly Question[] =>
  PACK_QUESTION_BANKS[pack];

const questionsById = new Map<string, Question>();
for (const bank of Object.values(PACK_QUESTION_BANKS)) {
  for (const question of bank) {
    if (questionsById.has(question.id)) {
      throw new Error(`Question id ${question.id} is used by more than one pack`);
    }
    questionsById.set(question.id, question);
  }
}

export const findQuestionById = (id: string): Question | undefined =>
  typeof id === "string" ? questionsById.get(id) : undefined;
