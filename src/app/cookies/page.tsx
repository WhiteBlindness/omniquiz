import type { Metadata } from "next";

import { LegalPage } from "../../components/LegalPage";
import { STORAGE_REGISTRY } from "../../lib/storage/registry";

export const metadata: Metadata = {
  title: "Cookie Policy — OMNIQUIZ",
  description: "How OMNIQUIZ uses cookies and browser storage.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="29 September 2026">
      <h2>Cookies</h2>
      <p>
        OMNIQUIZ does not set any cookies. It has no login, no advertising and no
        analytics, and it loads no scripts, fonts or images from other websites, so
        no other party sets cookies through it either.
      </p>

      <h2>Browser storage we use</h2>
      <p>
        To let the game remember your settings and progress, OMNIQUIZ writes a small
        amount of data to your browser&apos;s local storage. It is stored on your
        device and is not sent to the OMNIQUIZ server with your requests.
      </p>
      <ul>
        {STORAGE_REGISTRY.map((entry) => (
          <li key={entry.key}>
            <code>{entry.key}</code> — {entry.purpose}
          </li>
        ))}
      </ul>

      <h2>Why there is no consent choice</h2>
      <p>
        This storage exists only so the game you asked to play can remember your
        settings and keep your run. It is not used for tracking, profiling or
        advertising. The notice shown on your first visit is informational: it
        tells you what is stored and links here.
      </p>

      <h2>Clearing stored data</h2>
      <p>
        You can remove all of this at any time from your browser&apos;s site-data
        settings. Doing so resets your theme and sound settings, your statistics and
        any run in progress.
      </p>

      <h2>Changes</h2>
      <p>
        If OMNIQUIZ ever adds cookies or non-essential storage, this page will be
        updated and any required choice will be offered before that storage is used.
      </p>
    </LegalPage>
  );
}
