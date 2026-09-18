/**
 * /pride 圖卡的畫法（只在瀏覽器裡跑）。
 *
 * 整張卡都在使用者自己的瀏覽器用 <canvas> 畫出來。製作過程中照片不會離開裝置；
 * 只有使用者主動按「釘上照片牆」，才會把「做好的圖卡」送去報名系統等秘書處審核。
 *
 * 版面由兩個獨立的選擇組成（1080×1080，IG／FB 正方形規格）：
 *   框型 frame      ：滿版 / 彩虹框 / 拍立得 —— 決定照片放在哪個範圍、外圍怎麼裝飾
 *   文字框 textStyle：字幕 / 白色字卡 / 對話泡泡 —— 決定金句怎麼疊在照片上
 * 另外照片可以套色調（toneImage），在畫之前先處理好。
 */

export const SIZE = 1080;

export type FrameId = "full" | "rainbow" | "polaroid";
export type TextStyleId = "caption" | "card" | "bubble";
export type ToneId = "original" | "warm" | "fresh" | "vintage" | "mono" | "vivid";

export const FRAMES: { id: FrameId; label: string }[] = [
  { id: "full", label: "滿版" },
  { id: "rainbow", label: "彩虹框" },
  { id: "polaroid", label: "拍立得" },
];

export const TEXT_STYLES: { id: TextStyleId; label: string }[] = [
  { id: "caption", label: "字幕" },
  { id: "card", label: "白色字卡" },
  { id: "bubble", label: "對話泡泡" },
];

export const TONES: { id: ToneId; label: string }[] = [
  { id: "original", label: "原色" },
  { id: "warm", label: "暖陽" },
  { id: "fresh", label: "清新" },
  { id: "vintage", label: "復古" },
  { id: "mono", label: "黑白" },
  { id: "vivid", label: "鮮豔" },
];

/** 已經套好色調、可以直接畫的照片 */
export interface Photo {
  source: CanvasImageSource;
  width: number;
  height: number;
}

export interface CardState {
  photo: Photo | null;
  /** 1 = 剛好填滿（cover），越大越放大 */
  zoom: number;
  /** 使用者拖曳造成的位移，單位是畫布像素，0 = 置中 */
  offsetX: number;
  offsetY: number;
  quote: string;
  signature: string;
  frame: FrameId;
  textStyle: TextStyleId;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const RAINBOW = ["#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982"];
/** 進步彩虹旗的箭頭色：黑、棕（有色族群），淺藍、粉、白（跨性別） */
const PROGRESS = ["#000000", "#784F17", "#5BCEFA", "#F5A9B8", "#FFFFFF"];

const INK = "#211B14";
const INK_SOFT = "#5B4F41";
const PAPER = "#FBF8F1";

const FONT_QUOTE = '"Noto Serif TC", "Songti TC", "Source Han Serif TC", "PMingLiU", serif';
const FONT_SANS = '"Noto Sans TC", "PingFang TC", "Hiragino Sans", "Microsoft JhengHei", sans-serif';

/* ---- 色調 ---------------------------------------------------------------- */

/**
 * 每種色調的參數。全部是逐像素運算，不用 ctx.filter——
 * 舊版 iPhone Safari 不支援 canvas 的 filter，會變成「按了沒反應」。
 *   mul：RGB 各自的倍率    add：RGB 各自加減    sat：飽和度    con：對比    sepia：懷舊程度 0–1
 */
const TONE_PARAMS: Record<ToneId, { mul: number[]; add: number[]; sat: number; con: number; sepia: number }> = {
  original: { mul: [1, 1, 1], add: [0, 0, 0], sat: 1, con: 1, sepia: 0 },
  warm: { mul: [1.08, 1.02, 0.9], add: [10, 4, 0], sat: 1.1, con: 1.03, sepia: 0 },
  fresh: { mul: [0.96, 1.02, 1.06], add: [6, 10, 16], sat: 0.95, con: 0.94, sepia: 0 },
  vintage: { mul: [1, 1, 1], add: [18, 12, 4], sat: 0.8, con: 0.88, sepia: 0.4 },
  mono: { mul: [1, 1, 1], add: [0, 0, 0], sat: 0, con: 1.12, sepia: 0 },
  vivid: { mul: [1, 1, 1], add: [0, 0, 0], sat: 1.4, con: 1.08, sepia: 0 },
};

/** 照片最長邊縮到這個大小再處理：夠放大 2 倍輸出，也不會讓手機記憶體爆掉。 */
const WORK_MAX = 2048;

/** 把原始照片縮到工作尺寸，只做一次；之後換色調都從這張算。 */
export function prepareBase(img: HTMLImageElement): HTMLCanvasElement {
  const scale = Math.min(1, WORK_MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

/** 套色調與亮度（-30 ~ +30），回傳新的畫布，不動原圖。 */
export function toneImage(base: HTMLCanvasElement, tone: ToneId, brightness: number): Photo {
  const p = TONE_PARAMS[tone];
  if (tone === "original" && brightness === 0) {
    return { source: base, width: base.width, height: base.height };
  }
  const out = document.createElement("canvas");
  out.width = base.width;
  out.height = base.height;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(base, 0, 0);
  const data = ctx.getImageData(0, 0, out.width, out.height);
  const px = data.data;
  const bright = 1 + brightness / 100;
  const [mr, mg, mb] = p.mul;
  const [ar, ag, ab] = p.add;

  for (let i = 0; i < px.length; i += 4) {
    let r = px[i] * bright;
    let g = px[i + 1] * bright;
    let b = px[i + 2] * bright;

    if (p.sepia > 0) {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      r += (sr - r) * p.sepia;
      g += (sg - g) * p.sepia;
      b += (sb - b) * p.sepia;
    }

    const luma = r * 0.299 + g * 0.587 + b * 0.114;
    r = luma + (r - luma) * p.sat;
    g = luma + (g - luma) * p.sat;
    b = luma + (b - luma) * p.sat;

    r = (r - 128) * p.con + 128;
    g = (g - 128) * p.con + 128;
    b = (b - 128) * p.con + 128;

    // Uint8ClampedArray 會自己把超出 0–255 的值夾回來
    px[i] = r * mr + ar;
    px[i + 1] = g * mg + ag;
    px[i + 2] = b * mb + ab;
  }
  ctx.putImageData(data, 0, 0);
  return { source: out, width: out.width, height: out.height };
}

/* ---- 框型：決定照片範圍 --------------------------------------------------- */

interface FrameLayout {
  photo: Rect;
  radius: number;
  /** 拍立得的署名寫在下緣白邊，不跟金句擠在照片上 */
  signatureInFrame: boolean;
}

function frameLayout(frame: FrameId): FrameLayout {
  if (frame === "rainbow") return { photo: { x: 40, y: 40, w: 1000, h: 1000 }, radius: 24, signatureInFrame: false };
  if (frame === "polaroid") return { photo: { x: 64, y: 64, w: 952, h: 776 }, radius: 4, signatureInFrame: true };
  return { photo: { x: 0, y: 0, w: SIZE, h: SIZE }, radius: 0, signatureInFrame: false };
}

function coverSize(photo: Photo, zoom: number, box: Rect) {
  const scale = Math.max(box.w / photo.width, box.h / photo.height) * zoom;
  return { w: photo.width * scale, h: photo.height * scale };
}

/** 把拖曳位移限制在「照片仍然蓋滿照片範圍」之內，避免露出空白邊。 */
export function clampOffset(s: CardState, x: number, y: number) {
  if (!s.photo) return { x: 0, y: 0 };
  const box = frameLayout(s.frame).photo;
  const { w, h } = coverSize(s.photo, s.zoom, box);
  const maxX = (w - box.w) / 2;
  const maxY = (h - box.h) / 2;
  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

/** 圓角矩形路徑。不用 ctx.roundRect：iOS 15 以前的 Safari 沒有它。 */
function roundRectPath(ctx: CanvasRenderingContext2D, r: Rect, radius: number) {
  const rad = Math.min(radius, r.w / 2, r.h / 2);
  ctx.beginPath();
  ctx.moveTo(r.x + rad, r.y);
  ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad);
  ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad);
  ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad);
  ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad);
  ctx.closePath();
}

/* ---- 中文斷行 ------------------------------------------------------------ */

/** 不能出現在行首的標點（會黏到前一個字） */
const NO_LINE_START = "，。、！？；：」』）》〉…—～,.!?;:)]}%";
/** 不能出現在行尾的標點（會黏到後一個字） */
const NO_LINE_END = "「『（《〈([{";

/**
 * 切成「不可拆開」的小塊。瀏覽器有中文斷詞（Intl.Segmenter）就以「詞」為單位，
 * 避免把「安心」拆成「安／心」；沒有的話退回一個字一塊。
 * 行首禁用的標點黏到前一塊、行尾禁用的標點黏到後一塊。
 */
function segments(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter("zh-Hant", { granularity: "word" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

const isAll = (s: string, set: string) => Array.from(s).every((ch) => set.includes(ch) || /\p{M}|\uFE0F/u.test(ch));

function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let carry = "";
  for (const seg of segments(text)) {
    if (tokens.length && isAll(seg, NO_LINE_START)) {
      tokens[tokens.length - 1] += seg;
    } else if (isAll(seg, NO_LINE_END)) {
      carry += seg;
    } else {
      tokens.push(carry + seg);
      carry = "";
    }
  }
  if (carry) tokens.push(carry);
  return tokens;
}

function greedyWrap(ctx: CanvasRenderingContext2D, tokens: string[], maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  // 單一個詞就比整行還寬（很少見），只好拆成一個一個字
  const pieces = tokens.flatMap((t) => (ctx.measureText(t).width > maxWidth ? Array.from(t) : [t]));
  for (const t of pieces) {
    const next = line + t;
    if (line && ctx.measureText(next.trimEnd()).width > maxWidth) {
      lines.push(line.trimEnd());
      line = t.trimStart();
    } else {
      line = next;
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}

/**
 * 斷行後再「平衡」一次：在不增加行數的前提下找最窄的寬度，
 * 這樣最後一行不會只剩孤零零一兩個字（同 CSS 的 text-wrap: balance）。
 */
function wrapParagraph(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const tokens = tokenize(text);
  const base = greedyWrap(ctx, tokens, maxWidth);
  if (base.length < 2) return base;
  let lo = maxWidth * 0.5;
  let hi = maxWidth;
  let best = base;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const attempt = greedyWrap(ctx, tokens, mid);
    if (attempt.length <= base.length) {
      best = attempt;
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return best;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  return text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => wrapParagraph(ctx, p, maxWidth));
}

/**
 * 決定金句字級：
 *   1. 先試「每一段都不必自動斷行」——作者用 \n 排好的句子照原樣呈現，
 *      寧可字小一點，也不要把詞從中間切開。
 *   2. 放不下（例如使用者自己寫的長句）才自動斷行，塞得進 4 行為止。
 */
function fitQuote(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxSize: number) {
  const minKeep = Math.round(maxSize * 0.72);
  const minWrap = Math.round(maxSize * 0.6);
  const paragraphs = text.split("\n").map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length <= 4) {
    for (let size = maxSize; size >= minKeep; size -= 2) {
      ctx.font = `700 ${size}px ${FONT_QUOTE}`;
      if (paragraphs.every((p) => ctx.measureText(p).width <= maxWidth)) return { size, lines: paragraphs };
    }
  }
  for (let size = maxSize; size >= minWrap; size -= 2) {
    ctx.font = `700 ${size}px ${FONT_QUOTE}`;
    const lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= 4 || size <= minWrap + 1) return { size, lines: lines.slice(0, 5) };
  }
  return { size: minWrap, lines: [] as string[] };
}

/* ---- 學會標誌（三人環）----------------------------------------------------
   幾何與 src/components/decor/FigureRing.astro 相同（從 logo.png 量出來的）。
   logo.png 只有 100px，放到 1080 的卡上會糊，所以這裡重畫向量版。 */

const RING = { cx: 50, cy: 50, r: 37, headR: 40 };
const FIGURES = [
  { color: "#FFF000", start: 47, span: 153 },
  { color: "#E73828", start: 174, span: 156 },
  { color: "#009FE8", start: 299, span: 142 },
];

function ringPoint(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return [RING.cx + r * Math.cos(rad), RING.cy + r * Math.sin(rad)];
}

function taperedArm(start: number, span: number, maxWidth: number) {
  const STEPS = 48;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const s = i / STEPS;
    const angle = start + span * s;
    const w = maxWidth * (0.18 + 0.82 * Math.pow(Math.sin(Math.PI * s), 0.55));
    const [ox, oy] = ringPoint(RING.r + w / 2, angle);
    const [ix, iy] = ringPoint(RING.r - w / 2, angle);
    outer.push(`${ox.toFixed(2)} ${oy.toFixed(2)}`);
    inner.push(`${ix.toFixed(2)} ${iy.toFixed(2)}`);
  }
  return `M ${outer.join(" L ")} L ${inner.reverse().join(" L ")} Z`;
}

/** 在 (x, y) 畫一個 size×size 的三人環 */
function drawRing(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  for (const f of FIGURES) {
    ctx.fillStyle = f.color;
    ctx.fill(new Path2D(taperedArm(f.start, f.span, 8.5)));
    const [hx, hy] = ringPoint(RING.headR, f.start + f.span / 2);
    ctx.beginPath();
    ctx.arc(hx, hy, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* ---- 照片範圍內的底圖 ---------------------------------------------------- */

/** 還沒放照片時的底：深色 + 標誌色的柔光，本身也能當一張純文字圖卡用 */
function drawPlaceholder(ctx: CanvasRenderingContext2D, r: Rect) {
  ctx.fillStyle = INK;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  const k = r.w / SIZE;
  const glows: [number, number, number, string][] = [
    [180, 200, 620, "rgba(0, 159, 232, 0.42)"],
    [940, 320, 560, "rgba(231, 19, 116, 0.36)"],
    [620, 760, 640, "rgba(255, 196, 0, 0.22)"],
    [120, 900, 480, "rgba(30, 171, 57, 0.22)"],
  ];
  for (const [x, y, rad, color] of glows) {
    const gx = r.x + x * k;
    const gy = r.y + y * k;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad * k);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(33, 27, 20, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  drawRing(ctx, r.x + 560 * k, r.y + 110 * k, 460 * k, 0.12);
}

function drawPhoto(ctx: CanvasRenderingContext2D, s: CardState, r: Rect) {
  const photo = s.photo!;
  const { w, h } = coverSize(photo, s.zoom, r);
  const { x, y } = clampOffset(s, s.offsetX, s.offsetY);
  ctx.fillStyle = INK;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(photo.source, r.x + (r.w - w) / 2 + x, r.y + (r.h - h) / 2 + y, w, h);
}

/** 照片左上角的學會標誌膠囊（拍立得的標誌改寫在下緣，不畫這個） */
function drawBrandPill(ctx: CanvasRenderingContext2D, r: Rect) {
  const cx = r.x + 48 + 38;
  const cy = r.y + 44 + 38;
  const name = "台灣性諮商學會";
  const sub = "TASC  ·  2026 PRIDE";

  // 半透明深色膠囊墊在標誌與名稱後面：照片再亮（天空、白牆）字也看得清楚
  ctx.font = `700 32px ${FONT_SANS}`;
  const pillX = cx - 48;
  const pillW = 48 + 60 + ctx.measureText(name).width + 34;
  ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
  roundRectPath(ctx, { x: pillX, y: cy - 48, w: pillW, h: 96 }, 48);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.fill();
  drawRing(ctx, cx - 30, cy - 30, 60);

  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 32px ${FONT_SANS}`;
  ctx.fillText(name, cx + 60, cy + 2);
  ctx.font = `600 20px ${FONT_SANS}`;
  ctx.globalAlpha = 0.85;
  ctx.fillText(sub, cx + 61, cy + 32);
  ctx.restore();
}

function drawRainbowBar(ctx: CanvasRenderingContext2D, x: number, y: number, segW = 26, h = 8) {
  RAINBOW.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(x + i * segW, y, segW, h);
  });
}

/** 署名字級會自動縮到放得下那一行 */
function fitSignature(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, size = 28) {
  ctx.font = `500 ${size}px ${FONT_SANS}`;
  while (ctx.measureText(text).width > maxWidth && size > 18) {
    size -= 1;
    ctx.font = `500 ${size}px ${FONT_SANS}`;
  }
  return size;
}

/** 照片範圍比正方形矮（拍立得）時，金句字級跟著縮，才不會把整張照片蓋掉 */
function textScale(r: Rect) {
  return Math.min(1, (r.h / SIZE) * 1.1);
}

function drawLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, firstBaseline: number, size: number) {
  const lineHeight = size * 1.42;
  ctx.font = `700 ${size}px ${FONT_QUOTE}`;
  lines.forEach((line, i) => ctx.fillText(line, x, firstBaseline + i * lineHeight));
}

/* ---- 文字框 -------------------------------------------------------------- */

/** 字幕：照片下半部黑色漸層，白字直接壓在上面 */
function drawCaption(ctx: CanvasRenderingContext2D, s: CardState, r: Rect, withSignature: boolean) {
  const pad = Math.round(r.w * 0.078);
  const maxWidth = r.w - pad * 2;

  const from = r.y + r.h * 0.34;
  const g = ctx.createLinearGradient(0, from, 0, r.y + r.h);
  g.addColorStop(0, "rgba(0, 0, 0, 0)");
  g.addColorStop(0.4, "rgba(0, 0, 0, 0.5)");
  g.addColorStop(1, "rgba(0, 0, 0, 0.86)");
  ctx.fillStyle = g;
  ctx.fillRect(r.x, from, r.w, r.y + r.h - from);

  const bottom = r.y + r.h - (withSignature ? 78 : 64);
  const { size, lines } = fitQuote(ctx, s.quote, maxWidth, Math.round(72 * textScale(r)));
  const lineHeight = size * 1.42;
  const blockBottom = withSignature ? bottom - 88 : bottom;
  const firstBaseline = blockBottom - lineHeight * (lines.length - 1);

  drawRainbowBar(ctx, r.x + pad, firstBaseline - size - 40);

  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 14;
  drawLines(ctx, lines, r.x + pad, firstBaseline, size);
  ctx.restore();

  if (withSignature) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
    ctx.fillRect(r.x + pad, bottom - 44, maxWidth, 1.5);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    fitSignature(ctx, s.signature, maxWidth);
    ctx.fillText(s.signature, r.x + pad, bottom);
  }
}

/** 白色字卡：照片下方一張半透明白卡，深色字，卡片頂端一條彩虹 */
function drawTextCard(ctx: CanvasRenderingContext2D, s: CardState, r: Rect, withSignature: boolean) {
  const margin = 48;
  const inner = 48;
  const cardW = r.w - margin * 2;
  const maxWidth = cardW - inner * 2;
  const { size, lines } = fitQuote(ctx, s.quote, maxWidth, Math.round(64 * textScale(r)));
  const lineHeight = size * 1.42;
  const sigBlock = withSignature ? 76 : 0;
  const cardH = inner + 14 + size + lineHeight * (lines.length - 1) + inner * 0.8 + sigBlock;
  const card: Rect = { x: r.x + margin, y: r.y + r.h - margin - cardH, w: cardW, h: cardH };

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "rgba(255, 253, 248, 0.93)";
  roundRectPath(ctx, card, 28);
  ctx.fill();
  ctx.restore();

  // 卡片頂端的彩虹：裁在卡片的圓角裡
  ctx.save();
  roundRectPath(ctx, card, 28);
  ctx.clip();
  const segW = card.w / RAINBOW.length;
  RAINBOW.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(card.x + i * segW, card.y, segW + 1, 12);
  });
  ctx.restore();

  const firstBaseline = card.y + inner + 14 + size * 0.86;
  ctx.fillStyle = INK;
  drawLines(ctx, lines, card.x + inner, firstBaseline, size);

  if (withSignature) {
    const sigY = card.y + card.h - inner * 0.8;
    ctx.fillStyle = "rgba(33, 27, 20, 0.14)";
    ctx.fillRect(card.x + inner, sigY - 44, maxWidth, 1.5);
    ctx.fillStyle = INK_SOFT;
    fitSignature(ctx, s.signature, maxWidth, 26);
    ctx.fillText(s.signature, card.x + inner, sigY);
  }
}

/** 對話泡泡：白色泡泡從左下角冒出來，呼應今年主題「聲做伙聽」 */
function drawBubble(ctx: CanvasRenderingContext2D, s: CardState, r: Rect, withSignature: boolean) {
  const margin = 56;
  const inner = 46;
  const sigSpace = withSignature ? 96 : 40;
  const maxWidth = r.w - margin * 2 - inner * 2;
  const { size, lines } = fitQuote(ctx, s.quote, maxWidth, Math.round(62 * textScale(r)));
  const lineHeight = size * 1.42;
  ctx.font = `700 ${size}px ${FONT_QUOTE}`;
  const textW = Math.max(0, ...lines.map((l) => ctx.measureText(l).width));
  const bw = Math.max(textW + inner * 2, 360);
  const bh = inner * 2 + size + lineHeight * (lines.length - 1) - size * 0.14;
  const tail = 46;
  const b: Rect = { x: r.x + margin, y: r.y + r.h - sigSpace - tail - bh, w: bw, h: bh };

  // 署名在泡泡下方，墊一層淡淡的暗色讓白字看得清楚
  if (withSignature) {
    const from = r.y + r.h - 240;
    const g = ctx.createLinearGradient(0, from, 0, r.y + r.h);
    g.addColorStop(0, "rgba(0, 0, 0, 0)");
    g.addColorStop(1, "rgba(0, 0, 0, 0.62)");
    ctx.fillStyle = g;
    ctx.fillRect(r.x, from, r.w, 240);
  }

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#FFFFFF";
  roundRectPath(ctx, b, 44);
  ctx.fill();
  // 泡泡的小尾巴
  ctx.beginPath();
  ctx.moveTo(b.x + 70, b.y + b.h - 2);
  ctx.quadraticCurveTo(b.x + 64, b.y + b.h + tail * 0.7, b.x + 34, b.y + b.h + tail);
  ctx.quadraticCurveTo(b.x + 112, b.y + b.h + tail * 0.6, b.x + 132, b.y + b.h - 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 泡泡右上角的彩虹小點點
  RAINBOW.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(b.x + b.w - 40 - (RAINBOW.length - 1 - i) * 16, b.y + 30, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = INK;
  drawLines(ctx, lines, b.x + inner, b.y + inner + size * 0.86, size);

  if (withSignature) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 10;
    fitSignature(ctx, s.signature, r.w - margin * 2);
    ctx.fillText(s.signature, r.x + margin, r.y + r.h - 48);
    ctx.restore();
  }
}

/* ---- 框的外圍裝飾 -------------------------------------------------------- */

/** 滿版最底部的進步彩虹條：先是跨性別與有色族群的五色，再接六色彩虹 */
function drawPrideStripe(ctx: CanvasRenderingContext2D) {
  const h = 16;
  const y = SIZE - h;
  const progressW = 30;
  PROGRESS.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * progressW, y, progressW, h);
  });
  const start = PROGRESS.length * progressW;
  const segW = (SIZE - start) / RAINBOW.length;
  RAINBOW.forEach((c, i) => {
    ctx.fillStyle = c;
    // 多畫 1px 蓋掉色塊之間的細縫
    ctx.fillRect(start + i * segW, y, segW + 1, h);
  });
}

/** 彩虹框的底：進步彩虹的顏色沿對角線漸層 */
function drawRainbowBorder(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  const colors = ["#5BCEFA", "#F5A9B8", ...RAINBOW];
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

/** 拍立得的相紙：米白底，加很淡的斜紋讓底色不會死白 */
function drawPolaroidPaper(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = INK;
  for (let i = -SIZE; i < SIZE; i += 14) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + SIZE, SIZE);
    ctx.stroke();
  }
  ctx.restore();
}

/** 拍立得：上緣一段彩虹紙膠帶、下緣白邊寫學會名與 hashtag */
function drawPolaroidExtras(ctx: CanvasRenderingContext2D, s: CardState, r: Rect) {
  ctx.strokeStyle = "rgba(33, 27, 20, 0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(r.x, r.y, r.w, r.h);

  ctx.save();
  ctx.translate(SIZE / 2, 58);
  ctx.rotate((-3 * Math.PI) / 180);
  ctx.globalAlpha = 0.82;
  const tapeW = 260;
  const segW = tapeW / RAINBOW.length;
  RAINBOW.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(-tapeW / 2 + i * segW, -24, segW + 1, 48);
  });
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(-tapeW / 2, -24, tapeW, 48);
  ctx.restore();

  const top = r.y + r.h;
  const cy = top + (SIZE - top) / 2 - 4;
  drawRing(ctx, r.x + 4, cy - 40, 80);
  const [name, tags] = s.signature.includes("‧")
    ? s.signature.split("‧").map((t) => t.trim())
    : [s.signature, ""];
  const textX = r.x + 112;
  ctx.fillStyle = INK;
  ctx.font = `700 40px ${FONT_QUOTE}`;
  ctx.fillText(name, textX, cy - 4);
  if (tags) {
    ctx.fillStyle = INK_SOFT;
    fitSignature(ctx, tags, r.x + r.w - textX, 28);
    ctx.fillText(tags, textX, cy + 42);
  }
}

/* ---- 組合 ---------------------------------------------------------------- */

export function drawCard(ctx: CanvasRenderingContext2D, s: CardState) {
  const layout = frameLayout(s.frame);
  const r = layout.photo;
  const withSignature = !layout.signatureInFrame;

  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.textBaseline = "alphabetic";
  if (s.frame === "rainbow") drawRainbowBorder(ctx);
  if (s.frame === "polaroid") drawPolaroidPaper(ctx);

  // 照片與文字框都裁在照片範圍內，框型的圓角才會乾淨
  ctx.save();
  roundRectPath(ctx, r, layout.radius);
  ctx.clip();
  if (s.photo) drawPhoto(ctx, s, r);
  else drawPlaceholder(ctx, r);
  if (!layout.signatureInFrame) drawBrandPill(ctx, r);
  if (s.textStyle === "card") drawTextCard(ctx, s, r, withSignature);
  else if (s.textStyle === "bubble") drawBubble(ctx, s, r, withSignature);
  else drawCaption(ctx, s, r, withSignature);
  ctx.restore();

  if (s.frame === "full") drawPrideStripe(ctx);
  if (s.frame === "rainbow") {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 3;
    roundRectPath(ctx, r, layout.radius);
    ctx.stroke();
  }
  if (s.frame === "polaroid") drawPolaroidExtras(ctx, s, r);
}
