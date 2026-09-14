"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "omniquiz-storage-consent-v1";

function hasConsented(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "1";
  } catch {
    return true;
  }
}

export function StorageConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsented()) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "1");
    } catch { /* noop */ }
    setVisible(false);
  };

  return (
    <div className="consent-banner" role="dialog" aria-label="Storage notice">
      <p>
        This site stores your theme and sound preferences in your browser.
        No cookies or personal data are collected.{" "}
        <Link href="/cookies">Learn more</Link>
      </p>
      <button className="consent-accept" type="button" onClick={accept}>
        OK
      </button>
    </div>
  );
}
