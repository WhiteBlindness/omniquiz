"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { PacksControls } from "./PacksControls";
import { SiteFooter } from "./SiteFooter";
import { ThemeShell } from "./ThemeShell";

export function LegalPage({
  title,
  lastUpdated,
  children,
}: Readonly<{
  title: string;
  lastUpdated: string;
  children: ReactNode;
}>) {
  return (
    <ThemeShell className="packs-page legal-page">
      <PacksControls />
      <div className="legal-content">
        <Link href="/" className="legal-back" aria-label="Back to OMNIQUIZ">
          OMNIQUIZ
        </Link>
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: {lastUpdated}</p>
        {children}
      </div>
      <SiteFooter />
    </ThemeShell>
  );
}
