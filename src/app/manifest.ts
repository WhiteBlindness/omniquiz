import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OMNIQUIZ — Dive Control",
    short_name: "OMNIQUIZ",
    description: "A free trivia game where uncommon answers score higher. Daily challenge, unlimited, speed run, and survival modes.",
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
