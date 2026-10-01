import { GameExperience } from "../../components/game/GameExperience";
import { CATEGORIES, type Category } from "../../lib/questions/types";

export const metadata = {
  title: "OMNIQUIZ — Speed Run",
  description: "Ten prompts. Eight seconds each. Streak multipliers reward momentum.",
  openGraph: {
    title: "OMNIQUIZ — Speed Run",
    description: "Ten prompts. Eight seconds each. Streak multipliers reward momentum.",
  },
};

type SpeedRunPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

const getCategory = (value: string | string[] | undefined): Category | undefined =>
  typeof value === "string" && (CATEGORIES as readonly string[]).includes(value)
    ? value as Category
    : undefined;

export default async function SpeedRunPage({
  searchParams,
}: SpeedRunPageProps) {
  const params = await searchParams;
  return <GameExperience mode="speed" category={getCategory(params.category)} />;
}
