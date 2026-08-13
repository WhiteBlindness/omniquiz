import Link from "next/link";

const PACKS = [
  {
    title: "AT THE MOVIES",
    detail: "15 broad prompts · a night drive down the boulevard",
    action: "TAKE THE DRIVE",
    categoryLabel: "PLAYABLE AS HISTORY",
    href: "/unlimited/classic?category=History",
    state: "NOW SHOWING",
    art: "movies",
  },
  {
    title: "SPORTS",
    detail: "15 broad prompts · run the gauntlet, court to podium",
    action: "TAKE THE TUNNEL",
    categoryLabel: "PLAYABLE AS GENERAL",
    href: "/unlimited/classic?category=General",
    state: "GAME ON",
    art: "sports",
  },
  {
    title: "MUSIC",
    detail: "from the charts to the deep cuts",
    action: "COMING SOON",
    categoryLabel: undefined,
    href: undefined,
    state: "COMING SOON",
    art: "music",
  },
] as const;

export const metadata = {
  title: "OMNIQUIZ — Themed Packs",
  description: "Themed dives beyond the daily question set.",
};

type Pack = (typeof PACKS)[number];

function PackCard({ pack }: Readonly<{ pack: Pack }>) {
  const className = `pack-card pack-${pack.art} ${pack.art === "music" ? "pack-disabled" : ""}`;
  const content = (
    <>
      <div className="pack-art" aria-hidden="true">
        <span className="pack-sun" />
        <span className="pack-horizon" />
        <span className="pack-beam pack-beam-left" />
        <span className="pack-beam pack-beam-right" />
        <span className="pack-silhouette" />
      </div>
      <span className="pack-state">{pack.state}</span>
      <div className="pack-copy">
        <h2>{pack.title}</h2>
        <p>{pack.detail}</p>
        <span className="pack-action">
          {pack.categoryLabel ? `${pack.categoryLabel} / ` : null}{pack.action}
        </span>
      </div>
    </>
  );

  if (pack.href) {
    return (
      <Link
        className={className}
        href={pack.href}
        aria-label={`${pack.title}: ${pack.categoryLabel}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={className}>
      {content}
    </article>
  );
}

export default function PacksPage() {
  return (
    <main className="packs-page">
      <header className="packs-header">
        <Link className="packs-brand" href="/" aria-label="Return to today's dive">OMNIQUIZ</Link>
        <p>THEMED PACKS · BEYOND THE DAILY DIVE</p>
      </header>

      <section className="pack-list" aria-labelledby="packs-heading">
        <h1 id="packs-heading" className="sr-only">Themed packs</h1>
        {PACKS.map((pack) => <PackCard key={pack.title} pack={pack} />)}
      </section>

      <p className="packs-coming">MORE PACKS ARE BEING CHARTED_</p>

      <section className="logbook" aria-labelledby="logbook-title">
        <div>
          <p className="logbook-kicker" id="logbook-title">THE LOGBOOK</p>
          <p className="logbook-copy">YOUR UNLOCKS, KEPT</p>
          <small>Progress stays in this browser; cloud restore is unavailable.</small>
        </div>
        <button
          type="button"
          className="restore-button"
          disabled
          aria-label="Local only — cloud restore unavailable"
        >
          LOCAL ONLY
        </button>
      </section>

      <Link className="back-dive" href="/">TODAY&apos;S DIVE</Link>
    </main>
  );
}
