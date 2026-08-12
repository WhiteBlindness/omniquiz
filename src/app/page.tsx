import { connection } from "next/server";

import { GameExperience } from "../components/game/GameExperience";

const getUtcDayOfYear = (date: Date): number => {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  const currentDay = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return Math.floor((currentDay - startOfYear) / 86_400_000) + 1;
};

export default async function Home() {
  await connection();
  const dayOfYear = getUtcDayOfYear(new Date());

  return <GameExperience mode="daily" dailyLabel={`DIVE #${dayOfYear}`} />;
}
