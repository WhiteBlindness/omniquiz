import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/pixelify-sans";
import "./globals.css";

import { StorageConsent } from "../components/StorageConsent";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020711" },
    { media: "(prefers-color-scheme: light)", color: "#edf7f5" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  title: "OMNIQUIZ — Dive Control",
  description: "A free trivia game where uncommon answers score higher. Four game modes, no account required.",
  openGraph: {
    title: "OMNIQUIZ",
    description: "A free trivia game where uncommon answers score higher. Four game modes, no account required.",
    type: "website",
    siteName: "OMNIQUIZ",
  },
  twitter: {
    card: "summary",
    title: "OMNIQUIZ",
    description: "A free trivia game where uncommon answers score higher. Four game modes, no account required.",
  },
  metadataBase: new URL("https://omniquiz.com"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "OMNIQUIZ",
    url: "https://omniquiz.com",
    description: "A free trivia game where uncommon answers score higher. Four game modes: daily challenge, unlimited, speed run, and survival.",
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    browserRequirements: "Requires JavaScript",
  };
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=JSON.parse(localStorage.getItem("omniquiz-theme-v1"));if(t==="light"||t==="dark"){document.documentElement.dataset.storedTheme=t;document.documentElement.dataset.theme=t}}catch(e){}})()`,
          }}
        />
        <div
          hidden
          data-direction-seed="34a6553c"
          data-direction-style="cinematic 16-bit ROV mission broadcast"
          data-direction-layout="asymmetric telemetry spine with one live mission stage"
          data-direction-effect="depth-driven ocean layers, scanlines, deliberate score and urgency motion"
          data-direction-finish="unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md"
        >
          OMNIQUIZ visual direction contract
        </div>
        {children}
        <StorageConsent />
      </body>
    </html>
  );
}
