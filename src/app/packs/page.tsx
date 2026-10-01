import Link from "next/link";

import { PacksControls } from "../../components/PacksControls";
import { WorldCards } from "../../components/WorldCards";
import { SiteFooter } from "../../components/SiteFooter";
import { ThemeShell } from "../../components/ThemeShell";

export const metadata = {
  title: "OMNIQUIZ — Packs",
  description: "Themed content packs for OMNIQUIZ. Each pack has its own prompts and answer atlas.",
};

export default function PacksPage() {
  return (
    <ThemeShell className="packs-page">
      <PacksControls />
      <header className="packs-header">
        <Link className="packs-brand" href="/" aria-label="OMNIQUIZ home">OMNIQUIZ</Link>
        <p>CHOOSE A WORLD</p>
      </header>

      <section className="worlds-section" aria-labelledby="packs-heading">
        <h1 id="packs-heading" className="sr-only">Choose a world</h1>
        <div className="worlds-grid">
          <WorldCards variant="feature" />
        </div>
      </section>

      <section className="logbook" aria-labelledby="logbook-title">
        <div>
          <p className="logbook-kicker" id="logbook-title">SAVED ON THIS DEVICE</p>
          <p className="logbook-copy">RUN HISTORY</p>
          <small>Stats and your current run stay in this browser. There is no account or cloud sync.</small>
        </div>
      </section>

      <Link className="back-dive" href="/">TODAY&apos;S EXPEDITION</Link>
      <SiteFooter />
    </ThemeShell>
  );
}
