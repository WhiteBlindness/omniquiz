import type { Metadata } from "next";

import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — OMNIQUIZ",
  description: "What OMNIQUIZ stores in your browser and what it sends to its server.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="29 September 2026">
      <h2>Summary</h2>
      <p>
        OMNIQUIZ needs no account, email address or payment details. It has no
        analytics, advertising or third-party scripts. The game keeps your settings,
        statistics and current run in your own browser.
      </p>

      <h2>What is stored in your browser</h2>
      <p>
        Your theme, sound setting, statistics and the run you are playing are kept in
        your browser&apos;s local storage so a refresh does not lose them. OMNIQUIZ
        sets no cookies. The exact entries are listed on the{" "}
        <a href="/cookies">Cookie Policy</a> page.
      </p>

      <h2>What is sent to the server</h2>
      <p>
        To start a run, your browser asks the OMNIQUIZ server for prompts, sending
        the game mode, the pack, an optional category filter and prompt count, and
        either the date or a run number. To score an answer, it sends the prompt
        identifier and the text you typed (up to 120 characters). The server compares
        the text with the answer atlas and returns the result. The server does not
        store submitted answers and does not attach an account or persistent
        identifier to them. The answers you type are also kept in your own browser
        as part of your current run, as described above.
      </p>

      <h2>Hosting</h2>
      <p>
        OMNIQUIZ is delivered by a hosting provider. Like any web service,
        the infrastructure that serves the site handles technical request data such
        as your IP address and browser details in order to deliver pages and keep the
        service secure. The application itself is not configured to log or analyse
        that data.
      </p>

      <h2>Third parties</h2>
      <p>
        OMNIQUIZ loads its fonts, images and scripts from its own address only. It
        embeds no social media widgets, analytics, advertising or other third-party
        content.
      </p>

      <h2>Your choices</h2>
      <p>
        Because the application holds no account or profile about you, there is
        nothing to look up or delete on its side. You can clear everything the game
        keeps on your device from your browser&apos;s site-data settings.
      </p>

      <h2>Operator and contact</h2>
      <p>
        The operator&apos;s identity and contact details are not yet published on this
        site.
      </p>

      <h2>Changes to this policy</h2>
      <p>The date at the top of this page shows when it last changed.</p>
    </LegalPage>
  );
}
