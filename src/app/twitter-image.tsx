import { ImageResponse } from "next/og";

export const alt = "OMNIQUIZ — A free trivia game where uncommon answers score higher";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #020711 0%, #041a2e 50%, #062533 100%)",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(91,226,239,0.03) 0px, rgba(91,226,239,0.03) 1px, transparent 1px, transparent 3px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#5be2ef",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#ff667f",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#edf7f7",
            letterSpacing: "-0.02em",
            textShadow: "0 0 40px rgba(91,226,239,0.3)",
          }}
        >
          OMNIQUIZ
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#5be2ef",
            letterSpacing: "0.15em",
            marginTop: 16,
          }}
        >
          UNCOMMON ANSWERS SCORE HIGHER
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 48,
          }}
        >
          {[
            { label: "DAILY", accent: "#5be2ef" },
            { label: "UNLIMITED", accent: "#5be2ef" },
            { label: "SPEED", accent: "#b43cff" },
            { label: "SURVIVAL", accent: "#ff667f" },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: m.accent,
                fontSize: 16,
                letterSpacing: "0.12em",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: m.accent,
                  display: "flex",
                }}
              />
              {m.label}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 28,
            display: "flex",
            color: "rgba(159,182,190,0.6)",
            fontSize: 16,
            letterSpacing: "0.2em",
          }}
        >
          OMNIQUIZ.COM · FREE · NO ACCOUNT REQUIRED
        </div>
      </div>
    ),
    { ...size },
  );
}
