import type { Metadata } from "next";

import { LegalPage } from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — OMNIQUIZ",
  description: "How OMNIQUIZ handles your data and protects your privacy.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="14 September 2025">
      <h2>What We Collect</h2>
      <p>
        OMNIQUIZ does not require an account, login, or any personal information to play.
        We do not collect names, email addresses, phone numbers, or payment details.
      </p>

      <h2>Local Storage</h2>
      <p>
        We use your browser&apos;s local storage to remember two preferences: your
        chosen theme (dark or light) and your sound setting (on or off). These
        preferences never leave your device and are not transmitted to any server.
      </p>

      <h2>Game Data</h2>
      <p>
        Your answers are sent to our server solely to check them against the crowd
        atlas and return a score. We do not store your answers after the response
        is sent. Aggregate crowd statistics are maintained without any link to
        individual players.
      </p>

      <h2>Cookies</h2>
      <p>
        OMNIQUIZ does not set any cookies. We use browser local storage for the
        two preferences described above. See our{" "}
        <a href="/cookies">Cookie Policy</a> for details.
      </p>

      <h2>Analytics and Tracking</h2>
      <p>
        We do not use any third-party analytics, tracking pixels, advertising
        scripts, or fingerprinting technologies. There is no Google Analytics,
        Facebook Pixel, or similar service running on this site.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        OMNIQUIZ does not embed any third-party content, social media widgets,
        or external scripts beyond the font files required for display.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        OMNIQUIZ is a general-knowledge trivia game suitable for all ages. Since
        we do not collect any personal data, there is no special risk to children
        using this service.
      </p>

      <h2>Data Retention</h2>
      <p>
        Since we do not collect personal data, there is nothing to retain or
        delete. Your local storage preferences can be cleared at any time through
        your browser settings.
      </p>

      <h2>Your Rights</h2>
      <p>
        Under GDPR, CCPA, and similar regulations, you have rights regarding your
        personal data. Since OMNIQUIZ does not collect personal data, these rights
        are inherently fulfilled. If you have questions, contact us at the address
        below.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        If we make changes to this privacy policy, we will update the date at the
        top of this page. Continued use of OMNIQUIZ after changes constitutes
        acceptance of the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        If you have questions about this privacy policy, you can reach us by
        visiting our website and using the contact information provided there.
      </p>
    </LegalPage>
  );
}
