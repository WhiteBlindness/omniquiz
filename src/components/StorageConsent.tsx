"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled && !hasConsented()) setVisible(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_KEY, "1");
    } catch { /* noop */ }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") accept();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, accept]);

  if (!visible) return null;

  return (
    <div className="consent-banner" role="region" aria-label="Storage notice">
      <p>
        OMNIQUIZ keeps your theme, sound setting, stats and current run in this
        browser. It sets no cookies and runs no analytics.{" "}
        <Link href="/cookies">Learn more</Link>
      </p>
      <button className="consent-accept" type="button" onClick={accept}>
        OK
      </button>
    </div>
  );
}
