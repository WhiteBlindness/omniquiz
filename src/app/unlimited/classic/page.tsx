import { GameExperience } from "../../../components/game/GameExperience";
import { CATEGORIES, type Category } from "../../../lib/questions/types";

export const metadata = {
  title: "OMNIQUIZ — Arcade Expedition",
  description: "Fifteen prompts per expedition, as many expeditions as you like. Uncommon answers score higher.",
  openGraph: {
    title: "OMNIQUIZ — Arcade Expedition",
    description: "Fifteen prompts per expedition, as many expeditions as you like. Uncommon answers score higher.",
  },
};

type UnlimitedClassicPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

const getCategory = (value: string | string[] | undefined): Category | undefined =>
  typeof value === "string" && (CATEGORIES as readonly string[]).includes(value)
    ? value as Category
    : undefined;

export default async function UnlimitedClassicPage({
  searchParams,
}: UnlimitedClassicPageProps) {
  const params = await searchParams;
  return <GameExperience mode="unlimited" category={getCategory(params.category)} />;
}
