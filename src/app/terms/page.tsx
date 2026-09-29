import type { Metadata } from "next";

import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions — OMNIQUIZ",
  description: "Terms and conditions for using the OMNIQUIZ trivia game.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms &amp; Conditions" lastUpdated="29 September 2026">
      <h2>Using OMNIQUIZ</h2>
      <p>
        OMNIQUIZ is a free, browser-based trivia game provided as is, without
        warranties of any kind. By using it you agree to these terms.
      </p>

      <h2>Fair use</h2>
      <p>
        Please use OMNIQUIZ as a game. Do not interfere with the service, look for
        vulnerabilities to exploit, or use automated tools to submit answers or to
        bulk-copy the prompts and answer data.
      </p>

      <h2>Content and names</h2>
      <p>
        You are welcome to share your results. Film titles, character names,
        personal names and other names that appear in prompts and answers belong to
        their respective owners. They are used only to identify the works or people
        concerned and do not imply any affiliation with or endorsement by them.
      </p>

      <h2>Answer shares are estimates</h2>
      <p>
        The share shown for an answer comes from a curated atlas. It is an
        editorial estimate for gameplay, not the result of a live poll or survey.
      </p>

      <h2>No account or payment</h2>
      <p>
        OMNIQUIZ is free to play and needs no registration. It has no purchases,
        subscriptions or premium tiers, so no refund policy applies.
      </p>

      <h2>Availability</h2>
      <p>
        OMNIQUIZ may be unavailable at times, for example during maintenance or
        updates, and access is not guaranteed.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent the law allows, the operator is not liable for indirect or
        consequential loss arising from use of this free entertainment service.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may change. The date at the top of this page shows when they
        last changed.
      </p>

      <h2>Operator, governing law and contact</h2>
      <p>
        The operator&apos;s identity, contact details and governing-law information
        are not yet published on this site.
      </p>
    </LegalPage>
  );
}
