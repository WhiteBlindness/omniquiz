export const CATEGORIES = [
  "General",
  "Science",
  "Geography",
  "History",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const RARITY_TIERS = [
  "plankton",
  "tooclever",
  "schooler",
  "rare",
  "deepcut",
  "krillion",
] as const;

export type RarityTier = (typeof RARITY_TIERS)[number];

export type Rarity = Readonly<{
  tier: RarityTier;
  score: number;
  depth: number;
}>;

export const RARITY_RULES = Object.freeze({
  plankton: Object.freeze({ tier: "plankton", score: 10, depth: 0.08 }),
  tooclever: Object.freeze({ tier: "tooclever", score: 15, depth: 0.18 }),
  schooler: Object.freeze({ tier: "schooler", score: 30, depth: 0.36 }),
  rare: Object.freeze({ tier: "rare", score: 60, depth: 0.6 }),
  deepcut: Object.freeze({ tier: "deepcut", score: 85, depth: 0.82 }),
  krillion: Object.freeze({ tier: "krillion", score: 100, depth: 0.97 }),
} satisfies Readonly<Record<RarityTier, Rarity>>);

export type Question = Readonly<{
  id: string;
  category: Category;
  prompt: string;
  canonicalAnswer: string;
  acceptedAliases: readonly string[];
  difficulty: Difficulty;
  rarity: Rarity;
}>;

export type PublicQuestion = Readonly<{
  id: string;
  category: Category;
  prompt: string;
  difficulty: Difficulty;
  rarity: Rarity;
}>;
