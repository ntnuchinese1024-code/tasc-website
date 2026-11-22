/**
 * 「政策島嶼」共用的型別。
 *
 * 一張島嶼圖＝一份資料檔（例如 `src/data/island-2026.ts`、
 * `src/data/newsletter-2026-autumn.ts`）＋ `src/components/island/IslandMap.astro`。
 * 型別放在這裡，資料檔跟畫圖的程式才不用互相 import。
 */

/**
 * 島的地貌。每一種在 `src/lib/island-art.ts` 裡有自己的岸線起伏、岩塊剖面、配色
 * 與樹種，在 IslandMap 裡還會多畫自己的地景（石階廣場、棧橋、山丘、小徑、燈串）。
 * 換一座島的 terrain，整座島的長相就會跟著換。
 */
export type Terrain =
  | "terrace" /* 環狀石階的廣場台地 */
  | "harbor" /* 灰藍岩的港灣，島外伸出棧橋 */
  | "highland" /* 針葉林高地 */
  | "meadow" /* 明亮草原，有小徑與水塘 */
  | "festival" /* 兩瓣的熱鬧島，掛著燈串 */;

/** 標誌色票裡可以用在島與地標上的顏色 */
export type IslandColor = "blue" | "red" | "green" | "orange" | "magenta";

/** 地標圖示；對應 `src/components/island/Structures.astro` 裡的 <symbol id="st-..."> */
export type IslandGlyph =
  | "lighthouse"
  | "harbor"
  | "plaza"
  | "academy"
  | "book"
  | "post"
  | "bridge"
  | "lookout"
  | "mic"
  | "ferry"
  | "lantern"
  | "globe"
  | "tent"
  | "screen"
  | "workshop"
  | "gallery";

/** 一座島＝一個主題區塊 */
export interface Region {
  id: string;
  /** 島名，會標在島的上方 */
  name: string;
  /** 一句話說明這座島是什麼，顯示在下方清單的分段標題旁 */
  note: string;
  color: IslandColor;
  /** 地貌：決定島的形狀、配色、樹種與島上的地景 */
  terrain: Terrain;
  /** 島中心（整張圖的座標） */
  cx: number;
  cy: number;
  /** 島的半徑；ry 比 rx 小很多，才有從斜上方看下去的感覺 */
  rx: number;
  ry: number;
  /** 島的厚度（草地到岩層底之間的那一圈土） */
  depth: number;
  /** 決定島輪廓起伏的亂數種子；同一個數字每次畫出來都一樣 */
  seed: number;
}

/** 掛在某個地標底下的小項目，只出現在說明卡裡，不在地圖上另外佔一個點 */
export interface SubItem {
  name: string;
  /** 目前進度，例如「招募中」 */
  status: string;
  /** 時間；查不到就寫「待確認」 */
  date: string;
  summary: string;
  href?: string;
}

export interface Landmark {
  /** 錨點與 DOM id，用英文小寫加連字號 */
  id: string;
  /** 所屬島嶼的 id */
  region: string;
  /** 島上的地標名稱（比喻用的名字，可以活潑一點） */
  name: string;
  /** 這件事實際上是什麼，例如「組織」「會員服務」 */
  kind: string;
  /** 目前進度，例如「已啟用」「招募中」 */
  status: string;
  /** 發生或啟用的時間；查不到就寫「待確認」 */
  date: string;
  /** 一句話說明這個新發展是什麼 */
  summary: string;
  /** 補充說明，一點一句，沒有就不寫 */
  details?: string[];
  /** 附屬在這個地標底下的小項目，沒有就不寫 */
  children?: SubItem[];
  /** 官網上對應的頁面，沒有對應頁面就不寫 */
  href?: string;
  color: IslandColor;
  glyph: IslandGlyph;
  /** 相對於所屬島中心的位移 */
  dx: number;
  dy: number;
  /** 標籤改放在圖示上方（同一座島標籤會撞在一起時才用） */
  labelAbove?: boolean;
}

/** 島跟島之間的航線。`bend` 是彎曲程度，正負決定往哪一邊鼓出去 */
export interface Route {
  from: string;
  to: string;
  bend: number;
}

/** 地圖的標題區文字與畫布大小 */
export interface IslandMeta {
  /** 小標，例如「115 年度」「第二期」 */
  year: string;
  title: string;
  lead: string;
  /** 畫布大小，不寫就是 1200 × 840。島多的時候要調高 */
  view?: { w: number; h: number };
}
