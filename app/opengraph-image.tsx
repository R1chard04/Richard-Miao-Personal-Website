import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { createTopo } from "./backgrounds/topo";
import { siteUrl } from "./data";

// The picture shown when the site's link is shared (LinkedIn, Slack, iMessage,
// X and so on): the intro over the same topo lines as the page background.
// Next builds it once, at build time.

export const alt = "Richard Miao, software engineer and University of Waterloo student";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The light theme's colours, from :root in globals.css.
const C = { bg: "#faf9f6", text: "#1c1b19", muted: "#6b6862", accent: "#b4441f" };

const HELLO = "Hello there";
const NAME = "Richard Miao";
const LEDE = "Software engineer and University of Waterloo student. I build backend systems and infrastructure, most recently at Cloudflare.";
const HOST = new URL(siteUrl).host;

// Draws the page's topo background into SVG paths instead of a canvas, by
// handing createTopo a stand-in context that records each stroke.
function topoSvg() {
  const r = (n: number) => Math.round(n * 10) / 10;
  const strokes: string[] = [];
  let d = "";
  const ctx = {
    lineWidth: 1,
    strokeStyle: "",
    globalAlpha: 1,
    clearRect() {},
    beginPath() { d = ""; },
    moveTo(x: number, y: number) { d += `M${r(x)} ${r(y)}`; },
    lineTo(x: number, y: number) { d += `L${r(x)} ${r(y)}`; },
    stroke() {
      strokes.push(`<path d="${d}" fill="none" stroke="${ctx.strokeStyle}" stroke-opacity="${ctx.globalAlpha}" stroke-width="1.25"/>`);
    },
  };
  const topo = createTopo({
    ctx: ctx as unknown as CanvasRenderingContext2D,
    w: size.width,
    h: size.height,
    dark: false,
    colors: { dot: C.muted, accent: C.accent },
    mouse: { x: 0, y: 0, active: false },
  });
  topo.reset();
  topo.still();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}">${strokes.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Fetches just the glyphs needed from Google Fonts, as TrueType (the image
// renderer can't read WOFF2). If that fails, the image falls back to the
// renderer's built-in font rather than breaking the build.
async function font(family: string, axes: string, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:${axes}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) throw new Error("no TrueType file in the stylesheet");
    return await (await fetch(url)).arrayBuffer();
  } catch (e) {
    console.warn(`Link preview: couldn't load ${family}, using the default font.`, e);
    return null;
  }
}

export default async function Image() {
  const [serif, sans, photo] = await Promise.all([
    font("Newsreader", "opsz,wght@72,400", NAME),
    font("Inter", "wght@400", HELLO + LEDE + HOST),
    readFile(join(process.cwd(), "public/richard.jpg")),
  ]);
  const fonts = [
    serif && { name: "Newsreader", data: serif, weight: 400 as const, style: "normal" as const },
    sans && { name: "Inter", data: sans, weight: 400 as const, style: "normal" as const },
  ].filter((f) => !!f);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.bg, fontFamily: "Inter" }}>
        <img src={topoSvg()} width={size.width} height={size.height} style={{ position: "absolute", top: 0, left: 0 }} />
        {/* Fades the lines behind the text, like the mask on the page background. */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            backgroundImage: `linear-gradient(to right, ${C.bg}00 0%, ${C.bg}c0 12%, ${C.bg}c0 58%, ${C.bg}00 72%)`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 56, padding: "0 88px", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 30, color: C.muted, marginBottom: 18 }}>{HELLO}</div>
            <div style={{ fontFamily: "Newsreader", fontSize: 112, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: C.text }}>{NAME}</div>
            <div style={{ fontSize: 30, lineHeight: 1.45, color: C.text, marginTop: 34 }}>{LEDE}</div>
            <div style={{ fontSize: 24, color: C.muted, marginTop: 40 }}>{HOST}</div>
          </div>
          <img
            src={`data:image/jpeg;base64,${photo.toString("base64")}`}
            width={300}
            height={400}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
