import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Jarz Digital — Local SEO, Web Development & Digital Marketing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share card, generated at build time with the brand mark. */
export default async function OpengraphImage() {
  const mark = await readFile(path.join(process.cwd(), "public/images/brand/mark.png"));
  const src = `data:image/png;base64,${mark.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 85% 10%, rgba(0,175,185,0.35), transparent 45%), #03060b",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={72} height={72} alt="" />
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>Jarz Digital</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>We build digital experiences</span>
          <span style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, color: "#52d4dc" }}>that grow businesses.</span>
        </div>
        <div style={{ display: "flex", gap: 28, fontSize: 26, color: "rgba(255,255,255,0.6)" }}>
          <span>Local SEO</span>
          <span>·</span>
          <span>Web Development</span>
          <span>·</span>
          <span>Google Ads</span>
          <span>·</span>
          <span>Dallas · Denver · Calgary · Dhaka</span>
        </div>
      </div>
    ),
    size,
  );
}
