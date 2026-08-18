/**
 * Prevents a lone trailing character ("孤字/一字成行") when a CJK heading
 * wraps on narrow screens. Splits the text on natural pause punctuation
 * and locks each clause together with `white-space: nowrap`, so the browser
 * can only break *between* clauses, never inside one.
 *
 * If the text has no punctuation to split on, it's returned unchanged and
 * left to the browser's default wrapping — forcing a long unbroken run
 * onto one line would just overflow on mobile instead of fixing anything.
 */
const CLAUSE_BREAK = /([，。！？；：、])/g;

// A clause shorter than this (in characters) reads as an awkward orphan
// fragment if it's left to stand alone on its own line — e.g. splitting
// "性、慾望與關係" at the first comma would strand "性、" by itself. Below
// this length, merge the clause into its neighbor instead.
const MIN_CLAUSE_LENGTH = 4;

// 一個子句被 nowrap 鎖住之後就再也不能換行，所以它必須短到能整句塞進最窄的
// 螢幕。實測 375px 的手機：內容欄寬 327px、標題最小字級 20px，大約放得下 16 個
// 字。超過這個長度的子句（例如課程報導那種 27 字的長標題）如果照鎖，整段會被
// 裁掉而不是換行——比孤字還糟。這種情況改成只鎖「最後兩個字」，讓瀏覽器可以
// 在中間任意換行，但永遠不會只留一個字在最後一行。
const MAX_LOCK_LENGTH = 16;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mergeShortClauses(clauses: string[]): string[] {
  const merged: string[] = [];
  for (const clause of clauses) {
    const prev = merged[merged.length - 1];
    if (prev !== undefined && prev.length < MIN_CLAUSE_LENGTH) {
      merged[merged.length - 1] = prev + clause;
    } else {
      merged.push(clause);
    }
  }
  // A short clause stranded at the very end (nothing after it to merge
  // forward into) gets folded back onto the previous one instead.
  if (merged.length > 1 && merged[merged.length - 1].length < MIN_CLAUSE_LENGTH) {
    const last = merged.pop() as string;
    merged[merged.length - 1] += last;
  }
  return merged;
}

export function wrapHeadingHtml(text: string): string {
  const parts = text.split(CLAUSE_BREAK).filter((part) => part.length > 0);

  const rawClauses: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const clause = parts[i] + (parts[i + 1] ?? "");
    if (clause) rawClauses.push(clause);
  }

  const clauses = mergeShortClauses(rawClauses);

  if (clauses.length <= 1) {
    return escapeHtml(text);
  }

  return clauses.map(lockClause).join("");
}

function lockClause(clause: string): string {
  if (clause.length <= MAX_LOCK_LENGTH) {
    return `<span class="nowrap-clause">${escapeHtml(clause)}</span>`;
  }
  const head = clause.slice(0, -2);
  const tail = clause.slice(-2);
  return `${escapeHtml(head)}<span class="nowrap-clause">${escapeHtml(tail)}</span>`;
}
