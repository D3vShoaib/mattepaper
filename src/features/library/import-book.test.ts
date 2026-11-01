import "fake-indexeddb/auto"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { db } from "@/db"
import { importBook } from "./import-book"

vi.mock("@/features/epub/foliate-adapter", () => ({
  parseEpub: vi.fn(async (file: File) => {
    if (file.name === "broken.epub") throw new Error("Invalid EPUB")
    return { title: "A book", author: "An author" }
  }),
}))

beforeEach(async () => {
  await db.bookFiles.clear()
  await db.books.clear()
})

describe("library imports", () => {
  it("stores the original file and skips duplicate content even with another filename", async () => {
    const original = new File(["epub bytes"], "book.epub")
    expect(await importBook(original)).toBe("imported")
    expect(await importBook(new File(["epub bytes"], "another.epub"))).toBe(
      "duplicate"
    )
    const books = await db.books.toArray()
    expect(books).toHaveLength(1)
    expect(books[0]).toMatchObject({
      title: "A book",
      author: "An author",
      fileName: "book.epub",
      progress: 0,
    })
    expect(await (await db.bookFiles.get(books[0].id))?.data.text()).toBe(
      "epub bytes"
    )
  })
  it("does not leave a book or file behind when parsing fails", async () => {
    await expect(importBook(new File(["bad"], "broken.epub"))).rejects.toThrow(
      "Invalid EPUB"
    )
    expect(await db.books.count()).toBe(0)
    expect(await db.bookFiles.count()).toBe(0)
  })
  it("rejects unsupported filenames before saving", async () => {
    await expect(importBook(new File(["text"], "book.txt"))).rejects.toThrow(
      "Only EPUB"
    )
    expect(await db.books.count()).toBe(0)
  })
})
