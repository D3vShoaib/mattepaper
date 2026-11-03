import assert from "node:assert/strict"
import test from "node:test"
import {
  getShortcutAction,
  getTapZone,
} from "../src/features/epub/reader-taps.ts"

test("maps screen points to tap zones and rejects points outside the reader", () => {
  assert.equal(getTapZone(10, 10, 100, 100), "topLeft")
  assert.equal(getTapZone(90, 10, 100, 100), "topRight")
  assert.equal(getTapZone(10, 90, 100, 100), "bottomLeft")
  assert.equal(getTapZone(90, 90, 100, 100), "bottomRight")
  assert.equal(getTapZone(50, 50, 100, 100), "center")
  assert.equal(getTapZone(-1, 10, 100, 100), null)
  assert.equal(getTapZone(10, 10, 0, 100), null)
})

test("maps reader shortcuts consistently", () => {
  assert.equal(getShortcutAction("ArrowLeft"), "previous")
  assert.equal(getShortcutAction("ARROWRIGHT"), "next")
  assert.equal(getShortcutAction("m"), "toggle")
  assert.equal(getShortcutAction("Escape"), null)
})
