import { db, type BookStatus } from "@/db"

export interface BookDetailsUpdate {
  title: string
  author: string
  language: string
  publisher: string
  description: string
}

export async function updateBookDetails(
  id: string,
  details: BookDetailsUpdate
) {
  const title = details.title.trim()
  if (!title) throw new Error("A book title is required.")

  const updated = await db.books.update(id, {
    title,
    author: details.author.trim() || "Unknown author",
    language: details.language.trim() || undefined,
    publisher: details.publisher.trim() || undefined,
    description: details.description.trim() || undefined,
  })
  if (!updated) throw new Error("This book is no longer in your library.")
}

export async function setBookStatus(id: string, status: BookStatus) {
  if (status === "Unread") {
    const updated = await db.books.update(id, (book) => {
      book.status = status
      book.progress = 0
      delete book.cfi
      delete book.lastReadAt
    })
    if (!updated) throw new Error("This book is no longer in your library.")
    return
  }

  const updated = await db.books.update(id, {
    status,
    ...(status === "Finished" ? { progress: 1 } : {}),
  })
  if (!updated) throw new Error("This book is no longer in your library.")
}

export async function replaceBookCover(id: string, file: File) {
  if (!file.size || !file.type.startsWith("image/"))
    throw new Error("Choose a non-empty image file.")

  const updated = await db.books.update(id, { cover: file })
  if (!updated) throw new Error("This book is no longer in your library.")
}

export async function removeBook(id: string) {
  await db.transaction("rw", db.books, db.bookFiles, async () => {
    if (!(await db.books.get(id)))
      throw new Error("This book is no longer in your library.")
    await db.books.delete(id)
    await db.bookFiles.delete(id)
  })
}
