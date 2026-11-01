/**
 * 互動展覽：學會辦過的線上互動活動，活動結束後留下來的「展間」。
 *
 * 出現在兩個地方：/news/exhibits（全部）、首頁「最新消息」下方（最新的幾個）。
 * 新的互動活動結束後，在陣列「最前面」加一筆就好。
 *
 * statsPath：報名系統上回傳 { count } 的公開 API，建置時抓來顯示「已有幾則／幾張」。
 * 不寫就不顯示數字；抓不到也只是不顯示，不會讓官網建置失敗。
 */

export interface Exhibit {
  slug: string;
  title: string;
  /** 卡片上的小標，例如活動類型或年份 */
  eyebrow: string;
  /** 活動期間，照實寫 */
  period: string;
  description: string;
  href: string;
  /** 卡片插圖區用的符號 */
  emoji: string;
  /** 卡片插圖區的漸層（兩個色碼） */
  gradient: [string, string];
  statsPath?: string;
  /** 數字後面接的單位，例如「則祝福」 */
  statsUnit?: string;
  /** 互動是否還開放。展覽一律可以看；這裡只影響卡片上的「也可以參與」提示 */
  stillOpen?: boolean;
}

export const exhibits: Exhibit[] = [
  {
    slug: "pride-2026",
    title: "我挺同我驕傲・同遊照片牆",
    eyebrow: "2026 臺灣同志遊行",
    period: "2026 年 10 月",
    description: "夥伴們親手做的挺多元圖卡，一張張夾上照片牆。看完也可以做一張你自己的。",
    href: "/pride",
    emoji: "🏳️‍🌈",
    gradient: ["#e71374", "#009fe8"],
    statsPath: "/api/pride-wall",
    statsUnit: "張圖卡",
    stillOpen: true,
  },
  {
    slug: "anniversary-2026",
    title: "凱道辦桌・時光留言席",
    eyebrow: "2026 學會會慶",
    period: "2026 年 9 月",
    description: "從 2013 年凱道辦桌成會，到親手打造的新家。挑一道菜、敬一杯茶，留下的回憶與祝福都在這桌上。",
    href: "/anniversary",
    emoji: "🏮",
    gradient: ["#c9301a", "#f2b705"],
    statsPath: "/api/anniversary/messages",
    statsUnit: "則祝福",
    stillOpen: true,
  },
];
