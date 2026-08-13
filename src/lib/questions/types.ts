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

export type Question = Readonly<{
  id: string;
  category: Category;
  prompt: string;
  answers: readonly AnswerFamily[];
}>;

export type PublicQuestion = Readonly<{
  id: string;
  category: Category;
  prompt: string;
}>;
