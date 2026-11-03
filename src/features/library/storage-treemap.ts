export interface StorageTile {
  id: string
  bytes: number
}

export interface StorageRectangle extends StorageTile {
  x: number
  y: number
  width: number
  height: number
}

/** Size-proportional binary treemap, split along each rectangle's longer side. */
export function storageTreemap(
  items: StorageTile[],
  width = 640,
  height = 280
): StorageRectangle[] {
  const sorted = items
    .filter((item) => Number.isFinite(item.bytes) && item.bytes > 0)
    .toSorted((a, b) => b.bytes - a.bytes || a.id.localeCompare(b.id))
  if (!sorted.length || width <= 0 || height <= 0) return []

  const rectangles: StorageRectangle[] = []
  function split(
    nodes: StorageTile[],
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    if (nodes.length === 1) {
      rectangles.push({ ...nodes[0], x, y, width: w, height: h })
      return
    }
    const total = nodes.reduce((sum, node) => sum + node.bytes, 0)
    let cut = 1
    let first = nodes[0].bytes
    while (
      cut < nodes.length - 1 &&
      Math.abs(first + nodes[cut].bytes - total / 2) <
        Math.abs(first - total / 2)
    ) {
      first += nodes[cut].bytes
      cut++
    }
    const ratio = first / total
    if (w >= h) {
      split(nodes.slice(0, cut), x, y, w * ratio, h)
      split(nodes.slice(cut), x + w * ratio, y, w * (1 - ratio), h)
    } else {
      split(nodes.slice(0, cut), x, y, w, h * ratio)
      split(nodes.slice(cut), x, y + h * ratio, w, h * (1 - ratio))
    }
  }
  split(sorted, 0, 0, width, height)
  return rectangles
}
