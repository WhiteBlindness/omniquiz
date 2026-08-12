import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "OMNIQUIZ — The Daily Dive",
  description: "Seven prompts. One descent. Rarer answers sink deeper.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Visual contract: retro pixel ocean, centered title/boat/waterline, submerged fixed CTA, HUD/game loop, and OMNIQUIZ brand. */}
        {children}
      </body>
    </html>
  );
}
