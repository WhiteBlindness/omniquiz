import type { GameMode } from "../../components/game/gameReducer";
import { CATEGORIES } from "../questions/types";
import type { EnvironmentId } from "./environment";

export const PACK_IDS = ["core", "movies", "sports", "music"] as const;
export type PackId = (typeof PACK_IDS)[number];
export type PackStatus = "live" | "planned";

export type PackMeta = Readonly<{
  id: PackId;
  slug: string | null;
  shortName: string;
  title: string;
  environment: EnvironmentId;
  status: PackStatus;
  modes: readonly GameMode[];
  defaultMode: GameMode | null;
  topics: readonly string[];
  atlasLabel: string;
  intro: string;
  cardDetail: string;
}>;

export const PACKS: Readonly<Record<PackId, PackMeta>> = Object.freeze({
  core: Object.freeze({
    id: "core",
    slug: null,
    shortName: "Core",
    title: "THE OCEAN DIVE",
    environment: "ocean",
    status: "live",
    modes: Object.freeze(["daily", "unlimited", "speed", "survival"] as const),
    defaultMode: "daily",
    topics: CATEGORIES,
    atlasLabel: "CROWD ATLAS",
    intro: "Broad prompts from the core crowd atlas.",
    cardDetail: "One prompt at a time, sinking deeper with every rare answer.",
  }),
  movies: Object.freeze({
    id: "movies",
    slug: "movies",
    shortName: "Movies",
    title: "AT THE MOVIES",
    environment: "cinema",
    status: "live",
    modes: Object.freeze(["unlimited", "speed", "survival"] as const),
    defaultMode: "unlimited",
    topics: Object.freeze([
      "Genres",
      "Characters",
      "Stars",
      "Franchises",
      "Craft",
      "Movie Night",
    ] as const),
    atlasLabel: "FILM ATLAS",
    intro: "Broad prompts about films, characters, stars and the way movies get made.",
    cardDetail: "Drive a neon boulevard from the city limits to premiere night, answering film prompts on the way.",
  }),
  sports: Object.freeze({
    id: "sports",
    slug: "sports",
    shortName: "Sports",
    title: "SPORTS",
    environment: "stadium",
    status: "planned",
    modes: Object.freeze([] as const),
    defaultMode: null,
    topics: Object.freeze([] as const),
    atlasLabel: "SPORTS ATLAS",
    intro: "",
    cardDetail: "A stadium journey from the city to the arena. In development.",
  }),
  music: Object.freeze({
    id: "music",
    slug: "music",
    shortName: "Music",
    title: "MUSIC",
    environment: "venue",
    status: "planned",
    modes: Object.freeze([] as const),
    defaultMode: null,
    topics: Object.freeze([] as const),
    atlasLabel: "MUSIC ATLAS",
    intro: "",
    cardDetail: "A night-venue journey from the queue to the stage. In development.",
  }),
});

export const PACK_LIST: readonly PackMeta[] = Object.freeze(PACK_IDS.map((id) => PACKS[id]));

export const isPackId = (value: unknown): value is PackId =>
  typeof value === "string" && (PACK_IDS as readonly string[]).includes(value);

export const isLivePackId = (value: unknown): value is PackId =>
  isPackId(value) && PACKS[value].status === "live";

export const getLivePackBySlug = (slug: string): PackMeta | undefined =>
  PACK_LIST.find((pack) => pack.status === "live" && pack.slug !== null && pack.slug === slug);

export const packSupportsMode = (pack: PackId, mode: GameMode): boolean =>
  PACKS[pack].status === "live" && PACKS[pack].modes.includes(mode);

export const isPackTopic = (pack: PackId, topic: unknown): topic is string =>
  typeof topic === "string" && PACKS[pack].topics.includes(topic);

export const resolvePackMode = (pack: PackMeta, requested: unknown): GameMode => {
  if (typeof requested === "string" && pack.modes.some((mode) => mode === requested)) {
    return requested as GameMode;
  }
  return pack.defaultMode ?? "unlimited";
};

const CORE_MODE_ROUTES: Readonly<Record<GameMode, string>> = Object.freeze({
  daily: "/",
  unlimited: "/unlimited/classic",
  speed: "/speed-run",
  survival: "/survival",
});

export const packHref = (pack: PackId, mode: GameMode): string => {
  const meta = PACKS[pack];
  if (meta.id === "core" || meta.slug === null) return CORE_MODE_ROUTES[mode];
  return mode === meta.defaultMode
    ? `/packs/${meta.slug}`
    : `/packs/${meta.slug}?mode=${mode}`;
};
