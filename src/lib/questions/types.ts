export const CATEGORIES = [
  "General",
  "Science",
  "Geography",
  "History",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const RARITY_TIERS = [
  "uncharted",
  "plankton",
  "tooclever",
  "schooler",
  "rare",
  "deepcut",
  "krillion",
] as const;

export type RarityTier = (typeof RARITY_TIERS)[number];

export type AnswerFamily = Readonly<{
  label: string;
  aliases: readonly string[];
  share: number;
  insight: string;
}>;

/** `category` is the pack-scoped topic label; the core pack uses `Category`. */
export type Question = Readonly<{
  id: string;
  category: string;
  prompt: string;
  answers: readonly AnswerFamily[];
}>;

export type PublicQuestion = Readonly<{
  id: string;
  category: string;
  prompt: string;
}>;
