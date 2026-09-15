import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #020711 0%, #041a2e 60%, #062533 100%)",
          fontFamily: "monospace",
          position: "relative",
          borderRadius: "22%",
          overflow: "hidden",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#48c9b0",
          }}
        />
        {/* Letter Q */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#edf7f7",
            fontSize: 280,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textShadow: "0 0 40px rgba(72, 201, 176, 0.3)",
          }}
        >
          Q
        </div>
        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#ff667f",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
