import Link from "next/link";

import { PacksControls } from "../components/PacksControls";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeShell } from "../components/ThemeShell";

export default function NotFound() {
  return (
    <ThemeShell className="packs-page not-found-page">
      <PacksControls />
      <div className="not-found-sonar" aria-hidden="true">
        <div className="not-found-sonar-sweep" />
      </div>
      <div className="not-found-static" aria-hidden="true" />
      <div className="not-found-content">
        <p className="not-found-code">404</p>
        <h1 className="not-found-heading">SIGNAL LOST</h1>
        <p className="not-found-body">
          This signal cannot be resolved.
          <br />
          Return to a known frequency.
        </p>
        <div className="not-found-actions">
          <Link href="/" className="not-found-primary">
            RETURN TO BASE
          </Link>
          <Link href="/packs" className="back-dive not-found-secondary">
            THEMED PACKS
          </Link>
        </div>
      </div>
      <SiteFooter />
    </ThemeShell>
  );
}
