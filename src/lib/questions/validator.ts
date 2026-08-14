import {
  CATEGORIES,
  type AnswerFamily,
  type Category,
  type Question,
} from "./types";
import { answerKeys, normalizeAnswer } from "./normalize";

export const MINIMUM_QUESTION_COUNT = 120;
export const MINIMUM_FAMILY_COUNT = 16;
export const MINIMUM_ALIAS_COUNT = 2;
export const MINIMUM_ACCEPTED_KEY_COUNT = 4;
const QUESTION_ID_PATTERN = /^(general|science|geography|history)-\d{3}$/;
const SHARE_TOLERANCE = 0.000_001;

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
  typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);

const requireText = (value: unknown, message: string): string =>
  typeof value === "string" && normalizeAnswer(value) ? value : fail(message);

const freezeAnswerFamily = (
  candidate: Record<string, unknown>,
  questionId: string,
  answerIndex: number,
  usedKeys: Map<string, number>,
): AnswerFamily => {
  const label = requireText(
    candidate.label,
    `record ${questionId} answer ${answerIndex} has an invalid label`,
  );
  const inputAliases = Array.isArray(candidate.aliases)
    ? candidate.aliases
    : fail(`record ${questionId} answer ${answerIndex} must have aliases`);
  if (inputAliases.length < MINIMUM_ALIAS_COUNT) {
    fail(
      `record ${questionId} answer ${answerIndex} must have at least ${MINIMUM_ALIAS_COUNT} aliases`,
    );
  }
  const aliases = inputAliases.map((alias: unknown, aliasIndex: number) => {
    const aliasText = requireText(
      alias,
      `record ${questionId} answer ${answerIndex} alias ${aliasIndex + 1} is invalid`,
    );
    if (/(?:choice|response)$/i.test(aliasText.trim())) {
      fail(`record ${questionId} answer ${answerIndex} has a synthetic alias ${aliasText}`);
    }
    return aliasText;
  });

  const acceptedKeys = new Set(
    [label, ...aliases].flatMap((surface) => answerKeys(surface)),
  );
  if (acceptedKeys.size < MINIMUM_ACCEPTED_KEY_COUNT) {
    fail(
      `record ${questionId} answer ${answerIndex} must have at least ${MINIMUM_ACCEPTED_KEY_COUNT} distinct accepted keys`,
    );
  }
  for (const key of acceptedKeys) {
    const owner = usedKeys.get(key);
    if (owner !== undefined) {
      fail(
        `record ${questionId} has expanded answer-key collision for ${key} between answers ${owner} and ${answerIndex}`,
      );
    }
    usedKeys.set(key, answerIndex);
  }

  const share =
    typeof candidate.share === "number" &&
    Number.isFinite(candidate.share) &&
    candidate.share > 0 &&
    candidate.share <= 100
      ? candidate.share
      : fail(`record ${questionId} answer ${answerIndex} has an invalid share`);
  const insight = requireText(
    candidate.insight,
    `record ${questionId} answer ${answerIndex} has an invalid insight`,
  );

  return Object.freeze({
    label,
    aliases: Object.freeze(aliases),
    share,
    insight,
  });
};

export const validateQuestionBank = (records: unknown): readonly Question[] => {
  const inputRecords = Array.isArray(records)
    ? records
    : fail("catalog must be an array");
  if (inputRecords.length < MINIMUM_QUESTION_COUNT) {
    fail(`catalog must contain at least ${MINIMUM_QUESTION_COUNT} prompts`);
  }

  const ids = new Set<string>();
  const prompts = new Set<string>();
  const validated: Question[] = [];

  inputRecords.forEach((candidate, index) => {
    const record = isRecord(candidate)
      ? candidate
      : fail(`record ${index + 1} is not an object`);

    const id = record.id;
    const category = record.category;
    const prompt = record.prompt;
    const answers = record.answers;

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

    const validPrompt = requireText(prompt, `record ${validId} has an empty prompt`);
    const normalizedPrompt = normalizeAnswer(validPrompt);
    if (prompts.has(normalizedPrompt)) fail(`duplicate prompt ${validPrompt}`);
    prompts.add(normalizedPrompt);

    const inputAnswers = Array.isArray(answers)
      ? answers
      : fail(`record ${validId} must have answer families`);
    if (inputAnswers.length < MINIMUM_FAMILY_COUNT) {
      fail(
        `record ${validId} must have at least ${MINIMUM_FAMILY_COUNT} answer families`,
      );
    }
    const usedKeys = new Map<string, number>();
    const frozenAnswers = inputAnswers.map((answer, answerIndex) => {
      const answerRecord = isRecord(answer)
        ? answer
        : fail(`record ${validId} answer ${answerIndex + 1} is not an object`);
      return freezeAnswerFamily(answerRecord, validId, answerIndex + 1, usedKeys);
    });
    const totalShare = frozenAnswers.reduce(
      (total: number, answer: AnswerFamily) => total + answer.share,
      0,
    );
    if (Math.abs(totalShare - 100) > SHARE_TOLERANCE) {
      fail(`record ${validId} answer shares must total 100 percent (got ${totalShare})`);
    }

    validated.push(
      Object.freeze({
        id: validId,
        category: validCategory,
        prompt: validPrompt,
        answers: Object.freeze(frozenAnswers),
      }),
    );
  });

  return Object.freeze(validated);
};
