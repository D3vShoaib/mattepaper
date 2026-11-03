import assert from "node:assert/strict"
import test from "node:test"
import {
  bookStatus,
  isFinished,
  statusAfterProgress,
} from "../src/features/library/book-status.ts"

test("book status is explicit and independent of progress", () => {
  assert.equal(bookStatus({ status: "Unread", progress: 0.8 }), "Unread")
  assert.equal(bookStatus({ status: "Reading", progress: 1 }), "Reading")
  assert.equal(bookStatus({ status: "Finished", progress: 0 }), "Finished")
  assert.equal(isFinished({ status: "Finished" }), true)
  assert.equal(isFinished({ status: "Reading" }), false)
  assert.equal(statusAfterProgress("Reading", 0.99), "Reading")
  assert.equal(statusAfterProgress("Reading", 1), "Finished")
  assert.equal(statusAfterProgress("Finished", 0.2), "Finished")
})
