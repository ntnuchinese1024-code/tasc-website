/**
 * 政策島嶼（/island）的畫圖幾何。
 *
 * 這個檔案只算「形狀」，不碰文案也不碰版面：`src/pages/island.astro` 把這裡算出來的
 * 路徑與座標畫成 SVG。分開的原因是五座島各有不同地貌，形狀的程式碼比版面還長。
 *
 * 島的做法（2026-11 改版，參考低面數 3D 算圖的群島）：
 *   一座島是**兩層等角六角柱**浮在海面上——下面一層大一點、矮一點，露出來的那一圈
 *   就是岸邊的台階；上面一層是草地。柱子的三個前側面各有不同明暗，左亮右暗，
 *   所以不用 3D 函式庫也有體積。島底下再加水線光暈與兩圈漣漪。
 *
 * 其它原則：
 *   - 所有起伏都用 `seed` 算（不是 `Math.random`），每次建置畫出來都一樣。
 *   - 島上的東西（草叢、樹、小房子、路燈）都要先過 `insideHex` 檢查，否則會長到海裡。
 */
import type { Region, Terrain } from "../data/island-2026";

export const n = (v: number) => Math.round(v * 10) / 10;

const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ */
/* 配色：一座島一套，草、岩、樹都換色，五座島才不會像同一塊貼紙        */
/* ------------------------------------------------------------------ */

export interface TerrainSkin {
  /** 草地由亮到暗 */
  grass: [string, string, string];
  /** 下層台階的頂面（沙岸／石板） */
  ledge: string;
  /** 柱子的三個側面：左、前、右 */
  cliff: [string, string, string];
  tree: string;
  treeDark: string;
  tuft: string;
  /** 小房子的屋頂 */
  roof: string;
}

export const skins: Record<Terrain, TerrainSkin> = {
  // 年會島：暖黃綠的草皮、米色砂岩
  terrace: {
    grass: ["#E4EFB0", "#C2D97F", "#9FBE63"],
    ledge: "#E8D7A8",
    cliff: ["#B9A079", "#9A8160", "#756043"],
    tree: "#6FA152",
    treeDark: "#4E7A3B",
    tuft: "#86AE5F",
    roof: "#C8553D",
  },
  // 基礎建設島：冷調草地配灰藍岩
  harbor: {
    grass: ["#CDE7C8", "#9CCBA3", "#74AC82"],
    ledge: "#D6DCDD",
    cliff: ["#9BA9B8", "#7C8A99", "#5C6775"],
    tree: "#5E9A7C",
    treeDark: "#3F7459",
    tuft: "#74A98A",
    roof: "#3B7CA8",
  },
  // 學術島：深綠針葉林配帶紫的岩
  highland: {
    grass: ["#CAE4AD", "#95C47A", "#6A9D5C"],
    ledge: "#DCD2DE",
    cliff: ["#9C8CA8", "#7D6E8A", "#5B4F68"],
    tree: "#3F7A52",
    treeDark: "#2C5C3C",
    tuft: "#6E9E63",
    roof: "#8E4C86",
  },
  // 服務島：最亮的草原，米黃砂岩
  meadow: {
    grass: ["#E9F2B4", "#C5DF8C", "#A0C76D"],
    ledge: "#EEDDB2",
    cliff: ["#C0A77E", "#A08963", "#796448"],
    tree: "#74A857",
    treeDark: "#538040",
    tuft: "#8CB763",
    roof: "#D98033",
  },
  // 參與島：熱鬧一點的亮綠
  festival: {
    grass: ["#D5EFBD", "#A7D892", "#7CB873"],
    ledge: "#E3D9BE",
    cliff: ["#AC9D86", "#8B7C68", "#67594A"],
    tree: "#68A95F",
    treeDark: "#467F46",
    tuft: "#83BB74",
    roof: "#4E9B5B",
  },
};

/* ------------------------------------------------------------------ */
/* 六角柱                                                              */
/* ------------------------------------------------------------------ */

type Pt = [number, number];

/** 等角六角形的六個頂點：尖角在左右，上下是平的 */
export function hexPoints(cx: number, cy: number, rx: number, ry: number): Pt[] {
  return [0, 60, 120, 180, 240, 300].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Pt;
  });
}

/** 把多邊形的角磨圓（每個角切掉 r，再用一段二次貝茲接起來） */
export function roundedPoly(pts: Pt[], r = 16) {
  const len = pts.length;
  const unit = (from: Pt, to: Pt): Pt => {
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const d = Math.hypot(dx, dy) || 1;
    return [dx / d, dy / d];
  };
  let d = "";
  for (let i = 0; i < len; i++) {
    const p0 = pts[(i - 1 + len) % len];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % len];
    // 角太尖或邊太短時要收斂，不然圓角會互相吃掉
    const rr = Math.min(r, Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 2.2, Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 2.2);
    const v0 = unit(p0, p1);
    const v1 = unit(p1, p2);
    const a: Pt = [p1[0] - v0[0] * rr, p1[1] - v0[1] * rr];
    const b: Pt = [p1[0] + v1[0] * rr, p1[1] + v1[1] * rr];
    d += `${i === 0 ? "M" : " L"} ${n(a[0])} ${n(a[1])} Q ${n(p1[0])} ${n(p1[1])} ${n(b[0])} ${n(b[1])}`;
  }
  return `${d} Z`;
}

export interface Prism {
  /** 頂面（圓角六角形） */
  top: string;
  /** 整根柱子的正面輪廓，當底色用，避免三個面之間出現接縫 */
  body: string;
  /** 前面三個側面：0 右、1 前、2 左 */
  faces: { d: string; tone: 0 | 1 | 2 }[];
  /** 頂面與側面交界的那條邊，描一條亮線當受光 */
  brim: string;
  /** 側面中段的岩層線 */
  strata: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  h: number;
  /** 柱子最底下的 y（水線） */
  bottom: number;
}

function prism(cx: number, cy: number, rx: number, ry: number, h: number, round: number): Prism {
  const pts = hexPoints(cx, cy, rx, ry);
  // 角度 0→60→120→180 這三條邊是看得到的前側面
  const faces = ([0, 1, 2] as const).map((i) => {
    const p = pts[i];
    const q = pts[i + 1];
    return {
      d: `M ${n(p[0])} ${n(p[1])} L ${n(q[0])} ${n(q[1])} L ${n(q[0])} ${n(q[1] + h)} L ${n(p[0])} ${n(p[1] + h)} Z`,
      tone: i as 0 | 1 | 2,
    };
  });
  const front = [pts[0], pts[1], pts[2], pts[3]];
  const body =
    `M ${front.map((p) => `${n(p[0])} ${n(p[1])}`).join(" L ")} ` +
    `L ${n(pts[3][0])} ${n(pts[3][1] + h)} ` +
    `L ${n(pts[2][0])} ${n(pts[2][1] + h)} L ${n(pts[1][0])} ${n(pts[1][1] + h)} ` +
    `L ${n(pts[0][0])} ${n(pts[0][1] + h)} Z`;
  const brim = `M ${front.map((p) => `${n(p[0])} ${n(p[1])}`).join(" L ")}`;
  const strata = `M ${front.map((p) => `${n(p[0])} ${n(p[1] + h * 0.45)}`).join(" L ")}`;
  return {
    top: roundedPoly(pts, round),
    body,
    faces,
    brim,
    strata,
    cx,
    cy,
    rx,
    ry,
    h,
    bottom: cy + ry * 0.866 + h,
  };
}

/** 一座島＝上下兩層六角柱 */
export function tiers(r: Region) {
  const upper = prism(r.cx, r.cy, r.rx, r.ry, r.depth * 0.95, 18);
  const lower = prism(r.cx, r.cy + r.ry * 0.22, r.rx * 1.1, r.ry * 1.1, r.depth * 0.6, 20);
  return { upper, lower };
}

/** 水線上的光暈與兩圈漣漪 */
export function waterRings(r: Region) {
  const { lower } = tiers(r);
  const y = lower.bottom - 4;
  return {
    glow: { cx: r.cx, cy: y, rx: lower.rx * 1.16, ry: lower.ry * 0.42 },
    rings: [1.3, 1.6].map((k, i) => ({
      cx: r.cx,
      cy: y + 6 + i * 9,
      rx: lower.rx * k,
      ry: lower.ry * (0.4 + i * 0.1),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* 島上的細節                                                          */
/* ------------------------------------------------------------------ */

/** 點在不在六角形裡面（k 是留邊，1 是剛好到邊上） */
export function insideHex(r: Region, x: number, y: number, k = 0.78) {
  const u = (x - r.cx) / (r.rx * k);
  const v = (y - r.cy) / (r.ry * k);
  const s = 0.866;
  return Math.abs(v) <= s && Math.abs(u * s + v * 0.5) <= s && Math.abs(u * s - v * 0.5) <= s;
}

export interface Spot {
  x: number;
  y: number;
  s: number;
}

/** 黃金角散點：同一個 seed 每次都一樣，而且不會擠成一團 */
function scatter(r: Region, count: number, from: number, spread: number) {
  const out: Spot[] = [];
  for (let i = 0; i < count; i++) {
    const a = r.seed * 1.3 + (i + from) * 2.39996;
    const rad = Math.sqrt((i + 0.5) / count) * spread;
    out.push({
      x: r.cx + Math.cos(a) * r.rx * rad,
      y: r.cy + Math.sin(a) * r.ry * rad * 0.92,
      s: 0.7 + 0.5 * Math.abs(Math.sin(r.seed + i * 1.7)),
    });
  }
  return out;
}

/** 草叢：小而多，純粹讓草地不要是一片死色 */
export function tufts(r: Region) {
  return scatter(r, 52, 0, 0.95).filter((p) => insideHex(r, p.x, p.y, 0.86));
}

export type TreeKind = "pine" | "round" | "palm" | "cypress" | "bush";

const treeKinds: Record<Terrain, TreeKind[]> = {
  terrace: ["cypress", "round"],
  harbor: ["bush", "round"],
  highland: ["pine", "pine", "round"],
  meadow: ["round", "bush"],
  festival: ["palm", "round"],
};

export interface Tree extends Spot {
  kind: TreeKind;
}

/** 樹：避開地標，由遠而近排序（後畫的蓋住先畫的） */
export function treeSpots(r: Region, marks: { x: number; y: number }[]) {
  const kinds = treeKinds[r.terrain];
  const want = r.terrain === "highland" ? 10 : 8;
  const out: Tree[] = [];
  scatter(r, 30, 3, 0.92).forEach((p, i) => {
    if (out.length >= want) return;
    if (!insideHex(r, p.x, p.y, 0.8)) return;
    if (marks.some((m) => Math.hypot((m.x - p.x) / 1.1, (m.y - p.y) * 1.5) < 56)) return;
    if (out.some((t) => Math.hypot(t.x - p.x, (t.y - p.y) * 1.6) < 32)) return;
    out.push({ ...p, s: 0.7 + 0.34 * Math.abs(Math.sin(r.seed * 1.7 + i)), kind: kinds[i % kinds.length] });
  });
  return out.sort((a, b) => a.y - b.y);
}

/** 島上的小房子：代表島上的人家，夜裡窗戶會亮 */
export function houses(r: Region, marks: { x: number; y: number }[], trees: Spot[]) {
  const out: Spot[] = [];
  scatter(r, 26, 11, 0.86).forEach((p) => {
    if (out.length >= (r.rx > 170 ? 6 : 4)) return;
    if (!insideHex(r, p.x, p.y, 0.72)) return;
    if (marks.some((m) => Math.hypot((m.x - p.x) / 1.1, (m.y - p.y) * 1.5) < 62)) return;
    if (trees.some((t) => Math.hypot(t.x - p.x, (t.y - p.y) * 1.6) < 30)) return;
    if (out.some((h) => Math.hypot(h.x - p.x, (h.y - p.y) * 1.6) < 46)) return;
    out.push({ ...p, s: 0.46 + 0.1 * (p.s - 0.7) });
  });
  return out.sort((a, b) => a.y - b.y);
}

/** 路燈：夜裡會亮的小光點，放在島的前緣 */
export function lampSpots(r: Region) {
  return [-0.46, 0.2, 0.62]
    .map((k) => ({ x: r.cx + r.rx * k, y: r.cy + r.ry * (0.52 - Math.abs(k) * 0.12), s: 1 }))
    .filter((p) => insideHex(r, p.x, p.y, 0.86));
}

/* ------------------------------------------------------------------ */
/* 各島專屬的地貌                                                      */
/* ------------------------------------------------------------------ */

/** 年會島：環狀石階廣場 */
export function terraceRings(r: Region) {
  return [0.58, 0.43, 0.28].map((k, i) => ({
    cx: r.cx,
    cy: r.cy + r.ry * 0.1 + i * 3,
    rx: r.rx * k,
    ry: r.ry * k * 0.7,
  }));
}

/** 基礎建設島：伸出島外、架在水上的棧橋 */
export function pier(r: Region) {
  const x0 = r.cx + r.rx * 0.48;
  const y0 = r.cy + r.ry * 0.3;
  const x1 = r.cx + r.rx * 1.3;
  const y1 = r.cy + r.ry * 0.86;
  const deck = `M ${n(x0)} ${n(y0)} L ${n(x1)} ${n(y1 - 6)} L ${n(x1)} ${n(y1 + 2)} L ${n(x0)} ${n(y0 + 9)} Z`;
  const posts = [0.45, 0.72, 0.96].map((t) => {
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t + 6;
    return `M ${n(x)} ${n(y)} v ${n(14 + t * 12)}`;
  });
  return { deck, posts, end: { x: x1, y: y1 + 6 } };
}

/** 學術島：山丘與等高線 */
export function hill(r: Region) {
  const cx = r.cx;
  const base = r.cy + r.ry * 0.08;
  const w = r.rx * 0.52;
  const h = r.ry * 0.7;
  const mound = `M ${n(cx - w)} ${n(base)} C ${n(cx - w * 0.72)} ${n(base - h)} ${n(cx + w * 0.62)} ${n(
    base - h * 1.04
  )} ${n(cx + w)} ${n(base - 2)} Z`;
  const contours = [0.34, 0.6].map((k) => {
    const ww = w * (1 - k * 0.5);
    const yy = base - h * k * 0.8;
    return `M ${n(cx - ww)} ${n(yy)} Q ${n(cx)} ${n(yy + 10)} ${n(cx + ww)} ${n(yy - 2)}`;
  });
  return { mound, contours };
}

/** 服務島：一條彎曲的小徑和一口小池塘 */
export function meadowFeatures(r: Region) {
  const path = `M ${n(r.cx - r.rx * 0.52)} ${n(r.cy + r.ry * 0.4)} C ${n(r.cx - r.rx * 0.18)} ${n(
    r.cy + r.ry * 0.44
  )} ${n(r.cx - r.rx * 0.04)} ${n(r.cy - r.ry * 0.1)} ${n(r.cx + r.rx * 0.4)} ${n(r.cy - r.ry * 0.18)}`;
  const pond = {
    cx: r.cx - r.rx * 0.1,
    cy: r.cy + r.ry * 0.5,
    rx: r.rx * 0.18,
    ry: r.ry * 0.14,
  };
  return { path, pond };
}

/** 參與島：兩根竹竿之間掛一串燈 */
export function lanternString(r: Region) {
  const x0 = r.cx - r.rx * 0.56;
  const x1 = r.cx + r.rx * 0.16;
  const y0 = r.cy - r.ry * 0.3;
  const y1 = r.cy - r.ry * 0.42;
  const sag = 24;
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + sag;
  const wire = `M ${n(x0)} ${n(y0)} Q ${n(mx)} ${n(my)} ${n(x1)} ${n(y1)}`;
  const lamps = [0.25, 0.5, 0.75].map((t) => ({
    x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1,
    y: (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1,
  }));
  return { wire, lamps, poles: [{ x: x0, y: y0 }, { x: x1, y: y1 }] };
}

/* ------------------------------------------------------------------ */
/* 橋與散步路徑                                                        */
/* ------------------------------------------------------------------ */

export interface Bridge {
  /** 橋面的中心線，人就沿著這條走 */
  deck: string;
  /** 橋的左右兩條欄杆 */
  rails: [string, string];
  /** 橋墩 */
  posts: string[];
  /** 落在水面上的影子 */
  shadow: string;
}

/**
 * 兩座島之間的拱橋。從 a 的邊緣拉到 b 的邊緣（不是中心），
 * `bend` 是拱起來的幅度。
 */
export function bridge(a: Region, b: Region, bend: number): Bridge {
  const ax0 = a.cx;
  const ay0 = a.cy + a.ry * 0.5;
  const bx0 = b.cx;
  const by0 = b.cy + b.ry * 0.5;
  const dx = bx0 - ax0;
  const dy = by0 - ay0;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // 從島中心往對方的方向退到島緣，橋才不會插進島裡
  const inset = (r: Region) => Math.min(r.rx, r.ry * 1.6) * 0.82;
  const ax = ax0 + ux * inset(a);
  const ay = ay0 + uy * inset(a);
  const bx = bx0 - ux * inset(b);
  const by = by0 - uy * inset(b);
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2 - Math.abs(len) * Math.abs(bend);
  const curve = (ox: number, oy: number) =>
    `M ${n(ax + ox)} ${n(ay + oy)} Q ${n(mx + ox)} ${n(my + oy)} ${n(bx + ox)} ${n(by + oy)}`;
  const posts = [0.22, 0.5, 0.78].map((t) => {
    const x = (1 - t) ** 2 * ax + 2 * (1 - t) * t * mx + t * t * bx;
    const y = (1 - t) ** 2 * ay + 2 * (1 - t) * t * my + t * t * by;
    return `M ${n(x)} ${n(y + 4)} V ${n(y + 26 + t * 6)}`;
  });
  return {
    deck: curve(0, 0),
    rails: [curve(0, -7), curve(0, 4)],
    posts,
    shadow: curve(4, 26),
  };
}

/** 島上散步用的環狀路徑 */
export function strollPath(r: Region, k: number) {
  const rx = r.rx * (0.34 + k * 0.14);
  const ry = r.ry * (0.26 + k * 0.11);
  const cy = r.cy + r.ry * 0.18;
  return `M ${n(r.cx - rx)} ${n(cy)} A ${n(rx)} ${n(ry)} 0 1 0 ${n(r.cx + rx)} ${n(cy)} A ${n(rx)} ${n(
    ry
  )} 0 1 0 ${n(r.cx - rx)} ${n(cy)}`;
}

/** 遠方的小島：只是海面上的一塊剪影 */
export function isletPath(cx: number, cy: number, rx: number, ry: number) {
  const pts = hexPoints(cx, cy, rx, ry);
  return roundedPoly(pts, 10);
}
