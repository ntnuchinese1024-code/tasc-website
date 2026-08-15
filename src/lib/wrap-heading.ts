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

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function wrapHeadingHtml(text: string): string {
  const parts = text.split(CLAUSE_BREAK).filter((part) => part.length > 0);

  const clauses: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const clause = parts[i] + (parts[i + 1] ?? "");
    if (clause) clauses.push(clause);
  }

  if (clauses.length <= 1) {
    return escapeHtml(text);
  }

  return clauses.map((clause) => `<span class="nowrap-clause">${escapeHtml(clause)}</span>`).join("");
}
