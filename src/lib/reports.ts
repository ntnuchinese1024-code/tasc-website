/**
 * 課程報導的單一取用入口。
 *
 * 目前報導有兩個來源：
 *   1. 本地資料檔 src/data/course-reports.ts（從舊 Weebly 站搬過來的歷史報導）
 *   2. 學會報名系統後台（新課程結束後由秘書處直接在網頁上寫）
 *
 * 這支把兩邊轉成同一個形狀合併起來，所以報導列表頁與內頁只認得一種資料，
 * 不必知道每一篇是從哪裡來的。
 *
 * 等歷史報導全部搬進報名系統之後，只要把 localReports 換成空陣列，
 * 其他檔案一行都不用動，就完成切換。
 */

import { allCourseReports as localReports, type CourseReport } from "../data/course-reports";
import { renderMarkdown, excerpt } from "./markdown";
import {
  accentVars,
  getPublishedReports,
  getEventDetail,
  type EventSummary,
} from "./registration-api";

export interface UnifiedReport extends CourseReport {
  /** 來自報名系統的報導帶的是 HTML（由 Markdown 轉成），本地報導則是 sections。 */
  bodyHtml?: string;
  source: "local" | "registration";
}

/** 2026年5月3日 —— 跟本地資料檔既有的日期寫法一致，列表分組才對得起來。 */
function formatReportDate(iso: string | null): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}年${get("month")}月${get("day")}日`;
}

function toUnified(event: EventSummary, reportMd: string | null, gallery: string[]): UnifiedReport {
  const accent = accentVars(event.accent);

  return {
    source: "registration",
    slug: event.slug,
    title: event.title,
    // 報導日期用「課程實際舉辦的日子」，這是讀者關心的時間點，不是編輯發布的時間
    date: formatReportDate(event.starts_at ?? event.report_published_at),
    speaker: event.instructor ?? "",
    writer: event.report_author ?? "",
    tags: event.tags,
    color: accent.color,
    colorText: accent.text,
    lead: event.report_lead ?? event.description ?? excerpt(reportMd, 110),
    poster: event.report_cover_url ?? event.poster_url ?? undefined,
    images: gallery,
    // 內頁改走 bodyHtml，這裡留空陣列讓型別相容
    sections: [],
    bodyHtml: renderMarkdown(reportMd),
  };
}

/**
 * 所有報導，新的排前面。
 *
 * 同一個 slug 同時存在於兩邊時，以報名系統為準——
 * 搬遷期間會有這種重疊，讓新來源覆蓋舊檔案，搬一篇就生效一篇。
 */
export async function getAllReports(): Promise<UnifiedReport[]> {
  const remote = await getPublishedReports();

  // 列表頁不需要全文，但需要導言與封面；全文只在內頁抓
  const fromRegistration: UnifiedReport[] = remote.map((event) =>
    toUnified(event, null, []),
  );

  const remoteSlugs = new Set(fromRegistration.map((r) => r.slug));

  const fromLocal: UnifiedReport[] = localReports
    .filter((r) => !remoteSlugs.has(r.slug))
    .map((r) => ({ ...r, source: "local" as const }));

  return [...fromRegistration, ...fromLocal].sort((a, b) => reportYear(b) - reportYear(a));
}

/**
 * 單篇報導的完整內容（含全文）。
 *
 * source 由列表那邊帶過來，用途是**避免白跑一趟網路請求**：
 * 本地報導的全文本來就在檔案裡，沒必要為了它去問報名系統，
 * 否則建置時會產生數十個注定 404 的請求，又慢又吵。
 */
export async function getReport(
  slug: string,
  source: "local" | "registration" = "registration",
): Promise<UnifiedReport | null> {
  if (source === "registration") {
    const detail = await getEventDetail(slug);
    if (detail?.report_md) {
      const gallery = (detail.report_gallery ?? []).map((image) => image.url);
      return toUnified(detail, detail.report_md, gallery);
    }
  }

  const local = localReports.find((r) => r.slug === slug);
  return local ? { ...local, source: "local" } : null;
}

/** 報導年份，用來在列表頁分組。 */
export function reportYear(report: { date: string }): number {
  const matched = report.date.match(/(\d{4})/);
  return matched ? Number(matched[1]) : new Date().getFullYear();
}
