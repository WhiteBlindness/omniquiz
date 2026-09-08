import Link from "next/link";

import { PacksControls } from "../components/PacksControls";
import { ThemeShell } from "../components/ThemeShell";

export default function NotFound() {
  return (
    <ThemeShell className="packs-page not-found-page">
      <PacksControls />
      <div className="not-found-content">
        <p className="not-found-code">404</p>
        <h1 className="not-found-heading">SIGNAL LOST</h1>
        <p className="not-found-body">
          The ROV cannot locate this depth coordinate.
          <br />
          Return to charted waters.
        </p>
        <div className="not-found-actions">
          <Link href="/" className="not-found-primary">
            RETURN TO DIVE CONTROL
          </Link>
          <Link href="/packs" className="back-dive not-found-secondary">
            THEMED PACKS
          </Link>
        </div>
      </div>
    </ThemeShell>
  );
}
