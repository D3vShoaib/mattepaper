import assert from "node:assert/strict"
import test from "node:test"
import { storageTreemap } from "../src/features/library/storage-treemap.ts"

test("storage treemap handles empty, invalid, and single-item storage", () => {
  assert.deepEqual(storageTreemap([]), [])
  assert.deepEqual(
    storageTreemap([
      { id: "empty", bytes: 0 },
      { id: "invalid", bytes: NaN },
    ]),
    []
  )
  assert.deepEqual(storageTreemap([{ id: "book", bytes: 100 }]), [
    { id: "book", bytes: 100, x: 0, y: 0, width: 640, height: 280 },
  ])
})

test("treemap areas match file sizes and fill the bounds without overlaps", () => {
  const items = [5, 40, 10, 30, 15].map((bytes, index) => ({
    id: `book-${index}`,
    bytes,
  }))
  const rectangles = storageTreemap(items)
  const area = 640 * 280
  assert.equal(rectangles.length, items.length)
  assert.deepEqual(
    items.map((item) => item.bytes),
    [5, 40, 10, 30, 15]
  )
  for (const rect of rectangles) {
    assert.ok(
      Math.abs((rect.width * rect.height) / area - rect.bytes / 100) < 1e-10
    )
    assert.ok(rect.x >= 0 && rect.y >= 0)
    assert.ok(rect.x + rect.width <= 640 + 1e-10)
    assert.ok(rect.y + rect.height <= 280 + 1e-10)
    for (const other of rectangles) {
      if (rect === other) continue
      const overlapWidth =
        Math.min(rect.x + rect.width, other.x + other.width) -
        Math.max(rect.x, other.x)
      const overlapHeight =
        Math.min(rect.y + rect.height, other.y + other.height) -
        Math.max(rect.y, other.y)
      assert.ok(overlapWidth <= 1e-10 || overlapHeight <= 1e-10)
    }
  }
})

test("treemap retains tiny files alongside large books", () => {
  const tiles = storageTreemap([
    { id: "large", bytes: 1e9 },
    { id: "tiny", bytes: 1 },
  ])
  assert.equal(tiles.length, 2)
  assert.ok(tiles.every((tile) => tile.width > 0 && tile.height > 0))
})
