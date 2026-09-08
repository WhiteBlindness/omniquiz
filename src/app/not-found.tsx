import Link from "next/link";

export default function NotFound() {
  return (
    <main className="packs-page" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
      <div style={{ maxWidth: 420, padding: "2rem 1rem" }}>
        <p
          style={{
            color: "var(--coral)",
            fontSize: "clamp(4rem, 10vw, 7rem)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 0.85,
          }}
        >
          404
        </p>
        <h1
          style={{
            margin: "1.2rem 0 0",
            color: "var(--paper)",
            fontSize: "clamp(1rem, 2.2vw, 1.5rem)",
            letterSpacing: "0.18em",
          }}
        >
          SIGNAL LOST
        </h1>
        <p
          style={{
            margin: "0.8rem 0 0",
            color: "var(--drift)",
            fontSize: "0.68rem",
            lineHeight: 1.6,
            letterSpacing: "0.08em",
          }}
        >
          The ROV cannot locate this depth coordinate.
          <br />
          Return to charted waters.
        </p>
        <div style={{ display: "grid", gap: "0.5rem", marginTop: "1.8rem" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 52,
              border: "1px solid var(--coral)",
              borderBottomWidth: 4,
              background: "#6e2638",
              color: "var(--paper)",
              fontSize: "0.72rem",
              letterSpacing: "0.16em",
            }}
          >
            RETURN TO DIVE CONTROL
          </Link>
          <Link
            href="/packs"
            className="back-dive"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginTop: 0,
            }}
          >
            THEMED PACKS
          </Link>
        </div>
      </div>
    </main>
  );
}
