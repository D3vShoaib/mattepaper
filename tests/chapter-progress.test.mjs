import assert from "node:assert/strict"
import test from "node:test"
import { chapterScrollProgress } from "../src/features/epub/chapter-progress.ts"

test("chapter scroll progress reaches 100% at the bottom of the scrollable range", () => {
  assert.equal(chapterScrollProgress(0, 400, 1000), 0)
  assert.equal(chapterScrollProgress(300, 400, 1000), 0.5)
  assert.equal(chapterScrollProgress(600, 400, 1000), 1)
  assert.equal(chapterScrollProgress(599, 400, 1000), 1)
})

test("short chapters are complete when fully visible and overscroll is clamped", () => {
  assert.equal(chapterScrollProgress(0, 400, 300), 1)
  assert.equal(chapterScrollProgress(0, 400, 400), 1)
  assert.equal(chapterScrollProgress(-20, 400, 1000), 0)
  assert.equal(chapterScrollProgress(650, 400, 1000), 1)
})
