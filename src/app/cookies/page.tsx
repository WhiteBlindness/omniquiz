import type { Metadata } from "next";

import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy — OMNIQUIZ",
  description: "How OMNIQUIZ uses cookies and browser storage.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="14 September 2025">
      <h2>Does OMNIQUIZ Use Cookies?</h2>
      <p>
        No. OMNIQUIZ does not set any HTTP cookies. We do not use session
        cookies, authentication cookies, tracking cookies, or any other type
        of cookie.
      </p>

      <h2>Local Storage</h2>
      <p>
        Instead of cookies, OMNIQUIZ uses your browser&apos;s local storage API to
        save two small preferences on your device:
      </p>
      <ul>
        <li>
          <strong>Theme preference</strong> — whether you chose dark or light
          mode (key: <code>omniquiz-theme-v1</code>).
        </li>
        <li>
          <strong>Sound preference</strong> — whether you muted sound effects
          (key: <code>omniquiz-mute-v1</code>).
        </li>
        <li>
          <strong>Game statistics</strong> — your personal best scores and play
          counts, stored locally to show your history
          (key: <code>omniquiz-stats-v1</code>).
        </li>
      </ul>

      <h2>How Local Storage Differs from Cookies</h2>
      <p>
        Unlike cookies, local storage data is never automatically sent to a server
        with each request. It stays entirely on your device. Only JavaScript
        running on this site can read it. It cannot be used to track you across
        other websites.
      </p>

      <h2>Clearing Stored Data</h2>
      <p>
        You can clear all locally stored data at any time through your
        browser&apos;s settings (usually under &quot;Site Data&quot; or
        &quot;Storage&quot;). Clearing this data will reset your theme and sound
        preferences to their defaults.
      </p>

      <h2>Third-Party Cookies</h2>
      <p>
        OMNIQUIZ does not load any third-party scripts, analytics, or advertising
        services that would set their own cookies. Your browser will not receive
        any cookies from visiting this site.
      </p>

      <h2>Cookie Consent</h2>
      <p>
        Since OMNIQUIZ does not use cookies and only stores essential preferences
        via local storage, a cookie consent banner is not legally required under
        most regulations. We display a brief storage notice on your first visit
        for transparency.
      </p>

      <h2>Changes</h2>
      <p>
        If we begin using cookies in the future, we will update this policy and
        implement appropriate consent mechanisms before doing so.
      </p>
    </LegalPage>
  );
}
