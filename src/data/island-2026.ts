/**
 * 「政策島嶼」——把學會 115（2026）年度的新發展畫成一片串聯起來的漂浮群島。
 *
 * 這個檔案只負責「島上有什麼」，畫面長怎樣在 `src/pages/island.astro`。
 * 要加一個新發展、改文案、換位置，改這裡就好，頁面會自動跟著變。
 *
 * 結構分兩層：
 *   `regions`（島）：一個島是一個主題區塊，例如「基礎建設島」。
 *   `landmarks`（地標）：一個新發展是島上的一個地標，用 `region` 指定它在哪座島。
 *
 * 幾個維護上的規矩：
 *   - **不編造**。每一個地標都要對得上官網或學會文件裡既有的事實（日期、名稱、
 *     狀態）。查不到的日期就留「待確認」，不要自己推算。也不要為了把島填滿
 *     而生出沒發生過的活動。
 *   - 島的 `cx`/`cy` 是整張圖的座標（viewBox 1200 × 840）；地標的 `dx`/`dy` 是
 *     **相對於所屬島中心**的位移，所以搬動整座島時，上面的地標會跟著走。
 *   - 地標的名稱標籤是一顆白色膠囊，寬度依字數自動算（一個字約 17px）。同一座島上
 *     的地標至少要隔開 ~90，不然膠囊會疊在一起；真的擠不下就把某一個設
 *     `labelAbove: true`，標籤會改放在圖示上方。改完一定要在瀏覽器上看一眼。
 *   - `color` 只能用學會標誌色（見 `src/styles/global.css`）。文字會自動用對應的
 *     `-deep` 版本，確保對比度夠。
 *   - `glyph` 是地標的圖示，可用的清單寫在 island.astro 的 <defs> 裡；
 *     要新的圖示就去那邊加一個 <symbol>。
 *   - 同一個地標底下附屬的小項目（例如學術組辦的各個讀書會）放進 `children`，
 *     不要各自佔一個地標。島上的地標數量要克制，擠在一起標籤就會疊。
 */

/**
 * 島的地貌。每一種在 `src/lib/island-art.ts` 裡有自己的岸線起伏、岩塊剖面、配色
 * 與樹種，在 island.astro 裡還會多畫自己的地景（石階廣場、棧橋、山丘、小徑、燈串）。
 * 換一座島的 terrain，整座島的長相就會跟著換。
 */
export type Terrain =
  | "terrace" /* 環狀石階的廣場台地 */
  | "harbor" /* 灰藍岩的港灣，島外伸出棧橋 */
  | "highland" /* 針葉林高地，底下垂一道瀑布 */
  | "meadow" /* 明亮草原，有小徑與水塘 */
  | "festival" /* 兩瓣的熱鬧島，掛著燈串 */;

/** 標誌色票裡可以用在島與地標上的顏色 */
export type IslandColor = "blue" | "red" | "green" | "orange" | "magenta";

/** 地標圖示；對應 island.astro <defs> 裡的 <symbol id="glyph-...">  */
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
  | "globe";

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
  /** 決定island輪廓起伏的亂數種子；同一個數字每次畫出來都一樣 */
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

/** 島的標題區文字 */
export const islandMeta = {
  year: "115 年度",
  title: "政策島嶼",
  lead: "學會這一年長出來的新東西，分成五座島排在這片海上，島跟島之間有橋相通。點一個地標，看看它是什麼。",
};

/**
 * 島跟島之間的航線。`bend` 是彎曲程度，正負決定往哪一邊鼓出去；
 * 照順序接成一圈，不要連成一團蜘蛛網。
 */
export const routes: { from: string; to: string; bend: number }[] = [
  { from: "infra", to: "annual", bend: -0.14 },
  { from: "annual", to: "academy", bend: -0.14 },
  { from: "academy", to: "public", bend: -0.16 },
  { from: "public", to: "service", bend: -0.1 },
  { from: "service", to: "infra", bend: -0.14 },
];

export const regions: Region[] = [
  {
    id: "annual",
    name: "年會島",
    note: "一年一度，大家上岸聚一次的地方。",
    color: "red",
    terrain: "terrace",
    cx: 600,
    cy: 132,
    rx: 134,
    ry: 70,
    depth: 30,
    seed: 1.7,
  },
  {
    id: "infra",
    name: "基礎建設島",
    note: "網站與報名系統，學會自己的地基。",
    color: "blue",
    terrain: "harbor",
    cx: 235,
    cy: 315,
    rx: 162,
    ry: 86,
    depth: 34,
    seed: 3.4,
  },
  {
    id: "academy",
    name: "學術島",
    note: "這一年新設的學術組，和它帶起來的讀書會。",
    color: "magenta",
    terrain: "highland",
    cx: 930,
    cy: 265,
    rx: 146,
    ry: 78,
    depth: 30,
    seed: 5.1,
  },
  {
    id: "service",
    name: "服務島",
    note: "會員與社會找得到學會的幾個窗口。",
    color: "orange",
    terrain: "meadow",
    cx: 360,
    cy: 580,
    rx: 186,
    ry: 96,
    depth: 36,
    seed: 2.3,
  },
  {
    id: "public",
    name: "參與島",
    note: "對外打開的活動、展覽與參訪。",
    color: "green",
    terrain: "festival",
    cx: 870,
    cy: 600,
    rx: 192,
    ry: 98,
    depth: 36,
    seed: 4.6,
  },
];

export const landmarks: Landmark[] = [
  // ---- 基礎建設島 ----
  {
    id: "website",
    region: "infra",
    name: "燈塔・新官網",
    kind: "基礎建設",
    status: "已啟用",
    date: "2026 年 8 月",
    summary: "學會有了自己的新官網，取代到期的 Weebly 舊站。",
    details: [
      "內容與程式碼都能完整搬遷，不再被平台綁住。",
      "舊站內容完整備份在 repo 裡，沒有遺失。",
      "維護者不需要工程背景，也能透過 AI 協作編輯內容。",
    ],
    href: "/",
    color: "blue",
    glyph: "lighthouse",
    dx: -62,
    dy: -12,
  },
  {
    id: "registration",
    region: "infra",
    name: "報名港",
    kind: "基礎建設",
    status: "營運中",
    date: "2026 年",
    summary: "學會自己的報名系統與秘書處後台，不再用 Google 表單。",
    details: [
      "報名、問卷、會員資料都收在學會自己的系統裡。",
      "秘書處在後台管理活動、名冊與課程回饋。",
      "官網上的課程與報導跟報名系統同步。",
    ],
    href: "/news",
    color: "blue",
    glyph: "harbor",
    dx: 66,
    dy: 20,
  },

  // ---- 年會島 ----
  {
    id: "annual-2026",
    region: "annual",
    name: "年會廣場",
    kind: "年度大會",
    status: "已完成",
    date: "2026 年 6 月 6 日",
    summary: "2026 年會：性諮商，佇台灣（TĪ TÂI-UÂN）──本土文化中的實務經驗與對話。",
    href: "/annual/2026",
    color: "red",
    glyph: "plaza",
    dx: 0,
    dy: 2,
  },

  // ---- 學術島 ----
  // 兩個讀書會都是學術組辦的，收在這個地標底下，不在島上各佔一個點。
  {
    id: "academic-group",
    region: "academy",
    name: "學術學院",
    kind: "組織",
    status: "新設",
    date: "2026 年 10 月 11 日",
    summary: "理監事會議通過新設學術組，成為理事長底下第六個工作小組。",
    details: [
      "辦理讀書會、文獻導讀與案例研討。",
      "組織簡則依當次會議通過的條文全文公開。",
    ],
    children: [
      {
        name: "獵捕計畫讀書會",
        status: "招募中",
        date: "2026 年",
        summary: "線上讀書會，讀校園性侵害與權力結構。",
        href: "/about/groups/academic#hunt",
      },
      {
        name: "讀點新的",
        status: "12 月開跑",
        date: "2026 年 12 月",
        summary: "性諮商國際研究共學圈，一起讀國際上的新研究。",
        href: "/about/groups/academic#read-new-research",
      },
    ],
    href: "/about/groups/academic",
    color: "magenta",
    glyph: "academy",
    dx: 0,
    dy: 2,
  },

  // ---- 服務島 ----
  {
    id: "directory",
    region: "service",
    name: "名錄瞭望台",
    kind: "會員服務",
    status: "上線",
    date: "2026 年 11 月",
    summary: "性諮商師名錄加上地圖與搜尋，可以依地區、專長、關鍵字找人。",
    details: [
      "性諮商師自己填資料，秘書處審核通過後才公開。",
      "工作地區只到縣市，想寫細的人自己補一句執業地點說明。",
      "篩選條件會寫進網址，可以直接分享。",
    ],
    href: "/counselors",
    color: "green",
    glyph: "lookout",
    dx: -84,
    dy: -20,
  },
  {
    id: "invite",
    region: "service",
    name: "講師驛站",
    kind: "對外服務",
    status: "開放中",
    date: "2026 年",
    summary: "機關學校可以直接從官網提出講師邀約。",
    href: "/invite",
    color: "orange",
    glyph: "mic",
    dx: 74,
    dy: -24,
  },
  {
    id: "newsletter",
    region: "service",
    name: "電子報郵局",
    kind: "對外溝通",
    status: "創刊",
    date: "2026 年 4 月 14 日",
    summary: "學會電子報創刊，固定向會員報告學會紀事與活動。",
    details: ["創刊號：理事長的話、學會紀事、各小組介紹、活動快報與預告。"],
    href: "/newsletter",
    color: "orange",
    glyph: "post",
    dx: 8,
    dy: 46,
  },

  // ---- 參與島 ----
  {
    id: "pride-2026",
    region: "public",
    name: "彩虹橋・同遊照片牆",
    kind: "公眾參與",
    status: "展出中",
    date: "2026 年 10 月",
    summary: "同遊前的網路串聯：做一張挺多元圖卡，夾上照片牆。",
    href: "/pride",
    color: "magenta",
    glyph: "bridge",
    dx: -80,
    dy: -34,
  },
  {
    id: "anniversary-2026",
    region: "public",
    name: "辦桌廣場・時光留言席",
    kind: "公眾參與",
    status: "展出中",
    date: "2026 年 9 月",
    summary: "從 2013 年凱道辦桌成會到今天，挑一道菜、敬一杯茶，留下回憶與祝福。",
    href: "/anniversary",
    color: "red",
    glyph: "lantern",
    dx: 56,
    dy: -10,
    labelAbove: true,
  },
  {
    id: "museum-visit",
    region: "public",
    name: "參訪渡口",
    kind: "專業活動",
    status: "已完成",
    date: "2026 年 10 月 8 日",
    summary: "2026 秋季專業參訪：月經博物館。",
    color: "green",
    glyph: "ferry",
    dx: -46,
    dy: 42,
  },
];
