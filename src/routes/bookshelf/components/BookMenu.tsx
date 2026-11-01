import { useRef, useState } from "react"
import { AlertDialog } from "@base-ui/react/alert-dialog"
import {
  CheckmarkCircle02Icon,
  Delete02Icon,
  Edit02Icon,
  ImageUploadIcon,
  InformationCircleIcon,
  MoreVerticalIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { db, type Book } from "@/db"
import { useReaderSettings } from "@/stores/reader-settings"
import { bookStatus, isFinished } from "@/features/library/book-status"
import { formatBytes } from "@/lib/format"

type Dialog = "details" | "edit" | "remove" | null

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

function DetailsSheet({
  book,
  open,
  onOpenChange,
}: {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const state = bookStatus(book)
  const status =
    state === "Reading"
      ? `Reading · ${Math.round(book.progress * 100)}%`
      : state
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-base">Book details</SheetTitle>
          <SheetDescription>{book.title}</SheetDescription>
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

function EditSheet({
  book,
  open,
  onOpenChange,
}: {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [title, setTitle] = useState(book.title)
  const [author, setAuthor] = useState(book.author)
  const [language, setLanguage] = useState(book.language ?? "")
  const [publisher, setPublisher] = useState(book.publisher ?? "")
  const [description, setDescription] = useState(book.description ?? "")
  const canSave = title.trim().length > 0

  async function save() {
    await db.books.update(book.id, {
      title: title.trim(),
      author: author.trim() || "Unknown author",
      language: language.trim() || undefined,
      publisher: publisher.trim() || undefined,
      description: description.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setTitle(book.title)
          setAuthor(book.author)
          setLanguage(book.language ?? "")
          setPublisher(book.publisher ?? "")
          setDescription(book.description ?? "")
        }
        onOpenChange(next)
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-base">Edit details</SheetTitle>
          <SheetDescription>
            Changes apply to this library only. The EPUB file is not modified.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-4 overflow-y-auto px-6 pb-4">
          {(
            [
              ["Title", title, setTitle, "book-edit-title"],
              ["Author", author, setAuthor, "book-edit-author"],
              ["Language", language, setLanguage, "book-edit-language"],
              ["Publisher", publisher, setPublisher, "book-edit-publisher"],
            ] as const
          ).map(([label, value, set, id]) => (
            <div key={id} className="grid gap-1.5">
              <label htmlFor={id} className="text-xs text-muted-foreground">
                {label}
              </label>
              <Input
                id={id}
                className="h-9"
                value={value}
                onChange={(event) => set(event.target.value)}
              />
            </div>
          ))}
          <div className="grid gap-1.5">
            <label
              htmlFor="book-edit-description"
              className="text-xs text-muted-foreground"
            >
              Description
            </label>
            <Textarea
              id="book-edit-description"
              className="min-h-24"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <SheetFooter className="flex-row gap-2">
          <SheetClose
            render={<Button variant="outline" className="basis-3/10" />}
          >
            Cancel
          </SheetClose>
          <Button
            className="basis-7/10"
            disabled={!canSave}
            onClick={() => void save()}
          >
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function RemoveDialog({
  book,
  open,
  onOpenChange,
}: {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const resetBookSettings = useReaderSettings((state) => state.reset)
  async function remove() {
    await db.transaction("rw", db.books, db.bookFiles, async () => {
      await db.books.delete(book.id)
      await db.bookFiles.delete(book.id)
    })
    resetBookSettings(book.id)
    onOpenChange(false)
  }
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(90vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-5 text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <AlertDialog.Title className="font-heading text-base font-medium">
            Remove this book?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            “{book.title}” and its reading progress will be deleted from this
            device. You can import the EPUB again later.
          </AlertDialog.Description>
          <div className="mt-5 flex gap-2">
            <AlertDialog.Close
              render={
                <Button variant="outline" className="basis-1/2">
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              className="basis-1/2"
              onClick={() => void remove()}
            >
              <HugeiconsIcon icon={Delete02Icon} />
              Remove
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export function BookMenu({
  book,
  className,
}: {
  book: Book
  className?: string
}) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const finished = isFinished(book)
  const close = (next: boolean) => {
    if (!next) setDialog(null)
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Options for ${book.title}`}
              className={className}
            />
          }
        >
          <HugeiconsIcon icon={MoreVerticalIcon} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuItem onClick={() => setDialog("details")}>
            <HugeiconsIcon icon={InformationCircleIcon} />
            Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("edit")}>
            <HugeiconsIcon icon={Edit02Icon} />
            Edit details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => coverInput.current?.click()}>
            <HugeiconsIcon icon={ImageUploadIcon} />
            Update cover
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void db.books.update(book.id, { progress: finished ? 0 : 1 })
            }
          >
            <HugeiconsIcon
              icon={finished ? Undo02Icon : CheckmarkCircle02Icon}
            />
            {finished ? "Mark as unread" : "Mark as finished"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDialog("remove")}
          >
            <HugeiconsIcon icon={Delete02Icon} />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={coverInput}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Choose a new cover for ${book.title}`}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file?.type.startsWith("image/"))
            void db.books.update(book.id, { cover: file })
        }}
      />
      <DetailsSheet
        book={book}
        open={dialog === "details"}
        onOpenChange={close}
      />
      <EditSheet book={book} open={dialog === "edit"} onOpenChange={close} />
      <RemoveDialog
        book={book}
        open={dialog === "remove"}
        onOpenChange={close}
      />
    </>
  )
}
