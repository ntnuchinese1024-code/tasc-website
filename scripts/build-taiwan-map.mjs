/**
 * 產生性諮商師名單頁的台灣縣市地圖（src/data/taiwan-map.json）。
 *
 * 平常不用跑：產出的 JSON 已經進版控，網站建置不需要這支腳本。
 * 只有要換地圖資料（例如縣市界線變動）或調整版面時才需要重跑。
 *
 * 用法（在 repo 根目錄）：
 *   npm i --no-save d3-geo@3 topojson-client@3 topojson-simplify@3 taiwan-atlas
 *   node scripts/build-taiwan-map.mjs
 *
 * 資料來源：taiwan-atlas（MIT 授權，Daniel Kao），由內政部「村里界圖」簡化而來。
 *
 * 版面：本島＋澎湖（含綠島、蘭嶼、小琉球、龜山島）用同一個投影；
 * 金門、馬祖離本島太遠，照比例放會讓整張圖縮到看不清楚，所以各畫一個小框放在左上角的海面上。
 * 馬祖的島很小又散得很開，照實際比例放進小框只剩幾個點，所以每座島以自己的中心放大（ISLAND_ZOOM），
 * 島與島的相對位置不變——這是離島插圖常用的誇張畫法，只用在小框裡。
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoMercator, geoPath } from "d3-geo";
import { feature, merge } from "topojson-client";
import { filter, filterWeight, presimplify, quantile, simplify, sphericalRingArea } from "topojson-simplify";

const require = createRequire(import.meta.url);
const raw = JSON.parse(readFileSync(require.resolve("taiwan-atlas/counties-10t.json"), "utf8"));

// 再簡化一次：名單頁的地圖只要看得出縣市輪廓，原始精度會讓 HTML 肥好幾倍。
// 小於約 1 平方公里的小島也拿掉（綠島、蘭嶼、小琉球、龜山島、澎湖主要島嶼都比這大）。
// 保留約 12% 的節點（檔案約 40KB）；數字越大越精細、檔案越大。
const SIMPLIFY_QUANTILE = Number(process.env.Q ?? 0.12);
const MIN_RING_SR = 1 / 6371 ** 2; // 1 km² 換算成球面度
let topo = presimplify(raw);
topo = simplify(topo, quantile(topo, SIMPLIFY_QUANTILE));
topo = filter(topo, filterWeight(topo, MIN_RING_SR, sphericalRingArea));

const counties = feature(topo, topo.objects.counties).features;

/** 縣市 → 名單頁用的代碼。要跟 src/data/counselor-directory.ts、報名系統的清單一致。 */
const CODE_BY_ID = {
  C: "keelung", A: "taipei", F: "new-taipei", H: "taoyuan", O: "hsinchu-city", J: "hsinchu-county",
  G: "yilan", K: "miaoli", B: "taichung", N: "changhua", M: "nantou", P: "yunlin",
  I: "chiayi-city", Q: "chiayi-county", D: "tainan", E: "kaohsiung", T: "pingtung",
  U: "hualien", V: "taitung", X: "penghu", W: "kinmen", Z: "lienchiang",
};

const WIDTH = 560;
const HEIGHT = 760;
const PAD = 14;

/** 小數點後一位就夠清楚，檔案小很多。 */
const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => (Math.round(Number(n) * 10) / 10).toString());

const main = counties.filter((f) => !["W", "Z"].includes(f.properties.COUNTYID));
const mainProjection = geoMercator().fitExtent(
  [
    [PAD + 40, PAD],
    [WIDTH - PAD, HEIGHT - PAD],
  ],
  { type: "FeatureCollection", features: main },
);

/** 左上角的兩個離島小框。 */
const INSETS = [
  { id: "Z", box: [PAD, PAD, 206, 156], title: "連江縣（馬祖）", islandZoom: 2 },
  { id: "W", box: [PAD, PAD + 170, 206, 118], title: "金門縣" },
];

/** 把多島縣市的每一座島，以它自己的中心放大 zoom 倍。 */
function zoomIslands(f, zoom) {
  if (!zoom || zoom === 1) return f;
  const polys = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
  const scaled = polys.map((poly) => {
    const outer = poly[0];
    const cx = outer.reduce((sum, p) => sum + p[0], 0) / outer.length;
    const cy = outer.reduce((sum, p) => sum + p[1], 0) / outer.length;
    return poly.map((ring) => ring.map(([x, y]) => [cx + (x - cx) * zoom, cy + (y - cy) * zoom]));
  });
  return { ...f, geometry: { type: "MultiPolygon", coordinates: scaled } };
}

const out = { width: WIDTH, height: HEIGHT, outline: "", insets: [], counties: [] };

// 本島＋澎湖的外框，用來畫地圖的「厚度」（往下疊幾層，看起來像立體的島）
out.outline = round(
  geoPath(mainProjection)(
    merge(topo, topo.objects.counties.geometries.filter((g) => !["W", "Z"].includes(g.properties.COUNTYID))),
  ),
);

for (const f of main) {
  const path = geoPath(mainProjection);
  const [x, y] = path.centroid(f);
  out.counties.push({
    code: CODE_BY_ID[f.properties.COUNTYID],
    d: round(path(f)),
    cx: Math.round(x),
    cy: Math.round(y),
  });
}

for (const inset of INSETS) {
  const f = zoomIslands(counties.find((c) => c.properties.COUNTYID === inset.id), inset.islandZoom);
  const [x0, y0, w, h] = inset.box;
  const projection = geoMercator().fitExtent(
    [
      [x0 + 14, y0 + 34],
      [x0 + w - 14, y0 + h - 12],
    ],
    f,
  );
  const path = geoPath(projection);
  const [cx, cy] = path.centroid(f);
  out.insets.push({ code: CODE_BY_ID[inset.id], title: inset.title, x: x0, y: y0, w, h });
  out.counties.push({ code: CODE_BY_ID[inset.id], d: round(path(f)), cx: Math.round(cx), cy: Math.round(cy) });
}

// 標籤位置微調：小縣市的形心會壓在鄰居上，或被其他標籤擠到
const NUDGE = {
  keelung: [14, -10],
  taipei: [-4, 2],
  "new-taipei": [-6, 30], // 新北的形心落在臺北市裡，名稱移到南邊比較寬的山區
  "hsinchu-city": [-14, 0],
  "chiayi-city": [-6, 0],
};
for (const c of out.counties) {
  const [dx, dy] = NUDGE[c.code] ?? [0, 0];
  c.cx += dx;
  c.cy += dy;
}

writeFileSync(new URL("../src/data/taiwan-map.json", import.meta.url), JSON.stringify(out));
console.log(`檔案大小約 ${Math.round(JSON.stringify(out).length / 1024)} KB`);
console.log(`已輸出 ${out.counties.length} 個縣市到 src/data/taiwan-map.json`);
