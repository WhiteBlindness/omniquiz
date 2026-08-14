const ARTICLE_WORDS = new Set(["a", "an", "the"]);

const normalizedWords = (answer: string): readonly string[] => {
  if (typeof answer !== "string") return [];

  const folded = answer
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase("en-US");

  return folded.match(/[\p{Letter}\p{Number}]+/gu) ?? [];
};

export const normalizeAnswer = (answer: string): string =>
  normalizedWords(answer).join("");

const withoutLeadingArticle = (words: readonly string[]): readonly string[] =>
  ARTICLE_WORDS.has(words[0] ?? "") ? words.slice(1) : words;

const replaceLastWord = (
  words: readonly string[],
  replacement: string,
): readonly string[] => [...words.slice(0, -1), replacement];

const safeNumberOrWord = (word: string): boolean =>
  word.length > 2 && !/\p{Number}/u.test(word);

const singularAndPluralVariants = (word: string): readonly string[] => {
  if (!safeNumberOrWord(word)) return [];

  if (word.endsWith("ies") && word.length > 4) {
    return [word.slice(0, -3) + "y"];
  }

  if (/(?:ches|shes|xes|zes|ses|oes)$/.test(word) && word.length > 4) {
    return [word.slice(0, -2)];
  }

  if (
    word.endsWith("s") &&
    word.length > 4 &&
    !/(?:ss|us|is|ics|ous|eous)$/.test(word)
  ) {
    return [word.slice(0, -1)];
  }

  if (/[bcdfghjklmnpqrstvwxyz]y$/.test(word)) {
    return [word.slice(0, -1) + "ies"];
  }

  if (/(?:s|x|z|ch|sh)$/.test(word)) {
    return [word + "es"];
  }

  return [word + "s"];
};

const addPhraseKeys = (keys: Set<string>, words: readonly string[]): void => {
  if (words.length === 0) return;

  const add = (candidateWords: readonly string[]) => {
    const key = candidateWords.join("");
    if (key) keys.add(key);
  };

  add(words);
  const lastWord = words.at(-1);
  if (!lastWord) return;

  for (const variant of singularAndPluralVariants(lastWord)) {
    add(replaceLastWord(words, variant));
  }
};

/**
 * Returns a small exact-key set for one answer surface.
 *
 * Keys preserve complete normalized tokens. The only generated alternatives
 * are leading-article removal and conservative final-word singular/plural
 * forms; no substring, edit-distance, or semantic matching is involved.
 */
export const answerKeys = (answer: string): readonly string[] => {
  const words = normalizedWords(answer);
  const bareWords = withoutLeadingArticle(words);
  const keys = new Set<string>();

  addPhraseKeys(keys, words);
  addPhraseKeys(keys, bareWords);

  if (bareWords.length > 0) {
    const bareLastWord = bareWords.at(-1);
    const articlePrefixes = ["a", "an", "the"];
    for (const article of articlePrefixes) {
      const articleWords = [article, ...bareWords];
      addPhraseKeys(keys, articleWords);
      if (bareLastWord) {
        for (const variant of singularAndPluralVariants(bareLastWord)) {
          addPhraseKeys(keys, [article, ...replaceLastWord(bareWords, variant)]);
        }
      }
    }
  }

  return Object.freeze([...keys]);
};
