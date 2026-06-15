import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ClawShield — Safety Standard for AI Agents That Touch Money";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "linear-gradient(135deg, #030305 0%, #0a1a14 50%, #030305 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: "linear-gradient(135deg, #10b981, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 24 24" width="36" height="36" fill="#030305">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
            </svg>
          </div>
          <span style={{ fontSize: 56, fontWeight: 700, color: "#10b981" }}>ClawShield</span>
        </div>
        <p style={{ fontSize: 28, color: "#94a3b8", textAlign: "center", maxWidth: 800 }}>
          The ISO-style safety and reputation layer for autonomous agents that touch money
        </p>
        <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
          {["Guard", "Black Box", "Verified"].map((pill) => (
            <span
              key={pill}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                border: "1px solid #10b98140",
                color: "#10b981",
                fontSize: 18,
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
