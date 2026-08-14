import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { general } from "./atlas/general.mjs";
import { geography } from "./atlas/geography.mjs";
import { history } from "./atlas/history.mjs";
import { science } from "./atlas/science.mjs";

const OUTPUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../src/data/questions.json");
const CATEGORIES = ["General", "Science", "Geography", "History"];
const SOURCES = { General: general, Science: science, Geography: geography, History: history };
const MINIMUM_QUESTION_COUNT = 120;
const MINIMUM_FAMILY_COUNT = 16;
const MINIMUM_ALIAS_COUNT = 2;
const MINIMUM_ACCEPTED_KEY_COUNT = 4;
const SHARE_TOLERANCE = 0.000_001;

const SHARE_PROFILES = [
  [34, 19, 14, 10, 8, 6, 4, 2, 1, 0.7, 0.5, 0.3, 0.2, 0.15, 0.1, 0.05],
  [31, 21, 16, 11, 8, 5, 3, 2, 1, 0.7, 0.5, 0.3, 0.2, 0.1, 0.1, 0.1],
  [40.3, 18, 12, 9, 7, 5, 3, 2, 1.2, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.1],
  [30.5, 20, 15, 10, 8, 6, 4, 2, 1.5, 1, 0.8, 0.5, 0.3, 0.25, 0.1, 0.05],
];

const normalizeWords = (value) => {
  const folded = value
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase("en-US");
  return folded.match(/[\p{Letter}\p{Number}]+/gu) ?? [];
};

const normalize = (value) => normalizeWords(value).join("");
const articles = new Set(["a", "an", "the"]);

const safeVariants = (word) => {
  if (word.length <= 2 || /\p{Number}/u.test(word)) return [];
  if (word.endsWith("ies") && word.length > 4) return [`${word.slice(0, -3)}y`];
  if (/(?:ches|shes|xes|zes|ses|oes)$/.test(word) && word.length > 4) {
    return [word.slice(0, -2)];
  }
  if (word.endsWith("s") && word.length > 4 && !/(?:ss|us|is|ics|ous|eous)$/.test(word)) {
    return [word.slice(0, -1)];
  }
  if (/[bcdfghjklmnpqrstvwxyz]y$/.test(word)) return [`${word.slice(0, -1)}ies`];
  if (/(?:s|x|z|ch|sh)$/.test(word)) return [`${word}es`];
  return [`${word}s`];
};

const addPhraseKeys = (keys, words) => {
  if (words.length === 0) return;
  keys.add(words.join(""));
  const lastWord = words.at(-1);
  for (const variant of safeVariants(lastWord)) {
    keys.add([...words.slice(0, -1), variant].join(""));
  }
};

const answerKeys = (value) => {
  const words = normalizeWords(value);
  const bareWords = articles.has(words[0]) ? words.slice(1) : words;
  const keys = new Set();

  addPhraseKeys(keys, words);
  addPhraseKeys(keys, bareWords);

  for (const article of ["a", "an", "the"]) {
    addPhraseKeys(keys, [article, ...bareWords]);
  }

  return keys;
};

const insightFor = (label, index) => {
  const cues = [
    "The surface crowd reaches for this first.",
    "A familiar current carries this answer.",
    "This choice travels through the middle of the school.",
    "A measured answer with a clear signal.",
    "The atlas marks this as a rarer route.",
    "Only a few explorers sent this one down.",
    "A sly side channel in the crowd map.",
    "A tiny crew knew to look this deep.",
    "A quiet answer in the lower current.",
    "A specialist current carries this one.",
    "A narrow route through the atlas.",
    "A deep-water answer with a distinct signal.",
    "A very small crew chose this route.",
    "A hidden answer beneath the common tide.",
    "A nearly unvisited trench in the crowd map.",
    "A krillion-level answer for careful explorers.",
  ];
  return `${cues[index]} ${label} is logged in the atlas.`;
};

const buildQuestionBank = () =>
  CATEGORIES.flatMap((category) =>
    SOURCES[category].map((source, index) => {
      const shares = SHARE_PROFILES[index % SHARE_PROFILES.length];
      return {
        id: `${category.toLowerCase()}-${String(index + 1).padStart(3, "0")}`,
        category,
        prompt: source.prompt,
        answers: source.answers.map((answer, answerIndex) => ({
          label: answer.label,
          aliases: [...answer.aliases],
          share: shares[answerIndex],
          insight: insightFor(answer.label, answerIndex),
        })),
      };
    }),
  );

const validateQuestionBank = (records) => {
  if (!Array.isArray(records) || records.length < MINIMUM_QUESTION_COUNT) {
    throw new Error(`crowd atlas needs at least ${MINIMUM_QUESTION_COUNT} prompts`);
  }

  const ids = new Set();
  const prompts = new Set();
  for (const category of CATEGORIES) {
    const count = records.filter((record) => record.category === category).length;
    if (count < MINIMUM_QUESTION_COUNT / CATEGORIES.length) {
      throw new Error(`${category} needs at least 30 prompts`);
    }
  }

  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`duplicate id ${record.id}`);
    ids.add(record.id);

    const promptKey = normalize(record.prompt);
    if (prompts.has(promptKey)) throw new Error(`duplicate prompt ${record.prompt}`);
    prompts.add(promptKey);

    if (!Array.isArray(record.answers) || record.answers.length < MINIMUM_FAMILY_COUNT) {
      throw new Error(`not enough answers for ${record.id}`);
    }

    const usedKeys = new Map();
    for (const [answerIndex, answer] of record.answers.entries()) {
      if (!Array.isArray(answer.aliases) || answer.aliases.length < MINIMUM_ALIAS_COUNT) {
        throw new Error(`not enough aliases for ${record.id} answer ${answerIndex + 1}`);
      }
      if (answer.aliases.some((alias) => /(?:choice|response)$/i.test(alias.trim()))) {
        throw new Error(`synthetic alias for ${record.id} answer ${answerIndex + 1}`);
      }

      const acceptedKeys = new Set(
        [answer.label, ...answer.aliases].flatMap((surface) => [...answerKeys(surface)]),
      );
      if (acceptedKeys.size < MINIMUM_ACCEPTED_KEY_COUNT) {
        throw new Error(`not enough accepted keys for ${record.id} answer ${answerIndex + 1}`);
      }
      for (const key of acceptedKeys) {
        if (usedKeys.has(key)) {
          throw new Error(`expanded answer-key collision for ${record.id}: ${key}`);
        }
        usedKeys.set(key, answerIndex);
      }
    }

    const share = record.answers.reduce((total, answer) => total + answer.share, 0);
    if (Math.abs(share - 100) > SHARE_TOLERANCE) {
      throw new Error(`shares for ${record.id} total ${share}`);
    }
  }
  return records;
};

export const writeQuestionBank = (outputPath = OUTPUT_PATH) => {
  const records = validateQuestionBank(buildQuestionBank());
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  return records;
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeQuestionBank();
  console.log(`Generated crowd atlas at ${OUTPUT_PATH}`);
}
