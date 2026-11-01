import type { Book } from "@/db"

export type BookStatus = "Unread" | "Reading" | "Finished"

const FINISHED_PROGRESS = 0.99

export function isFinished(book: Pick<Book, "progress">) {
  return book.progress >= FINISHED_PROGRESS
}

export function bookStatus(book: Pick<Book, "progress">): BookStatus {
  if (isFinished(book)) return "Finished"
  return book.progress > 0 ? "Reading" : "Unread"
}
