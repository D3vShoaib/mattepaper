import "fake-indexeddb/auto"
import { describe, expect, it } from "vitest"
import { db } from "./index"

describe("library database", () => {
  it("opens alongside an older database with incompatible keys without changing its records", async () => {
    const old = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("mattepaper", 1)
      request.onupgradeneeded = () => {
        request.result.createObjectStore("bookFiles", { keyPath: "bookId" })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
      const transaction = old.transaction("bookFiles", "readwrite")
      transaction
        .objectStore("bookFiles")
        .add({ bookId: "old-book", data: "preserved" })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
    await expect(db.open()).resolves.toBeDefined()
    const existing = await new Promise<unknown>((resolve, reject) => {
      const request = old
        .transaction("bookFiles")
        .objectStore("bookFiles")
        .get("old-book")
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    expect(existing).toEqual({ bookId: "old-book", data: "preserved" })
    old.close()
  })
})
