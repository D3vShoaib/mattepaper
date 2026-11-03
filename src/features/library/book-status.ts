import type { Book, BookStatus } from "@/db"

export type { BookStatus } from "@/db"

export function isFinished(book: Pick<Book, "status">) {
  return book.status === "Finished"
}

export function bookStatus(book: Pick<Book, "status">): BookStatus {
  return book.status
}

export function statusAfterProgress(
  status: BookStatus,
  progress: number
): BookStatus {
  return status === "Finished" || progress >= 1 ? "Finished" : "Reading"
}
