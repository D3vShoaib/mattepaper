import { useEffect, useMemo, useState } from "react"
import { liveQuery } from "dexie"
import { db, type Book } from "@/db"
import { bookStatus } from "@/features/library/book-status"

export function sortBooks(books: Book[], sort: string) {
  return [...books].sort((a, b) =>
    sort === "Title"
      ? a.title.localeCompare(b.title)
      : sort === "Author"
        ? a.author.localeCompare(b.author)
        : sort === "Date imported"
          ? b.importedAt - a.importedAt
          : (b.lastReadAt ?? 0) - (a.lastReadAt ?? 0) ||
            b.importedAt - a.importedAt
  )
}

export function useLibrary({
  search,
  filter,
  sort,
}: {
  search: string
  filter: string
  sort: string
}) {
  const [books, setBooks] = useState<Book[]>()
  const [error, setError] = useState("")

  useEffect(() => {
    const subscription = liveQuery(() => db.books.toArray()).subscribe({
      next: setBooks,
      error: () =>
        setError(
          "Could not open your local library. Check your browser storage settings."
        ),
    })
    return () => subscription.unsubscribe()
  }, [])

  const visibleBooks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return sortBooks(
      (books ?? []).filter(
        (book) =>
          `${book.title} ${book.author}`.toLocaleLowerCase().includes(query) &&
          (filter === "All" || filter === bookStatus(book))
      ),
      sort
    )
  }, [books, search, filter, sort])

  return { books, visibleBooks, error }
}
