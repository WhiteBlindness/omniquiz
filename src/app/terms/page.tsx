import type { Metadata } from "next";

import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions — OMNIQUIZ",
  description: "Terms and conditions for using the OMNIQUIZ trivia game.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms &amp; Conditions" lastUpdated="14 September 2025">
      <h2>Acceptance of Terms</h2>
      <p>
        By accessing and using OMNIQUIZ, you agree to be bound by these terms and
        conditions. If you do not agree, please do not use the service.
      </p>

      <h2>Description of Service</h2>
      <p>
        OMNIQUIZ is a free, browser-based trivia game. The service is provided
        &quot;as is&quot; without warranties of any kind, either express or implied.
      </p>

      <h2>User Conduct</h2>
      <p>
        You agree to use OMNIQUIZ for its intended purpose as a trivia game. You
        may not attempt to interfere with the service, exploit vulnerabilities,
        or use automated tools to submit answers.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        All content, design, code, and visual assets of OMNIQUIZ are protected by
        copyright. The trivia questions and crowd atlas data are proprietary.
        You may share your scores but may not reproduce or redistribute game content.
      </p>

      <h2>No Account or Payment</h2>
      <p>
        OMNIQUIZ is entirely free to play and does not require registration. There
        are no in-app purchases, subscriptions, or premium tiers. As no payment is
        accepted, no refund policy is applicable.
      </p>

      <h2>Availability</h2>
      <p>
        We aim to keep OMNIQUIZ available but do not guarantee uninterrupted access.
        The service may be temporarily unavailable for maintenance or updates.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        OMNIQUIZ and its operators shall not be liable for any indirect, incidental,
        or consequential damages arising from the use of this service. The service
        is a free entertainment product with no financial stakes.
      </p>

      <h2>Modifications</h2>
      <p>
        We reserve the right to modify these terms at any time. Changes take effect
        when posted on this page. Continued use constitutes acceptance.
      </p>

      <h2>Governing Law</h2>
      <p>
        These terms are governed by applicable law. Any disputes shall be resolved
        in accordance with the relevant jurisdiction.
      </p>

      <h2>Contact</h2>
      <p>
        For questions regarding these terms, please visit our website for contact
        information.
      </p>
    </LegalPage>
  );
}
