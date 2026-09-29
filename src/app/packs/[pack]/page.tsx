import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameExperience } from "../../../components/game/GameExperience";
import { getLivePackBySlug, resolvePackMode } from "../../../lib/packs/meta";

type PackPageProps = Readonly<{
  params: Promise<{ pack: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export async function generateMetadata({ params }: PackPageProps): Promise<Metadata> {
  const { pack: slug } = await params;
  const pack = getLivePackBySlug(slug);
  if (!pack) return { title: "OMNIQUIZ — Themed Packs" };
  return {
    title: `OMNIQUIZ — ${pack.title}`,
    description: pack.intro,
    openGraph: { title: `OMNIQUIZ — ${pack.title}`, description: pack.intro },
  };
}

export default async function PackPage({ params, searchParams }: PackPageProps) {
  const { pack: slug } = await params;
  const pack = getLivePackBySlug(slug);
  if (!pack) notFound();

  const query = await searchParams;
  const requestedMode = typeof query.mode === "string" ? query.mode : undefined;
  return <GameExperience mode={resolvePackMode(pack, requestedMode)} pack={pack.id} />;
}
