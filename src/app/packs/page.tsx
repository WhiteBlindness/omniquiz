import Link from "next/link";

import { PacksControls } from "../../components/PacksControls";
import { PACK_LIST, packHref, type PackMeta } from "../../lib/packs/meta";
import { SiteFooter } from "../../components/SiteFooter";
import { ThemeShell } from "../../components/ThemeShell";

export const metadata = {
  title: "OMNIQUIZ — Themed Packs",
  description: "Themed content packs for OMNIQUIZ. Each pack has its own prompts and answer atlas.",
};

const SHOWCASE_PACKS = PACK_LIST.filter((pack) => pack.art !== null);

function PackCard({ pack }: Readonly<{ pack: PackMeta }>) {
  const live = pack.status === "live" && pack.defaultMode !== null;
  const className = `pack-card pack-${pack.art} ${live ? "" : "pack-disabled"}`;
  const state = live ? "NOW SHOWING" : "COMING SOON";
  const action = live ? "CHOOSE A MODE" : "COMING SOON";
  const content = (
    <>
      <div className="pack-art" aria-hidden="true">
        <span className="pack-sun" />
        <span className="pack-horizon" />
        <span className="pack-beam pack-beam-left" />
        <span className="pack-beam pack-beam-right" />
        <span className="pack-silhouette" />
      </div>
      <span className="pack-state">{state}</span>
      <div className="pack-copy">
        <h2>{pack.title}</h2>
        <p>{pack.cardDetail}</p>
        <span className="pack-action">{action}</span>
      </div>
    </>
  );

  if (live && pack.defaultMode) {
    return (
      <Link
        className={className}
        href={packHref(pack.id, pack.defaultMode)}
        aria-label={`${pack.title}: play`}
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
    <ThemeShell className="packs-page">
      <PacksControls />
      <header className="packs-header">
        <Link className="packs-brand" href="/" aria-label="Return to today's dive">OMNIQUIZ</Link>
        <p>THEMED PACKS · PICK YOUR ROUTE</p>
      </header>

      <section className="pack-list" aria-labelledby="packs-heading">
        <h1 id="packs-heading" className="sr-only">Themed packs</h1>
        {SHOWCASE_PACKS.map((pack) => <PackCard key={pack.id} pack={pack} />)}
      </section>

      <p className="packs-coming">MORE ROUTES COMING SOON_</p>

      <section className="logbook" aria-labelledby="logbook-title">
        <div>
          <p className="logbook-kicker" id="logbook-title">THE LOGBOOK</p>
          <p className="logbook-copy">YOUR RUNS, KEPT</p>
          <small>Stats and your current run stay in this browser. There is no account or cloud sync.</small>
        </div>
      </section>

      <Link className="back-dive" href="/">TODAY&apos;S DIVE</Link>
      <SiteFooter />
    </ThemeShell>
  );
}
