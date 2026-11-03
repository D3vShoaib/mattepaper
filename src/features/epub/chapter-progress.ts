export function chapterScrollProgress(
  position: number,
  viewport: number,
  content: number
) {
  const distance = Math.max(0, content - viewport)
  if (distance <= 2 || position >= distance - 2) return 1
  return Math.max(0, Math.min(1, position / distance))
}
