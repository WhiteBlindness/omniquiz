import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OMNIQUIZ — Dive Control",
    short_name: "OMNIQUIZ",
    description: "A cinematic 16-bit ROV mission broadcast where uncommon answers drive a visible descent.",
    start_url: "/",
    display: "standalone",
    background_color: "#020711",
    theme_color: "#020711",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
