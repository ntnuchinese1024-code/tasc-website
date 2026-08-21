/**
 * 從學會報名系統取得課程與報導內容。
 *
 * 這些 fetch 只在 **建置時** 跑一次，抓到的資料會被寫進靜態 HTML。
 * 所以訪客瀏覽官網時不會連到報名系統，Google 也讀得到完整內容，
 * 官網仍然是一包純靜態檔案、可以搬到任何空間。
 *
 * 秘書處在報名系統後台按「發布」時，會觸發這個網站重新建置，內容才會更新。
 *
 * ── 建置失敗的處理原則 ──────────────────────────────────
 * 報名系統暫時連不上時，**絕對不能讓官網建置失敗**。
 * 學會官網有九成的內容（章程、理監事、認證辦法）跟報名系統無關，
 * 為了抓不到三筆課程而讓整個網站發布不出去是不划算的。
 * 所以這裡抓不到就印警告、回空陣列，官網照樣生得出來，
 * 只是課程區塊會顯示「目前沒有公告中的課程」。
 */

/** 報名系統的網址。之後綁定正式網域時改這一行（或設環境變數）。 */
export const REGISTRATION_ORIGIN =
  import.meta.env.PUBLIC_REGISTRATION_ORIGIN ?? "https://tasc-registration.vercel.app";

export type EventKind = "course" | "workshop" | "lecture" | "annual" | "other";
export type AccentName = "blue" | "red" | "green" | "magenta" | "orange" | "gold";
export type RegistrationStatusCode = "OPEN" | "FULL" | "NOT_OPEN" | "CLOSED" | "DISABLED";

/** 身分別價目（會員／非會員／學生）。空陣列＝單一價格，看 price。 */
export interface PriceTier {
  id: string;
  label: string;
  price: number;
  note?: string;
}

export interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

/** 列表用的欄位（不含長文）。 */
export interface EventSummary {
  id: string;
  slug: string;
  kind: EventKind;
  tags: string[];
  accent: AccentName;
  title: string;
  description: string | null;
  instructor: string | null;
  poster_url: string | null;
  poster_alt: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  price: number;
  price_tiers: PriceTier[];
  max_capacity: number;
  current_registered: number;
  registration_enabled: boolean;
  is_published: boolean;
  registration_opens_at: string | null;
  registration_closes_at: string | null;
  report_lead: string | null;
  report_author: string | null;
  report_cover_url: string | null;
  report_cover_alt: string | null;
  report_published_at: string | null;
  /**
   * remaining 是 null 代表秘書處關閉了「對外顯示名額」——
   * 不是抓失敗，是刻意不公開，畫面上就不要顯示數字。
   */
  registration: { status: RegistrationStatusCode; remaining: number | null; is_open: boolean };
  has_report: boolean;
}

/** 單頁用的完整欄位。 */
export interface EventDetail extends EventSummary {
  intro_md: string | null;
  target_audience: string | null;
  credits_note: string | null;
  report_md: string | null;
  report_gallery: GalleryImage[];
  registration_url: string | null;
}

/** logo 色系 → 官網 CSS 變數。資料庫存語意名稱，色碼由這裡決定。 */
export const ACCENT_VARS: Record<AccentName, { color: string; text: string }> = {
  blue: { color: "var(--blue)", text: "var(--blue-deep)" },
  red: { color: "var(--red)", text: "var(--red-deep)" },
  green: { color: "var(--green)", text: "var(--green-deep)" },
  magenta: { color: "var(--magenta)", text: "var(--magenta-deep)" },
  orange: { color: "var(--orange)", text: "var(--orange-deep)" },
  gold: { color: "var(--gold)", text: "var(--orange-deep)" },
};

export function accentVars(accent: AccentName | string | null | undefined) {
  return ACCENT_VARS[(accent as AccentName) ?? "blue"] ?? ACCENT_VARS.blue;
}

// -----------------------------------------------------------------------------
// 取資料
// -----------------------------------------------------------------------------

const TIMEOUT_MS = 15000;

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  const url = `${REGISTRATION_ORIGIN}${path}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });

    if (!response.ok) {
      console.warn(
        `[報名系統] ${path} 回應 HTTP ${response.status}，這次建置會略過這部分內容。`,
      );
      return fallback;
    }

    return (await response.json()) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[報名系統] 連不上 ${url}（${message}），這次建置會略過這部分內容。`);
    return fallback;
  }
}

interface ListResponse {
  scope: string;
  count: number;
  items: EventSummary[];
}

/** 目前開放報名的課程，時間近的排前面。 */
export async function getOpenCourses(): Promise<EventSummary[]> {
  const data = await fetchJson<ListResponse>("/api/events?scope=open", {
    scope: "open",
    count: 0,
    items: [],
  });
  return data.items ?? [];
}

/** 已公開的課程報導，新的排前面。 */
export async function getPublishedReports(): Promise<EventSummary[]> {
  const data = await fetchJson<ListResponse>("/api/events?scope=reports&limit=200", {
    scope: "reports",
    count: 0,
    items: [],
  });
  return data.items ?? [];
}

/** 單一課程的完整內容。找不到時回 null，呼叫端自行處理。 */
export async function getEventDetail(slug: string): Promise<EventDetail | null> {
  const data = await fetchJson<EventDetail | { error: string } | null>(
    `/api/events/${encodeURIComponent(slug)}`,
    null,
  );
  if (!data || "error" in data) return null;
  return data;
}

// -----------------------------------------------------------------------------
// 呈現用的小工具
// -----------------------------------------------------------------------------

/** 2026年9月19日（週六）09:30–16:30 */
export function formatEventTime(startsAt: string | null, endsAt: string | null): string {
  if (!startsAt) return "時間另行公告";

  const start = new Date(startsAt);
  const datePart = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(start);

  const timeOf = (d: Date) =>
    new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);

  if (!endsAt) return `${datePart} ${timeOf(start)}`;
  return `${datePart} ${timeOf(start)}–${timeOf(new Date(endsAt))}`;
}

/** 給列表分組用的年份。 */
export function eventYear(event: { report_published_at: string | null; starts_at: string | null }): number {
  const iso = event.report_published_at ?? event.starts_at;
  if (!iso) return new Date().getFullYear();
  return Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric" }).format(new Date(iso)),
  );
}

export function formatPrice(price: number): string {
  return price > 0 ? `NT$ ${price.toLocaleString("zh-TW")}` : "免費";
}

/**
 * 費用文字。學會的課多半是「會員 100／非會員 400」這種雙價，
 * 報名系統把每一檔的金額都給了，這裡就照實列出來，不要只顯示其中一個數字。
 */
export function formatPriceSummary(price: number, tiers?: PriceTier[] | null): string {
  if (Array.isArray(tiers) && tiers.length > 0) {
    return tiers.map((t) => `${t.label} ${formatPrice(t.price)}`).join("／");
  }
  return formatPrice(price);
}

/** 報名狀態 → 顯示文字。 */
export const REGISTRATION_LABEL: Record<RegistrationStatusCode, string> = {
  OPEN: "開放報名中",
  FULL: "名額已滿",
  NOT_OPEN: "尚未開放報名",
  CLOSED: "報名已截止",
  DISABLED: "不開放線上報名",
};

/** 這場課的報名頁網址。 */
export function registrationUrl(slug: string): string {
  return `${REGISTRATION_ORIGIN}/events/${slug}`;
}
