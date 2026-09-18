/**
 * /pride 圖卡的畫法（只在瀏覽器裡跑）。
 *
 * 整張卡都在使用者自己的瀏覽器用 <canvas> 畫出來：照片不會上傳到任何地方，
 * 官網也不需要主機或資料庫，這是這個工具最重要的承諾，改動時請維持。
 *
 * 版面（1080×1080，IG／FB 正方形規格）：
 *   上：學會三人環標誌 + 名稱
 *   下：半透明黑色漸層 → 彩虹短條 → 金句 → 署名
 *   最底：包含跨性別與有色族群配色的進步彩虹條（Progress Pride）
 */

export const SIZE = 1080;
const PAD = 84;

export interface CardState {
  image: HTMLImageElement | null;
  /** 1 = 剛好填滿（cover），越大越放大 */
  zoom: number;
  /** 使用者拖曳造成的位移，單位是畫布像素，0 = 置中 */
  offsetX: number;
  offsetY: number;
  quote: string;
  signature: string;
}

const RAINBOW = ["#E40303", "#FF8C00", "#FFED00", "#008026", "#24408E", "#732982"];
/** 進步彩虹旗的箭頭色：黑、棕（有色族群），淺藍、粉、白（跨性別） */
const PROGRESS = ["#000000", "#784F17", "#5BCEFA", "#F5A9B8", "#FFFFFF"];

const FONT_QUOTE = '"Noto Serif TC", "Songti TC", "Source Han Serif TC", "PMingLiU", serif';
const FONT_SANS = '"Noto Sans TC", "PingFang TC", "Hiragino Sans", "Microsoft JhengHei", sans-serif';

/* ---- 照片位置 ------------------------------------------------------------ */

function coverSize(img: HTMLImageElement, zoom: number) {
  const scale = Math.max(SIZE / img.naturalWidth, SIZE / img.naturalHeight) * zoom;
  return { w: img.naturalWidth * scale, h: img.naturalHeight * scale };
}

/** 把拖曳位移限制在「照片仍然蓋滿整張卡」的範圍內，避免露出空白邊。 */
export function clampOffset(img: HTMLImageElement, zoom: number, x: number, y: number) {
  const { w, h } = coverSize(img, zoom);
  const maxX = (w - SIZE) / 2;
  const maxY = (h - SIZE) / 2;
  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
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
 *      寧可字小一點（最小 52px），也不要把詞從中間切開。
 *   2. 放不下（例如使用者自己寫的長句）才自動斷行，塞得進 4 行為止，最小 44px。
 */
function fitQuote(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const paragraphs = text.split("\n").map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length <= 4) {
    for (let size = 72; size >= 52; size -= 2) {
      ctx.font = `700 ${size}px ${FONT_QUOTE}`;
      if (paragraphs.every((p) => ctx.measureText(p).width <= maxWidth)) return { size, lines: paragraphs };
    }
  }
  for (let size = 72; size >= 44; size -= 2) {
    ctx.font = `700 ${size}px ${FONT_QUOTE}`;
    const lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= 4 || size === 44) return { size, lines: lines.slice(0, 5) };
  }
  return { size: 44, lines: [] };
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

/* ---- 各圖層 -------------------------------------------------------------- */

/** 還沒放照片時的底：深色 + 標誌色的柔光，本身也能當一張純文字圖卡用 */
function drawPlaceholder(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#211B14";
  ctx.fillRect(0, 0, SIZE, SIZE);
  const glows: [number, number, number, string][] = [
    [180, 200, 620, "rgba(0, 159, 232, 0.42)"],
    [940, 320, 560, "rgba(231, 19, 116, 0.36)"],
    [620, 760, 640, "rgba(255, 196, 0, 0.22)"],
    [120, 900, 480, "rgba(30, 171, 57, 0.22)"],
  ];
  for (const [x, y, r, color] of glows) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(33, 27, 20, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }
  drawRing(ctx, 560, 120, 460, 0.12);
}

function drawPhoto(ctx: CanvasRenderingContext2D, s: CardState) {
  const img = s.image!;
  const { w, h } = coverSize(img, s.zoom);
  const { x, y } = clampOffset(img, s.zoom, s.offsetX, s.offsetY);
  ctx.fillStyle = "#211B14";
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (SIZE - w) / 2 + x, (SIZE - h) / 2 + y, w, h);
}

function drawScrims(ctx: CanvasRenderingContext2D) {
  // 上方淡淡一層，讓標誌在亮色照片上也看得清楚
  const top = ctx.createLinearGradient(0, 0, 0, 240);
  top.addColorStop(0, "rgba(0, 0, 0, 0.45)");
  top.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, SIZE, 240);

  // 下方主要遮罩：確保白字在任何照片上都有足夠對比
  const from = SIZE * 0.34;
  const bottom = ctx.createLinearGradient(0, from, 0, SIZE);
  bottom.addColorStop(0, "rgba(0, 0, 0, 0)");
  bottom.addColorStop(0.4, "rgba(0, 0, 0, 0.5)");
  bottom.addColorStop(1, "rgba(0, 0, 0, 0.86)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, from, SIZE, SIZE - from);
}

function drawBrand(ctx: CanvasRenderingContext2D) {
  const cx = PAD + 38;
  const cy = 76 + 38;
  const name = "台灣性諮商學會";
  const sub = "TASC  ·  2026 PRIDE";

  // 半透明深色膠囊墊在標誌與名稱後面：照片再亮（天空、白牆）字也看得清楚
  ctx.font = `700 32px ${FONT_SANS}`;
  const textW = ctx.measureText(name).width;
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
  const pillX = cx - 48;
  const pillW = 48 + 60 + textW + 34;
  ctx.beginPath();
  // 舊版 Safari（iOS 15 以前）沒有 roundRect，用兩個半圓 + 長方形拼出來
  ctx.arc(pillX + 48, cy, 48, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.arc(pillX + pillW - 48, cy, 48, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.fill();
  drawRing(ctx, cx - 30, cy - 30, 60);

  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 32px ${FONT_SANS}`;
  ctx.fillText(name, cx + 60, cy + 2);
  ctx.font = `600 20px ${FONT_SANS}`;
  ctx.globalAlpha = 0.85;
  ctx.fillText(sub, cx + 61, cy + 32);
  ctx.restore();
}

function drawQuoteBlock(ctx: CanvasRenderingContext2D, s: CardState) {
  const maxWidth = SIZE - PAD * 2;
  const signatureY = SIZE - 78;
  const { size, lines } = fitQuote(ctx, s.quote, maxWidth);
  const lineHeight = size * 1.42;
  const blockBottom = signatureY - 88;
  const firstBaseline = blockBottom - lineHeight * (lines.length - 1);

  // 金句上方的彩虹短條
  const barY = firstBaseline - size - 40;
  const segW = 26;
  RAINBOW.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(PAD + i * segW, barY, segW, 8);
  });

  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 14;
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${size}px ${FONT_QUOTE}`;
  lines.forEach((line, i) => ctx.fillText(line, PAD, firstBaseline + i * lineHeight));
  ctx.restore();

  // 分隔細線 + 署名
  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  ctx.fillRect(PAD, signatureY - 44, maxWidth, 1.5);
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  let sigSize = 28;
  ctx.font = `500 ${sigSize}px ${FONT_SANS}`;
  while (ctx.measureText(s.signature).width > maxWidth && sigSize > 20) {
    sigSize -= 1;
    ctx.font = `500 ${sigSize}px ${FONT_SANS}`;
  }
  ctx.fillText(s.signature, PAD, signatureY);
  ctx.restore();
}

/** 最底部的進步彩虹條：先是跨性別與有色族群的五色，再接六色彩虹 */
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

export function drawCard(ctx: CanvasRenderingContext2D, s: CardState) {
  ctx.clearRect(0, 0, SIZE, SIZE);
  if (s.image) drawPhoto(ctx, s);
  else drawPlaceholder(ctx);
  drawScrims(ctx);
  drawBrand(ctx);
  drawQuoteBlock(ctx, s);
  drawPrideStripe(ctx);
}
