/**
 * 第二期電子報（2026 秋冬）的內容：創刊號之後、到 11 月底的學會更新。
 *
 * 做成「政策島嶼」的樣子——跟 /island 共用
 * `src/components/island/IslandMap.astro`，所以這個檔案只寫「島上有什麼」。
 * 頁面在 `src/pages/newsletter/2026-autumn.astro`。
 *
 * 維護上的規矩（跟 `src/data/island-2026.ts` 一樣）：
 *   - **不編造**。每一筆都要對得上官網或學會文件裡既有的事實（日期、名稱、講師、
 *     狀態）。查不到的日期就寫「待確認」，不要自己推算，也不要為了把島填滿而生出
 *     沒發生過的活動。這一期的時間範圍是 2026-04-14（創刊號出刊）之後到 11 月底。
 *   - 島的 `cx`/`cy` 是整張圖的座標（這一期的畫布是 1200 × 960）；地標的 `dx`/`dy`
 *     是**相對於所屬島中心**的位移，搬動整座島，上面的地標會跟著走。
 *   - 地標的名稱標籤是一顆白色膠囊，寬度依字數自動算（一個字約 17px）。同一座島上
 *     的地標至少要隔開 ~95，不然膠囊會疊在一起；真的擠不下就把某一個設
 *     `labelAbove: true`。改完一定要在瀏覽器上看一眼。
 *   - 同一個地標底下的小項目（年會的三場專題、八月的兩場工作坊）放進 `children`，
 *     不要各自佔一個地標。
 *   - `glyph` 是地標的小建築，清單在 `src/components/island/Structures.astro`；
 *     這一期刻意讓 16 個地標各用一種，沒有重複。
 */
import type { IslandMeta, Landmark, Region, Route } from "../lib/island-types";

/** 這一期的期別資訊。出刊日還沒定，所以只寫涵蓋的範圍。 */
export const issueMeta = {
  issue: "第二期",
  title: "2026 秋冬電子報",
  /** 這一期收錄的時間範圍 */
  period: "2026 年 4 月中（創刊號之後）～ 11 月底",
  /** 出刊日；定了再填成 YYYY-MM-DD */
  date: "待確認",
};

export const islandMeta: IslandMeta = {
  year: issueMeta.issue,
  title: "政策島嶼",
  lead:
    "這是學會的第二期電子報。創刊號出刊之後到十一月底，學會做的事分成六座島排在這片海上，島跟島之間有橋相通。點島上任何一個地標，就會跳出那件事的說明和連結。",
  view: { w: 1200, h: 960 },
};

/** 島跟島之間的航線，照順序接成一圈 */
export const routes: Route[] = [
  { from: "infra", to: "annual", bend: -0.14 },
  { from: "annual", to: "org", bend: -0.14 },
  { from: "org", to: "service", bend: -0.12 },
  { from: "service", to: "public", bend: -0.12 },
  { from: "public", to: "course", bend: -0.1 },
  { from: "course", to: "infra", bend: -0.14 },
];

export const regions: Region[] = [
  {
    id: "annual",
    name: "年會島",
    note: "六月那一天，大家上岸聚一次的地方。",
    color: "red",
    terrain: "terrace",
    cx: 560,
    cy: 132,
    rx: 132,
    ry: 68,
    depth: 30,
    seed: 1.7,
  },
  {
    id: "infra",
    name: "基礎建設島",
    note: "官網與報名系統，八月之後真的對外開著的那個地基。",
    color: "blue",
    terrain: "harbor",
    cx: 230,
    cy: 350,
    rx: 164,
    ry: 86,
    depth: 34,
    seed: 3.4,
  },
  {
    id: "org",
    name: "組織島",
    note: "學會內部長出來的新單位與補齊的規章。",
    color: "magenta",
    terrain: "highland",
    cx: 962,
    cy: 292,
    rx: 142,
    ry: 76,
    depth: 30,
    seed: 5.1,
  },
  {
    id: "service",
    name: "服務島",
    note: "會員與外界找得到學會的幾個窗口。",
    color: "green",
    terrain: "meadow",
    cx: 980,
    cy: 572,
    rx: 166,
    ry: 86,
    depth: 32,
    seed: 6.2,
  },
  {
    id: "course",
    name: "課程島",
    note: "這半年開的課、沙龍、走讀與參訪，還有正在報名的。",
    color: "orange",
    terrain: "meadow",
    cx: 420,
    cy: 690,
    rx: 216,
    ry: 112,
    depth: 36,
    seed: 2.3,
  },
  {
    id: "public",
    name: "參與島",
    note: "對外打開、到現在還可以參與的互動展覽。",
    color: "red",
    terrain: "festival",
    cx: 820,
    cy: 790,
    rx: 168,
    ry: 86,
    depth: 34,
    seed: 4.6,
  },
];

export const landmarks: Landmark[] = [
  // ---- 年會島 ----
  {
    id: "annual-2026",
    region: "annual",
    name: "2026 年會",
    kind: "年度大會",
    status: "已完成",
    date: "2026 年 6 月 6 日",
    summary: "2026 年會「性諮商，佇台灣（TĪ TÂI-UÂN）」：本土文化中的實務經驗與對話。",
    details: [
      "地點在台北市中山區松江路 101 號 4 樓。",
      "三場專題從語言、發展障礙、司法創傷三個切面展開同一個提問：性諮商的專業，怎麼談出屬於台灣自己的語言與文化脈絡。",
    ],
    children: [
      {
        name: "咱講性，講在地：台語、性別與在地實踐對話",
        status: "專題講座",
        date: "6 月 6 日",
        summary: "黃玟錦（好佳哉協力創新工作室 執行長）談台語裡的性與性別語彙，以及怎麼翻轉負向語詞。",
      },
      {
        name: "從問題解決到能力建構：面對心智障礙者性議題的不同可能性",
        status: "專題講座",
        date: "6 月 6 日",
        summary: "張維真（臨床心理師／性諮商師）以能力建構取向，重新看待心智障礙者的性議題。",
      },
      {
        name: "性侵受害者可以享受性嗎？——創傷、欲望與主體性",
        status: "專題講座",
        date: "6 月 6 日",
        summary: "彭仁郁（中研院民族所 副研究員）直面實務現場常被迴避的提問：創傷、欲望與主體性。",
      },
    ],
    href: "/annual/2026",
    color: "red",
    glyph: "plaza",
    dx: 0,
    dy: 2,
  },

  // ---- 基礎建設島 ----
  {
    id: "website-live",
    region: "infra",
    name: "新官網上線",
    kind: "基礎建設",
    status: "正式上線",
    date: "2026 年 8 月 21 日",
    summary: "新官網正式對外公開，網址定為 tasctaiwan.tw，取代到期的 Weebly 舊站。",
    details: [
      "內容與程式碼都能完整搬遷，不再被平台綁住；舊站內容完整備份在 repo 裡。",
      "同一天補上 sitemap、Open Graph 與組織結構化資料，搜尋引擎與社群分享才看得懂這個站。",
      "維護者不需要工程背景，也能透過 AI 協作編輯內容。",
    ],
    href: "/",
    color: "blue",
    glyph: "lighthouse",
    dx: -80,
    dy: -20,
  },
  {
    id: "registration-feed",
    region: "infra",
    name: "報名系統供稿",
    kind: "基礎建設",
    status: "營運中",
    date: "2026 年 8 月起",
    summary: "課程與報導改由報名系統後台供稿：秘書處按下發布，官網就自己多一張卡片。",
    details: [
      "報名、問卷、會員資料都收在學會自己的系統裡，不用 Google 表單。",
      "課程海報完整呈現，名額與價格跟著一起顯示；人數沒公開時就不顯示數字。",
      "10 月 18 日起每一場活動都有自己的回饋問卷頁，可以做成 QR code 貼進報導或群組。",
    ],
    href: "/news",
    color: "blue",
    glyph: "harbor",
    dx: 72,
    dy: -4,
  },
  {
    id: "auto-rebuild",
    region: "infra",
    name: "每天自己重建",
    kind: "基礎建設",
    status: "已啟用",
    date: "2026 年 8 月 23 日",
    summary: "官網每天自動重建一次，過期的課程會自己從「近期活動」歸位到「已結束」。",
    details: ["9 月 3 日再加上 llms.txt，給 AI 一份精簡的網站內容地圖。"],
    color: "blue",
    glyph: "globe",
    dx: -4,
    dy: 50,
  },

  // ---- 組織島 ----
  {
    id: "academic-group",
    region: "org",
    name: "新成立的學術組",
    kind: "組織",
    status: "新設",
    date: "2026 年 10 月 11 日",
    summary: "理監事會議通過新設學術組，成為理事長底下第六個工作小組。",
    details: [
      "辦理讀書會、文獻導讀與案例研討。",
      "10 月 15 日組織簡則與組織架構圖上線，10 月 20 日兩個讀書會的計畫跟著公開。",
    ],
    children: [
      {
        name: "獵捕計畫——校園性侵害與權力結構",
        status: "招募中",
        date: "2027 年 1 月起，共六次",
        summary:
          "林榮哲（學會理事・學術組組員）帶領的線上讀書會，共讀《性公民權》，5 人開團、上限 8 人。",
        href: "/about/groups/academic#hunt",
      },
      {
        name: "讀點新的｜性諮商國際研究共學圈",
        status: "12 月開跑・招募中",
        date: "2026 年 12 月啟動",
        summary:
          "林沛辰（學術組組長）帶領，每次 2 位夥伴各導讀一篇近年的國際研究，一輪 12 個主責名額。",
        href: "/about/groups/academic#read-new-research",
      },
    ],
    href: "/about/groups/academic",
    color: "magenta",
    glyph: "academy",
    dx: -58,
    dy: -16,
  },
  {
    id: "group-charters",
    region: "org",
    name: "組織簡則公布欄",
    kind: "組織",
    status: "全文上線",
    date: "2026 年 9 月 1 日",
    summary: "工作小組的組織簡則全文上線：誰負責什麼、怎麼開會、怎麼對外發言，都查得到。",
    details: [
      "8 月 29 日先把小組更名，組織架構圖也不用再左右滑動。",
      "學術組的簡則 10 月補上，現在一共六組。",
    ],
    href: "/about#structure",
    color: "magenta",
    glyph: "book",
    dx: 60,
    dy: 30,
  },

  // ---- 服務島 ----
  {
    id: "directory",
    region: "service",
    name: "性諮商師名錄",
    kind: "會員服務",
    status: "上線",
    date: "2026 年 11 月 1 日",
    summary: "性諮商師名錄加上立體台灣地圖與搜尋，可以依地區、專長、關鍵字找人。",
    details: [
      "性諮商師自己填資料，秘書處審核通過後才公開。",
      "工作地區只到縣市，想寫細的人自己補一句執業地點說明。",
      "篩選條件會寫進網址，可以直接分享；之後要更新或下架，用專屬更新連結就能帶入舊資料。",
    ],
    href: "/counselors",
    color: "green",
    glyph: "lookout",
    dx: -78,
    dy: -22,
  },
  {
    id: "invite",
    region: "service",
    name: "講師邀約",
    kind: "對外服務",
    status: "開放中",
    date: "2026 年 9 月 3 日",
    summary: "機關學校可以直接從官網提出講師邀約，表單直接進秘書處後台。",
    href: "/invite",
    color: "green",
    glyph: "mic",
    dx: 70,
    dy: -26,
  },
  {
    id: "newsletter-shelf",
    region: "service",
    name: "電子報專區",
    kind: "對外溝通",
    status: "開張",
    date: "2026 年 9 月 2 日",
    summary: "電子報有了自己的專區，可以像翻書一樣在線上讀，也能下載 PDF。",
    details: ["創刊號（2026 春季電子報，4 月 14 日出刊）收在裡面；你正在看的這一份就是第二期。"],
    href: "/newsletter",
    color: "orange",
    glyph: "post",
    dx: -4,
    dy: 44,
  },

  // ---- 課程島 ----
  {
    id: "ethics-salon",
    region: "course",
    name: "倫理沙龍",
    kind: "會員限定",
    status: "已完成",
    date: "2026 年 4 月 19 日",
    summary: "性諮商倫理的藝術與邊界：以互動沙龍的形式，談實務現場那些「卡卡的」倫理狀態。",
    details: ["講師：薛卉芝、李翊平、林榮哲、林沛辰、陳慧珊。"],
    href: "/news/reports/ethics-ai-salon",
    color: "magenta",
    glyph: "tent",
    dx: -130,
    dy: -40,
  },
  {
    id: "online-lecture",
    region: "course",
    name: "線上講座",
    kind: "線上講座",
    status: "已完成",
    date: "2026 年 5 月、9 月",
    summary: "兩場線上講座：一場走進性產業的真實世界，一場談月經平權。",
    children: [
      {
        name: "個案・性產業探索——性諮商實務中需面對的真實世界之一",
        status: "已完成",
        date: "5 月 3 日",
        summary: "講師：金派經紀人 CL。性產業結構、性病防治、台灣性產業地圖與情感替代的迷思。",
        href: "/news/reports/sex-industry-exploration",
      },
      {
        name: "當身體遇見社會：讓月經，被好好說出來——臺灣月經平權的推廣與現況",
        status: "已完成",
        date: "9 月 5 日",
        summary: "講師：鄭涵馨（社團法人全球小紅帽協會倡議總監）。線上舉辦。",
        href: "/news/upcoming/menstrual-equity-2026",
      },
    ],
    color: "green",
    glyph: "screen",
    dx: 4,
    dy: -54,
  },
  {
    id: "august-workshops",
    region: "course",
    name: "實體工作坊",
    kind: "推廣課程",
    status: "已完成",
    date: "2026 年 8 月",
    summary: "八月連著兩天的實體課：一天談寄養家庭裡的性議題，一天談性別事件行為人。",
    children: [
      {
        name: "寄養家庭中的性議題：理解、陪伴與合作實務",
        status: "已完成",
        date: "8 月 15 日",
        summary: "講師王嘉琪。心理師如何理解寄養家庭中的兒少性發展，並與寄養家長、社工合作。",
        href: "/news/reports/foster-family-sexuality-2026",
      },
      {
        name: "當代性別事件行為人諮商處遇實務經驗分享交流",
        status: "已完成",
        date: "8 月 16 日",
        summary: "講師龍冠華（臨床心理師）。從助人者的角度，走進偷窺、偷拍行為人的內在狀態與歷程。",
        href: "/news/reports/gender-case-consultation",
      },
    ],
    href: "/news/reports",
    color: "orange",
    glyph: "workshop",
    dx: 116,
    dy: -22,
  },
  {
    id: "field-trips",
    region: "course",
    name: "走讀與參訪",
    kind: "走讀與參訪",
    status: "已完成",
    date: "2026 年 8 月、10 月",
    summary: "三場走出教室的活動：兩個夜晚的走讀，和白天的月經博物館。",
    children: [
      {
        name: "夜遊三流艋舺：流氓、流鶯、流浪漢",
        status: "已完成",
        date: "8 月 7 日",
        summary:
          "講師 CL 經紀人、李翊平。從龍山寺站走過新富町、剝皮寮，到西昌街與鑽石大樓的性產業現場。",
        href: "/news/reports/wanhua-night-walk-2026",
      },
      {
        name: "夜遊林森北路：從四大鬼樓反思性產業與性相關法規",
        status: "已完成",
        date: "8 月 22 日",
        summary: "講師：金派經紀人 CL、李翊平 心理師／性諮商師。走林森北路一帶。",
        href: "/news/upcoming/linsen-night-walk-2026",
      },
      {
        name: "小紅厝－月經博物館 參訪",
        status: "已完成",
        date: "10 月 18 日",
        summary:
          "由全球小紅帽協會倡議總監涵馨導覽，走過特展與常設展，認識多元月經議題與全球月經教育。",
        href: "/news/reports/event-260820-f2nk",
      },
    ],
    color: "orange",
    glyph: "ferry",
    dx: -56,
    dy: 48,
  },

  // ---- 參與島 ----
  {
    id: "anniversary-2026",
    region: "public",
    name: "會慶・時光留言席",
    kind: "公眾參與",
    status: "展出中",
    date: "2026 年 9 月",
    summary: "從 2013 年凱道辦桌成會到今天，挑一道菜、敬一杯茶，留下回憶與祝福。",
    href: "/anniversary",
    color: "red",
    glyph: "lantern",
    dx: -84,
    dy: -4,
  },
  {
    id: "pride-2026",
    region: "public",
    name: "同遊・照片牆",
    kind: "公眾參與",
    status: "展出中",
    date: "2026 年 10 月",
    summary: "同遊前的網路串聯：做一張挺多元圖卡，夾上照片牆。",
    details: [
      "圖卡可以挑框型、色調與文字對齊，hashtag 固定帶上 #台灣性諮商學會。",
      "10 月 30 日補上挺跨性別那一組 hashtag 與發文範本。",
    ],
    href: "/pride",
    color: "magenta",
    glyph: "bridge",
    dx: 80,
    dy: -38,
  },
  {
    id: "exhibits",
    region: "public",
    name: "互動展覽專區",
    kind: "對外溝通",
    status: "開張",
    date: "2026 年 11 月 1 日",
    summary: "活動結束後留下來的「展間」收成一區，照片牆與留言席都放在裡面，隨時看得到。",
    href: "/news/exhibits",
    color: "green",
    glyph: "gallery",
    dx: -4,
    dy: 48,
  },
];

/**
 * 報名亭：還開著報名的課。
 *
 * 這一個地標底下的小項目不寫在這裡，而是頁面建置時去報名系統抓
 * （見 `src/pages/newsletter/2026-autumn.astro`），所以秘書處後台一上架新課，
 * 下一次建置這張地圖就會跟著長出來。沒有任何課在報名時，整個地標不會出現。
 */
export const signupLandmark: Landmark = {
  id: "open-signups",
  region: "course",
  name: "現在可以報名的課",
  kind: "報名中",
  status: "開放報名",
  date: "持續更新",
  summary: "現在還開著報名的課，點進去就可以報名。",
  href: "/news",
  color: "blue",
  glyph: "signup",
  dx: 112,
  dy: 52,
};
