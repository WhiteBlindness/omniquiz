// Generates the original pixel-art SVGs for the cinema environment into public/cinema/.
// Run: node scripts/generate-cinema-art.mjs   (output is deterministic)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/cinema");

const C = {
  far: "#120c2b",
  farWin: "#33256a",
  mid: "#1b1338",
  midEdge: "#2a1d52",
  near: "#0d0920",
  plum: "#2a1040",
  plumLight: "#43195e",
  trim: "#ff3df2",
  cyan: "#34f0ff",
  amber: "#ffbf3c",
  amberHot: "#ffe08a",
  red: "#ff4d5e",
  green: "#55ff9c",
  bulb: "#fff1b0",
  bulbDim: "#a8823a",
  win1: "#ffd27a",
  win2: "#7be7ff",
  win3: "#ff7ac8",
  steel: "#3c3260",
  steelLight: "#5b4d8c",
  carpet: "#c21f45",
  carpetDark: "#8b1533",
  screen: "#dff6ff",
  screenMid: "#8fc8ff",
  screenDeep: "#3f6bd6",
  sun: "#ffd27a",
};

const rng = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const FONT = {
  A: "01110,10001,11111,10001,10001", B: "11110,10001,11110,10001,11110",
  C: "01111,10000,10000,10000,01111", D: "11110,10001,10001,10001,11110",
  E: "11111,10000,11110,10000,11111", F: "11111,10000,11110,10000,10000",
  G: "01111,10000,10011,10001,01111", H: "10001,10001,11111,10001,10001",
  I: "11111,00100,00100,00100,11111", K: "10001,10010,11100,10010,10001",
  L: "10000,10000,10000,10000,11111", M: "10001,11011,10101,10001,10001",
  N: "10001,11001,10101,10011,10001", O: "01110,10001,10001,10001,01110",
  P: "11110,10001,11110,10000,10000", R: "11110,10001,11110,10010,10001",
  S: "01111,10000,01110,00001,11110", T: "11111,00100,00100,00100,00100",
  U: "10001,10001,10001,10001,01110", V: "10001,10001,10001,01010,00100",
  W: "10001,10001,10101,11011,10001", Y: "10001,01010,00100,00100,00100",
};

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges">${body}</svg>\n`;
const R = (x, y, w, h, fill, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra}/>`;

const text = (str, x, y, fill, scale = 1) => {
  let out = "";
  let cx = x;
  for (const ch of str) {
    if (ch === " ") { cx += 3 * scale; continue; }
    const rows = (FONT[ch] ?? FONT.O).split(",");
    rows.forEach((row, ry) => {
      [...row].forEach((bit, rx) => {
        if (bit === "1") out += R(cx + rx * scale, y + ry * scale, scale, scale, fill);
      });
    });
    cx += 6 * scale;
  }
  return out;
};
const textWidth = (str, scale = 1) =>
  [...str].reduce((acc, ch) => acc + (ch === " " ? 3 : 6) * scale, 0) - scale;

const windows = (x, y, cols, rows, cell, litRatio, rand, palette = [C.win1, C.win1, C.win2, C.win3]) => {
  let out = "";
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const lit = rand() < litRatio;
      out += R(x + c * cell, y + r * cell, cell - 1, cell - 1, lit ? palette[Math.floor(rand() * palette.length)] : C.mid);
    }
  }
  return out;
};

const bulbRow = (x, y, count, gap, on = C.bulb, off = C.bulbDim) => {
  let out = "";
  for (let i = 0; i < count; i += 1) out += R(x + i * gap, y, 2, 2, i % 2 === 0 ? on : off);
  return out;
};

const write = (name, content) => {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(resolve(OUT, name), content, "utf8");
};

// ---- skyline tiles (seamless: no building crosses the tile edge) ----
const skyline = (seed, w, h, fill, minH, maxH, winRatio, winColor, glow) => {
  const rand = rng(seed);
  let body = "";
  let x = 0;
  while (x < w) {
    const bw = Math.min(w - x, 14 + Math.floor(rand() * 22));
    const bh = minH + Math.floor(rand() * (maxH - minH));
    const top = h - bh;
    body += R(x, top, bw, bh, fill);
    if (glow) body += R(x, top, bw, 1, C.midEdge);
    if (rand() < 0.35) body += R(x + Math.floor(bw / 2), top - 5, 1, 5, fill);
    if (rand() < 0.2) body += R(x + 2, top - 3, 5, 3, fill);
    const cols = Math.max(1, Math.floor((bw - 4) / 4));
    const rows = Math.max(1, Math.floor((bh - 8) / 5));
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (rand() < winRatio) {
          const color = Array.isArray(winColor) ? winColor[Math.floor(rand() * winColor.length)] : winColor;
          body += R(x + 2 + c * 4, top + 4 + r * 5, 2, 2, color);
        }
      }
    }
    x += bw;
  }
  return svg(w, h, body);
};

write("skyline-far.svg", skyline(11, 240, 64, C.far, 18, 46, 0.08, C.farWin, false));
write("skyline-mid.svg", skyline(23, 320, 92, C.mid, 30, 84, 0.22, [C.win1, C.win1, C.win2, C.win3], true));

// ---- street furniture tile ----
{
  let b = "";
  for (const px of [30, 130]) {
    b += R(px, 8, 2, 52, C.steel);
    b += R(px - 6, 6, 14, 2, C.steel);
    b += R(px - 6, 8, 5, 2, C.amberHot);
    b += R(px + 3, 8, 5, 2, C.amberHot);
    b += R(px - 8, 10, 18, 3, "rgba(255,224,138,0.18)");
  }
  b += R(0, 58, 200, 2, C.steelLight);
  write("streetlights.svg", svg(200, 60, b));
}

// ---- cars (facing right) ----
const car = (w, body, roof, tail = C.red) => {
  let b = "";
  b += R(0, 6, w, 5, body);
  b += R(4, 2, w - 10, 4, roof);
  b += R(6, 3, 5, 3, "#8fd8ff");
  b += R(13, 3, w - 20, 3, "#8fd8ff");
  b += R(w - 2, 7, 2, 2, C.amberHot);
  b += R(w, 8, 8, 2, "rgba(255,224,138,0.28)");
  b += R(0, 7, 2, 2, tail);
  b += R(3, 10, 4, 2, "#0b0816");
  b += R(w - 8, 10, 4, 2, "#0b0816");
  return svg(w + 8, 13, b);
};
write("car-a.svg", car(26, "#4b2c7a", "#3a2163"));
write("car-b.svg", car(30, "#c8891a", "#a06d12"));
write("car-c.svg", car(24, "#1e5a7a", "#174760"));

// ---- set pieces ----
// 1. City limits: billboard, diner sign, power pole
{
  const rand = rng(101);
  let b = "";
  b += R(0, 104, 180, 6, C.near);
  // diner
  b += R(6, 70, 50, 34, C.plum);
  b += R(4, 66, 54, 5, C.plumLight);
  b += windows(10, 76, 5, 2, 8, 0.7, rand);
  b += R(40, 88, 10, 16, C.amberHot);
  b += R(12, 54, 40, 10, "#1a0a2a");
  b += text("OPEN", 20, 57, C.red);
  b += R(11, 53, 42, 1, C.red);
  b += R(11, 64, 42, 1, C.red);
  // billboard
  b += R(96, 46, 3, 58, C.steel);
  b += R(146, 46, 3, 58, C.steel);
  b += R(72, 12, 100, 40, "#1a0a2a");
  b += R(72, 12, 100, 2, C.amber);
  b += R(72, 50, 100, 2, C.amber);
  b += R(72, 12, 2, 40, C.amber);
  b += R(170, 12, 2, 40, C.amber);
  b += bulbRow(76, 8, 24, 4);
  b += text("NOW", 122 - textWidth("NOW") / 2, 18, C.amberHot);
  b += text("SHOWING", 122 - textWidth("SHOWING") / 2, 30, C.trim);
  b += R(96, 41, 52, 2, C.cyan);
  // power pole
  b += R(172, 40, 2, 64, C.steel);
  b += R(164, 44, 18, 2, C.steel);
  write("piece-city-limits.svg", svg(180, 110, b));
}

// 2. Cinema district: small cinema with marquee and ticket booth
{
  const rand = rng(202);
  let b = "";
  b += R(0, 112, 210, 8, C.near);
  b += R(22, 56, 120, 56, C.plum);
  b += R(18, 50, 128, 8, C.plumLight);
  b += windows(28, 62, 10, 2, 11, 0.55, rand);
  // blade sign
  b += R(126, 6, 16, 60, "#1a0a2a");
  b += R(126, 6, 16, 1, C.trim);
  b += R(141, 6, 1, 60, C.trim);
  b += R(126, 66, 16, 1, C.trim);
  b += R(126, 6, 1, 60, C.trim);
  "CINE".split("").forEach((ch, i) => { b += text(ch, 129, 10 + i * 8, C.cyan); });
  // marquee canopy
  b += R(36, 84, 84, 6, "#1a0a2a");
  b += R(34, 82, 88, 3, C.trim);
  b += bulbRow(38, 86, 20, 4);
  b += text("TONIGHT", 78 - textWidth("TONIGHT") / 2, 68, C.amberHot);
  // doors
  b += R(64, 92, 28, 20, "#0b0816");
  b += R(66, 94, 10, 18, C.amberHot);
  b += R(80, 94, 10, 18, C.amberHot);
  // posters (abstract art)
  const poster = (x, base, accent) => {
    let p = R(x, 94, 12, 16, "#0b0816") + R(x + 1, 95, 10, 14, base);
    p += R(x + 4, 98, 4, 4, accent) + R(x + 1, 105, 10, 4, "#0b0816");
    return p;
  };
  b += poster(38, "#2f4bd6", C.sun);
  b += poster(98, "#a2189a", C.cyan);
  // ticket booth
  b += R(158, 88, 30, 24, C.steel);
  b += R(156, 84, 34, 5, C.amber);
  b += R(162, 94, 14, 9, C.amberHot);
  b += text("TICKETS", 173 - textWidth("TICKETS") / 2, 76, C.amber);
  write("piece-cinema-district.svg", svg(210, 120, b));
}

// 3. Neon boulevard: tall signs and shopfronts
{
  const rand = rng(303);
  let b = "";
  b += R(0, 124, 240, 8, C.near);
  b += R(4, 40, 58, 84, C.plum);
  b += windows(10, 46, 6, 8, 8, 0.6, rand);
  b += R(176, 30, 60, 94, C.plum);
  b += windows(182, 36, 6, 9, 8, 0.6, rand);
  // vertical neon
  b += R(66, 4, 20, 78, "#1a0a2a");
  b += R(65, 4, 1, 78, C.trim);
  b += R(86, 4, 1, 78, C.trim);
  b += R(65, 4, 22, 1, C.trim);
  b += R(65, 81, 22, 1, C.trim);
  "MOVIE".split("").forEach((ch, i) => { b += text(ch, 72, 9 + i * 14, i % 2 ? C.cyan : C.amberHot); });
  // billboard with abstract art
  b += R(96, 44, 70, 44, "#1a0a2a");
  b += R(96, 44, 70, 2, C.cyan);
  b += R(96, 86, 70, 2, C.cyan);
  b += R(98, 48, 66, 36, "#5a1a8a");
  b += R(98, 66, 66, 18, "#2a0f52");
  b += R(122, 54, 18, 18, C.sun);
  b += R(98, 74, 66, 3, C.trim);
  b += R(96, 88, 3, 36, C.steel);
  b += R(163, 88, 3, 36, C.steel);
  // shop awnings
  b += R(4, 84, 58, 6, C.red);
  b += R(176, 84, 60, 6, C.cyan);
  b += R(14, 96, 40, 24, "#0b0816");
  b += R(186, 96, 40, 24, "#0b0816");
  b += R(18, 100, 32, 16, C.amberHot);
  b += R(190, 100, 32, 16, C.win3);
  b += text("OPEN", 216 - textWidth("OPEN"), 72, C.green);
  write("piece-neon-boulevard.svg", svg(240, 132, b));
}

// 4. Drive-in: giant screen and cars
{
  const rand = rng(404);
  let b = "";
  b += R(0, 124, 300, 8, C.near);
  b += R(112, 60, 3, 64, C.steel);
  b += R(182, 60, 3, 64, C.steel);
  b += R(50, 6, 196, 76, C.steel);
  b += R(54, 10, 188, 68, C.screen);
  b += R(54, 44, 188, 34, C.screenMid);
  b += R(54, 62, 188, 16, C.screenDeep);
  b += R(140, 20, 22, 22, C.sun);
  b += R(78, 40, 36, 22, C.screenMid);
  b += R(64, 52, 60, 12, C.screenDeep);
  b += R(180, 46, 40, 16, C.screenMid);
  b += R(170, 56, 60, 8, C.screenDeep);
  b += R(50, 6, 196, 2, C.amber);
  b += R(50, 80, 196, 2, C.amber);
  b += bulbRow(54, 3, 47, 4);
  // sign
  b += R(4, 84, 40, 22, "#1a0a2a");
  b += R(4, 84, 40, 1, C.trim);
  b += text("DRIVE", 24 - textWidth("DRIVE") / 2, 87, C.amberHot);
  b += text("IN", 24 - textWidth("IN") / 2, 96, C.cyan);
  b += R(23, 106, 2, 18, C.steel);
  // cars
  const cars = [[16, 112], [60, 112], [104, 112], [148, 112], [194, 112], [236, 112], [30, 100], [90, 100], [176, 100], [232, 100]];
  for (const [cx, cy] of cars) {
    const body = ["#4b2c7a", "#7a2c4b", "#1e5a7a", "#8a6a1a"][Math.floor(rand() * 4)];
    b += R(cx, cy + 4, 26, 6, body);
    b += R(cx + 4, cy, 16, 5, body);
    b += R(cx + 6, cy + 1, 5, 3, "#8fd8ff");
    b += R(cx + 13, cy + 1, 5, 3, "#8fd8ff");
    b += R(cx, cy + 6, 2, 2, C.red);
    b += R(cx + 3, cy + 10, 4, 2, "#0b0816");
    b += R(cx + 19, cy + 10, 4, 2, "#0b0816");
  }
  write("piece-drive-in.svg", svg(300, 132, b));
}

// 5. Premiere night: grand theatre
{
  const rand = rng(505);
  let b = "";
  b += R(0, 136, 340, 14, C.near);
  b += R(70, 34, 200, 102, C.plum);
  b += R(62, 26, 216, 10, C.plumLight);
  b += R(150, 4, 40, 24, C.plumLight);
  b += R(162, 8, 16, 16, C.amber);
  b += R(166, 12, 8, 8, C.amberHot);
  // columns
  for (let i = 0; i < 6; i += 1) {
    b += R(82 + i * 32, 40, 8, 96, C.steelLight);
    b += R(80 + i * 32, 38, 12, 4, C.steel);
    b += R(80 + i * 32, 132, 12, 4, C.steel);
  }
  // marquee
  b += R(96, 62, 148, 18, "#1a0a2a");
  b += R(94, 60, 152, 3, C.trim);
  b += R(94, 80, 152, 3, C.trim);
  b += bulbRow(98, 57, 37, 4);
  b += bulbRow(98, 84, 37, 4);
  b += text("PREMIERE", 170 - textWidth("PREMIERE"), 66, C.amberHot, 1);
  b += text("PREMIERE", 170 - textWidth("PREMIERE"), 66, C.amberHot, 1);
  // doors + carpet
  b += R(140, 96, 60, 40, "#0b0816");
  b += R(144, 100, 22, 36, C.amberHot);
  b += R(174, 100, 22, 36, C.amberHot);
  b += R(146, 136, 48, 14, C.carpet);
  b += R(140, 142, 60, 8, C.carpetDark);
  // ropes
  for (const rx of [118, 130, 210, 222]) {
    b += R(rx, 126, 2, 10, C.amber);
  }
  b += R(118, 128, 14, 1, C.red);
  b += R(210, 128, 14, 1, C.red);
  // flags
  for (const fx of [70, 264]) {
    b += R(fx, 10, 2, 26, C.steel);
    b += R(fx + 2, 10, 12, 7, C.trim);
  }
  // crowd silhouettes with camera flashes
  for (let i = 0; i < 22; i += 1) {
    const x = 6 + i * 15 + Math.floor(rand() * 5);
    if (x > 118 && x < 222) continue;
    const h = 12 + Math.floor(rand() * 6);
    b += R(x, 136 - h + 14, 6, h, C.near);
    b += R(x + 1, 136 - h + 10, 4, 4, C.near);
    if (rand() < 0.4) b += R(x + 2, 136 - h + 8, 2, 2, C.bulb);
  }
  write("piece-premiere-night.svg", svg(340, 150, b));
}

// ---- moon ----
write("moon.svg", svg(24, 24, R(6, 0, 12, 24, "#fff4d0") + R(0, 6, 24, 12, "#fff4d0") + R(2, 2, 20, 20, "#fff4d0") + R(14, 4, 4, 4, "#e6d7ac") + R(6, 12, 5, 5, "#e6d7ac")));

console.log(`Generated cinema art in ${OUT}`);
