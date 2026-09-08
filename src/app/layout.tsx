import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/pixelify-sans";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020711" },
    { media: "(prefers-color-scheme: light)", color: "#edf7f5" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  title: "OMNIQUIZ — Dive Control",
  description: "Explore broad prompts, crowd rarity, and a pixel-ocean descent.",
  openGraph: {
    title: "OMNIQUIZ",
    description: "A cinematic 16-bit ROV mission broadcast where uncommon answers drive a visible descent.",
    type: "website",
    siteName: "OMNIQUIZ",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
