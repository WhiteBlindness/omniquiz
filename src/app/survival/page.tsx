import { GameExperience } from "../../components/game/GameExperience";
import { CATEGORIES, type Category } from "../../lib/questions/types";

export const metadata = {
  title: "OMNIQUIZ — Survival",
  description: "Three lives. Every miss costs one. How far can you go?",
};

type SurvivalPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

const getCategory = (value: string | string[] | undefined): Category | undefined =>
  typeof value === "string" && (CATEGORIES as readonly string[]).includes(value)
    ? value as Category
    : undefined;

export default async function SurvivalPage({
  searchParams,
}: SurvivalPageProps) {
  const params = await searchParams;
  return <GameExperience mode="survival" category={getCategory(params.category)} />;
}
