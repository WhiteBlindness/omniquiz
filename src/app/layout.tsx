import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@fontsource-variable/pixelify-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "OMNIQUIZ — Dive Control",
  description: "Choose a daily expedition or a 15-round sudden-death arcade dive.",
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
