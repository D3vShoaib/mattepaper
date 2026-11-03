import { useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Book } from "@/db"
import { formatBytes } from "@/lib/format"
import { bookStatus } from "@/features/library/book-status"
import { removeBook } from "@/features/library/book-actions"
import { useReaderSettings } from "@/stores/reader-settings"
import { BookCover } from "@/routes/bookshelf/components/BookCover"
import { RemoveBookDialog } from "@/routes/bookshelf/components/RemoveBookDialog"

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})

function Detail({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  )
}

export function StorageBookDialog({
  book,
  onClose,
}: {
  book: Book
  onClose: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const resetSettings = useReaderSettings((state) => state.reset)
  const percentage = Math.round(Math.max(0, Math.min(1, book.progress)) * 100)

  async function remove() {
    if (pending) return
    setPending(true)
    setError("")
    try {
      await removeBook(book.id)
      resetSettings(book.id)
      onClose()
    } catch {
      setError("Could not delete this book. Please try again.")
      setPending(false)
    }
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-popover p-5 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
          <div className="flex items-start gap-5">
            <div className="w-24 shrink-0">
              <BookCover book={book} />
            </div>
            <div className="min-w-0 flex-1 py-1">
              <Dialog.Title className="text-lg leading-snug font-semibold break-words">
                {book.title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {book.author}
              </Dialog.Description>
              <p className="mt-4 text-xs text-muted-foreground">
                {bookStatus(book)} · {percentage}% complete
              </p>
              <div
                role="progressbar"
                aria-label="Reading progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
          <Separator className="my-5" />
          <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
            <Detail label="Storage used">
              {formatBytes(book.fileSize + (book.cover?.size ?? 0))}
            </Detail>
            <Detail label="Last read">
              {book.lastReadAt ? dateFormat.format(book.lastReadAt) : "Never"}
            </Detail>
            <Detail label="Imported">
              {dateFormat.format(book.importedAt)}
            </Detail>
            <Detail label="EPUB size">{formatBytes(book.fileSize)}</Detail>
            {book.language && <Detail label="Language">{book.language}</Detail>}
            {book.publisher && (
              <Detail label="Publisher">{book.publisher}</Detail>
            )}
            <div className="col-span-2">
              <Detail label="File">{book.fileName}</Detail>
            </div>
          </dl>
          <div className="mt-6 flex justify-between gap-3">
            <Button
              variant="destructive"
              size="lg"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
            >
              <HugeiconsIcon icon={Delete02Icon} /> Delete book
            </Button>
            <Dialog.Close
              render={
                <Button variant="outline" size="lg" disabled={pending}>
                  Close
                </Button>
              }
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
      <RemoveBookDialog
        book={book}
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!pending) setConfirmDelete(open)
        }}
        onRemove={() => void remove()}
        pending={pending}
        error={error}
      />
    </Dialog.Root>
  )
}
