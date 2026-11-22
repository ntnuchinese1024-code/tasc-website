import { marked } from "marked";

/**
 * 把後台寫的 Markdown 轉成 HTML。
 *
 * 秘書處在報名系統後台編輯課程介紹與課程報導時用的是 Markdown
 * （## 開頭是小標、空行分段、- 開頭是條列），這裡負責在建置時轉成 HTML。
 *
 * 安全性：內容只有學會管理員寫得進去，不是訪客投稿，所以不需要 HTML 清洗。
 * 但為求保險仍然關掉了原始 HTML 內嵌——秘書處貼上從別處複製的內容時，
 * 有機會夾帶奇怪的標籤把版面撐壞，直接當純文字處理比較安全也比較好預期。
 */

marked.setOptions({
  gfm: true,
  breaks: false, // 單行換行不強制斷行；要分段請空一行，跟一般寫作習慣一致
});

/**
 * 秘書處從 Word／LINE／信件貼過來的稿子，常常是**每一段只換一行、沒有空行**。
 * Markdown 把單一換行當成同一段，整篇就會黏成一大塊字牆
 * （2026-11-22 的「月經平權」那篇實際發生過）。
 *
 * 所以這裡做一件事：整篇**完全沒有空行**、卻有好幾行的時候，自動把每一行
 * 當成一段。已經正確用空行分段的稿子不會被動到；連續的清單、引言、標題
 * 之間也不插空行，免得把清單拆散。
 */
function normalizeParagraphs(markdown: string): string {
  const text = markdown.replace(/\r\n?/g, "\n");
  if (/\n[ \t]*\n/.test(text)) return text; // 已經有空行分段，照原樣

  const lines = text.split("\n");
  if (lines.length < 3) return text;

  const isBlock = (line: string) => /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||```)/.test(line);

  const out: string[] = [];
  lines.forEach((line, i) => {
    out.push(line);
    const next = lines[i + 1];
    if (next === undefined) return;
    if (line.trim() === "" || next.trim() === "") return;
    if (isBlock(line) && isBlock(next)) return;
    out.push("");
  });
  return out.join("\n");
}

/** 移除原始 HTML 標籤，避免貼上來的內容破壞版面。 */
function stripRawHtml(markdown: string): string {
  return markdown.replace(/<\/?[a-zA-Z][^>]*>/g, "");
}

export function renderMarkdown(markdown: string | null | undefined): string {
  if (!markdown) return "";
  return marked.parse(normalizeParagraphs(stripRawHtml(markdown)), { async: false }) as string;
}

/**
 * 取前幾句話當摘要（沒有另外寫導言時的備案）。
 * 會把 Markdown 語法符號拿掉，因為摘要是純文字用途。
 */
export function excerpt(markdown: string | null | undefined, maxLength = 120): string {
  if (!markdown) return "";

  const plain = stripRawHtml(markdown)
    .replace(/^#{1,6}\s+/gm, "")     // 標題符號
    .replace(/[*_`>]/g, "")           // 強調與引用符號
    .replace(/^[-+*]\s+/gm, "")       // 條列符號
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // 連結只留文字
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trimEnd() + "…";
}
