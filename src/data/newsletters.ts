/**
 * 學會電子報。最新一期會直接出現在 /newsletter，舊的往期收在同一頁的「往期電子報」，
 * 每一期也有自己的網址 /newsletter/<slug>。
 *
 * ── 之後要新增一期怎麼做 ──────────────────────────────────────────────
 * 1. 轉圖：python3 scripts/newsletter-images.py 新一期.pdf 2026-autumn
 *    （會產生 public/newsletters/2026-autumn/ 底下的圖片跟下載用 PDF，
 *      跑完會把下一步要填的數字直接印出來）
 * 2. 在下面 newsletters 陣列的「最前面」加一筆，照上一期的格式填。
 *    陣列第一筆就是網站上顯示的最新一期，不用改別的地方。
 * 詳細說明見 docs/維護手冊.md「想新增一期電子報」。
 * ──────────────────────────────────────────────────────────────────
 */

export interface NewsletterHighlight {
  /** 這個單元在電子報裡的第幾頁，點了會直接翻過去 */
  page: number;
  title: string;
  body: string;
}

export interface Newsletter {
  /** 網址用的代號，例如 2026-spring → /newsletter/2026-spring */
  slug: string;
  /** 期別，例如「創刊號」「第二期」 */
  issue: string;
  /** 標題，例如「2026 春季電子報」 */
  title: string;
  /** 出刊日，寫成 YYYY-MM-DD，網頁上會自己排版 */
  date: string;
  /** 一段話介紹這期在講什麼 */
  intro: string;
  /** 總頁數，要跟 public/newsletters/<slug>/ 底下的圖片數量一致 */
  pages: number;
  /** 美編／編輯群，會標在頁面上 */
  credits: string;
  /** 給人下載的 PDF 檔名（放在 public/newsletters/<slug>/ 底下） */
  pdf: { file: string; size: string };
  /** 首頁與電子報頁上列出的重點單元 */
  highlights: NewsletterHighlight[];
}

export const newsletters: Newsletter[] = [
  {
    slug: "2026-spring",
    issue: "創刊號",
    title: "2026 春季電子報",
    date: "2026-04-14",
    intro:
      "第七屆理監事上任後的第一份電子報。從理事長的話開始，回顧這半年的學會紀事，接著由秘書處與四個工作小組各自報告做了什麼、接下來要往哪裡走，最後是下半年的活動快報與預告。",
    pages: 15,
    credits: "美編｜張毓玲",
    pdf: { file: "台灣性諮商學會-2026春季電子報.pdf", size: "4.8 MB" },
    highlights: [
      {
        page: 2,
        title: "理事長的話：傳承美好・共創在地專業新篇章",
        body: "行政制度化、專業成長與實務思辨、公關改組、跨域合作——這半年的四個關鍵突破，以及 6/6 年度研討會的方向。",
      },
      {
        page: 3,
        title: "學會紀事",
        body: "從性諮商年會與理監事改選、溯源計劃專訪、同志大遊行到心理治療聯合年會，一年來的足跡與四次理監事會議紀錄。",
      },
      {
        page: 5,
        title: "各小組介紹",
        body: "秘書處、認證課程組、推廣課程組、倫理委員會、公關組，各自談這半年做了什麼、未來想推展什麼，以及想跟會員說的話。",
      },
      {
        page: 11,
        title: "活動快報與預告",
        body: "性諮商倫理互動沙龍、性產業探索線上講座、2026 性諮商年會、實體聚會，還有下半年的課程預告。",
      },
    ],
  },
];

/** 網站上顯示的最新一期 */
export const latestNewsletter = newsletters[0];

/** 電子報頁面資料夾 */
export function assetBase(n: Newsletter): string {
  return `/newsletters/${n.slug}`;
}

/**
 * 分享到 FB／LINE 時的預覽圖。用 JPG 而不是站上其他地方用的 WebP，
 * 因為部分社群平台的預覽爬蟲還是不吃 WebP，會變成沒有圖。
 */
export function coverImage(n: Newsletter): string {
  return `${assetBase(n)}/cover.jpg`;
}

/** 產生每一頁的圖片路徑 */
export function pageImages(n: Newsletter) {
  const base = assetBase(n);
  return Array.from({ length: n.pages }, (_, i) => {
    const num = String(i + 1).padStart(2, "0");
    return {
      page: i + 1,
      src: `${base}/p${num}.webp`,
      thumb: `${base}/thumbs/p${num}.webp`,
    };
  });
}

/** 2026-04-14 → 2026 年 4 月 14 日 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y} 年 ${m} 月 ${d} 日`;
}
