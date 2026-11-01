import { useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { db, type Book } from "@/db"
import { createReader, type ReaderView } from "@/features/epub/foliate-adapter"

export function ReaderPage() {
  const { bookId } = useParams()
  const container = useRef<HTMLDivElement>(null)
  const reader = useRef<ReaderView | null>(null)
  const [book, setBook] = useState<Book>()
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | undefined
    let write = Promise.resolve()
    async function open() {
      try {
        if (!bookId) throw new Error("Book not found.")
        const [storedBook, storedFile] = await Promise.all([
          db.books.get(bookId),
          db.bookFiles.get(bookId),
        ])
        if (!storedBook || !storedFile)
          throw new Error("This book could not be found in your library.")
        if (cancelled || !container.current) return
        setBook(storedBook)
        const instance = await createReader(
          new File([storedFile.data], storedBook.fileName, {
            type: "application/epub+zip",
          }),
          container.current,
          storedBook.cfi,
          (detail) => {
            if (cancelled || !detail.cfi) return
            const progress = Number.isFinite(detail.fraction)
              ? Math.max(0, Math.min(1, detail.fraction!))
              : storedBook.progress
            write = write
              .then(() =>
                db.books.update(bookId, {
                  cfi: detail.cfi,
                  progress,
                  lastReadAt: Date.now(),
                })
              )
              .then(() => undefined)
              .catch(() => {
                if (!cancelled)
                  setError("Could not save your reading position.")
              })
          }
        )
        if (cancelled) {
          instance.destroy()
          return
        }
        cleanup = instance.destroy
        reader.current = instance.view
        setReady(true)
        setLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not open this book."
          )
          setLoading(false)
        }
      }
    }
    void open()
    return () => {
      cancelled = true
      reader.current = null
      cleanup?.()
    }
  }, [bookId])

  return (
    <section className="flex h-[calc(100svh-6rem)] min-h-96 flex-col">
      <header className="flex items-center justify-between gap-4 border-b pb-4">
        <Link
          to="/"
          className="shrink-0 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Bookshelf
        </Link>
        <h1 className="truncate text-sm font-medium">
          {book?.title ?? "Reader"}
        </h1>
        <span className="w-16" />
      </header>
      {loading && (
        <div
          className="py-3 text-center text-sm text-muted-foreground"
          role="status"
        >
          Opening book…
        </div>
      )}
      {error && (
        <p role="alert" className="py-4 text-center text-sm text-destructive">
          {error}
        </p>
      )}
      <div
        ref={container}
        className={`min-h-0 flex-1 ${loading ? "invisible" : ""}`}
      />
      {!loading && ready && book && (
        <footer className="flex items-center justify-between border-t pt-4">
          <Button variant="outline" onClick={() => void reader.current?.prev()}>
            Previous
          </Button>
          <Button variant="outline" onClick={() => void reader.current?.next()}>
            Next
          </Button>
        </footer>
      )}
    </section>
  )
}
