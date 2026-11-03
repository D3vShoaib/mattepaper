import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type { Book } from "@/db"
import { bookStatus } from "@/features/library/book-status"
import { formatBytes } from "@/lib/format"

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  )
}

export function BookDetailsSheet({
  book,
  open,
  onOpenChange,
}: {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const status =
    bookStatus(book) === "Reading"
      ? `Reading · ${Math.round(book.progress * 100)}%`
      : bookStatus(book)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-base">Book details</SheetTitle>
        </SheetHeader>
        <dl className="grid flex-1 auto-rows-min gap-4 overflow-y-auto px-6 pb-4">
          <DetailRow label="Title" value={book.title} />
          <DetailRow label="Author" value={book.author} />
          <DetailRow label="Language" value={book.language} />
          <DetailRow label="Publisher" value={book.publisher} />
          <DetailRow label="Description" value={book.description} />
          <DetailRow label="Status" value={status} />
          <DetailRow label="File" value={book.fileName} />
          <DetailRow
            label="File size"
            value={formatBytes(book.fileSize + (book.cover?.size ?? 0))}
          />
          <DetailRow
            label="Imported"
            value={dateFormat.format(book.importedAt)}
          />
          <DetailRow
            label="Last read"
            value={
              book.lastReadAt ? dateFormat.format(book.lastReadAt) : "Never"
            }
          />
        </dl>
        <SheetFooter>
          <SheetClose render={<Button variant="outline">Close</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
