import Link from "next/link";

import { PACK_LIST, packHref, type PackMeta } from "../lib/packs/meta";

const MODE_LABEL = {
  daily: "DAILY",
  unlimited: "UNLIMITED",
  speed: "SPEED",
  survival: "SURVIVAL",
} as const;

const EYEBROW: Readonly<Record<string, string>> = {
  core: "THE MAIN GAME",
  movies: "OPEN LATE",
};

type WorldCardProps = Readonly<{
  pack: PackMeta;
  variant: "feature" | "compact";
}>;

function WorldArt({ pack }: Readonly<{ pack: PackMeta }>) {
  return (
    <div className={`world-art world-art-${pack.id}`} aria-hidden="true">
      <span className="world-layer world-layer-back" />
      <span className="world-layer world-layer-mid" />
      <span className="world-layer world-layer-front" />
      <span className="world-glow" />
    </div>
  );
}

export function WorldCard({ pack, variant }: WorldCardProps) {
  const live = pack.status === "live" && pack.defaultMode !== null;
  const className = `world-card world-${pack.id} world-${variant} ${live ? "is-live" : "is-planned"}`;
  const body = (
    <>
      <WorldArt pack={pack} />
      <div className="world-body">
        <span className="world-eyebrow">{live ? EYEBROW[pack.id] : "COMING SOON"}</span>
        <h2 className="world-title">{pack.title}</h2>
        {variant === "feature" || !live ? <p className="world-detail">{pack.cardDetail}</p> : null}
        {live ? (
          <ul className="world-modes" aria-label="Game modes">
            {pack.modes.map((mode) => <li key={mode}>{MODE_LABEL[mode]}</li>)}
          </ul>
        ) : null}
        <span className="world-action">{live ? `PLAY ${pack.id === "core" ? "THE MAIN GAME" : pack.shortName.toUpperCase()}` : "IN DEVELOPMENT"}</span>
      </div>
    </>
  );

  if (live && pack.defaultMode) {
    return (
      <Link className={className} href={packHref(pack.id, pack.defaultMode)}>
        {body}
      </Link>
    );
  }
  return <article className={className} aria-label={`${pack.title}, coming soon`}>{body}</article>;
}

export function WorldCards({ variant }: Readonly<{ variant: "feature" | "compact" }>) {
  return (
    <>
      {PACK_LIST.map((pack) => <WorldCard key={pack.id} pack={pack} variant={variant} />)}
    </>
  );
}
