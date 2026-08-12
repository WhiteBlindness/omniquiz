import {
  CATEGORIES,
  DIFFICULTIES,
  RARITY_RULES,
  RARITY_TIERS,
  type Category,
  type Difficulty,
  type Question,
  type RarityTier,
} from "./types";
import { normalizeAnswer } from "./normalize";

export const EXPECTED_QUESTION_COUNT = 300;

const QUESTION_ID_PATTERN = /^(general|science|geography|history)-\d{3}$/;

export class QuestionBankValidationError extends Error {
  constructor(message: string) {
    super(`Question bank validation failed: ${message}`);
    this.name = "QuestionBankValidationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

const fail = (message: string): never => {
  throw new QuestionBankValidationError(message);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCategory = (value: unknown): value is Category =>
  typeof value === "string" &&
  (CATEGORIES as readonly string[]).includes(value);

const isDifficulty = (value: unknown): value is Difficulty =>
  typeof value === "string" &&
  (DIFFICULTIES as readonly string[]).includes(value);

const isRarityTier = (value: unknown): value is RarityTier =>
  typeof value === "string" &&
  (RARITY_TIERS as readonly string[]).includes(value);

export const validateQuestionBank = (
  records: unknown,
): readonly Question[] => {
  const inputRecords: unknown[] = Array.isArray(records)
    ? records
    : fail("catalog must be an array");
  if (inputRecords.length !== EXPECTED_QUESTION_COUNT) {
    fail(`expected exactly ${EXPECTED_QUESTION_COUNT} records`);
  }

  const ids = new Set<string>();
  const prompts = new Set<string>();
  const validated: Question[] = [];

  inputRecords.forEach((candidate, index) => {
    if (!isRecord(candidate)) fail(`record ${index + 1} is not an object`);
    const record = candidate as Record<string, unknown>;

    const id = record.id;
    const category = record.category;
    const prompt = record.prompt;
    const canonicalAnswer = record.canonicalAnswer;
    const acceptedAliases = record.acceptedAliases;
    const difficulty = record.difficulty;
    const rarity = record.rarity;

    const validCategory = isCategory(category)
      ? category
      : fail(`record ${index + 1} has an invalid category`);
    const validId =
      typeof id === "string" &&
      QUESTION_ID_PATTERN.test(id) &&
      id.startsWith(`${validCategory.toLowerCase()}-`)
        ? id
        : fail(`record ${index + 1} has an unstable id`);
    if (ids.has(validId)) fail(`duplicate id ${validId}`);
    ids.add(validId);

    const validPrompt =
      typeof prompt === "string" && normalizeAnswer(prompt)
        ? prompt
        : fail(`record ${validId} has an empty prompt`);
    const normalizedPrompt = normalizeAnswer(validPrompt);
    if (prompts.has(normalizedPrompt)) {
      fail(`duplicate prompt ${validPrompt}`);
    }
    prompts.add(normalizedPrompt);

    const validCanonicalAnswer =
      typeof canonicalAnswer === "string" && normalizeAnswer(canonicalAnswer)
        ? canonicalAnswer
        : fail(`record ${validId} has an invalid canonical answer`);
    const inputAliases: unknown[] =
      Array.isArray(acceptedAliases) && acceptedAliases.length > 0
        ? acceptedAliases
        : fail(`record ${validId} must have at least one accepted alias`);

    const aliases = new Set<string>();
    const copiedAliases: string[] = [];
    inputAliases.forEach((alias) => {
      const aliasString =
        typeof alias === "string"
          ? alias
          : fail(`record ${validId} has an invalid alias`);
      const normalizedAlias = normalizeAnswer(aliasString);
      if (!normalizedAlias) fail(`record ${validId} has an invalid alias`);
      if (aliases.has(normalizedAlias)) {
        fail(`record ${validId} has duplicate aliases`);
      }
      aliases.add(normalizedAlias);
      copiedAliases.push(aliasString);
    });

    const validDifficulty = isDifficulty(difficulty)
      ? difficulty
      : fail(`record ${validId} has an invalid difficulty`);
    const rarityRecord = isRecord(rarity)
      ? rarity
      : fail(`record ${validId} has an invalid rarity tier`);
    const rarityTier = isRarityTier(rarityRecord.tier)
      ? rarityRecord.tier
      : fail(`record ${validId} has an invalid rarity tier`);
    const expectedRarity = RARITY_RULES[rarityTier];
    if (
      rarityRecord.score !== expectedRarity.score ||
      rarityRecord.depth !== expectedRarity.depth
    ) {
      fail(`record ${validId} has mismatched rarity metadata`);
    }

    const frozenAliases = Object.freeze(copiedAliases);
    const frozenRarity = Object.freeze({ ...expectedRarity });
    validated.push(
      Object.freeze({
        id: validId,
        category: validCategory,
        prompt: validPrompt,
        canonicalAnswer: validCanonicalAnswer,
        acceptedAliases: frozenAliases,
        difficulty: validDifficulty,
        rarity: frozenRarity,
      }),
    );
  });

  return Object.freeze(validated);
};
