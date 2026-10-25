// Counts the words a crawler that doesn't run JavaScript would see on a page:
// the body text, minus scripts, styles and "please enable JavaScript" notices.
export function visibleWords(html: string) {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(head|script|style|noscript|template|svg)\b[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#?\w+;/g, " ");
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}
