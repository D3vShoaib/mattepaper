import type { TocEntry } from "./foliate-adapter"

export function navigableChapters(items: TocEntry[]): TocEntry[] {
  const result: TocEntry[] = []
  const seen = new Set<string>()
  function visit(entries: TocEntry[]) {
    for (const entry of entries) {
      if (entry.href && !seen.has(entry.href)) {
        seen.add(entry.href)
        result.push(entry)
      }
      if (entry.subitems?.length) visit(entry.subitems)
    }
  }
  visit(items)
  return result
}
