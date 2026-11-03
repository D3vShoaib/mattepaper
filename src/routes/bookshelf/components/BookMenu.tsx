import { useRef, useState } from "react"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Book } from "@/db"
import { useReaderSettings } from "@/stores/reader-settings"
import { isFinished } from "@/features/library/book-status"
import {
  removeBook,
  replaceBookCover,
  setBookStatus,
  updateBookDetails,
  type BookDetailsUpdate,
} from "@/features/library/book-actions"
import { BookDetailsSheet } from "./BookDetailsSheet"
import { EditBookSheet } from "./EditBookSheet"
import { RemoveBookDialog } from "./RemoveBookDialog"

type Dialog = "details" | "edit" | "remove" | null

export function BookMenu({
  book,
  className,
}: {
  book: Book
  className?: string
}) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const [mutating, setMutating] = useState(false)
  const [mutationError, setMutationError] = useState("")
  const coverInput = useRef<HTMLInputElement>(null)
  const finished = isFinished(book)
  const resetBookSettings = useReaderSettings((state) => state.reset)
  const close = (next: boolean) => {
    if (!next) setDialog(null)
  }

  async function mutate(action: () => Promise<void>) {
    if (mutating) return false
    setMutating(true)
    setMutationError("")
    try {
      await action()
      return true
    } catch (error) {
      setMutationError(
        error instanceof Error ? error.message : "Could not update this book."
      )
      return false
    } finally {
      setMutating(false)
    }
  }

  async function saveDetails(details: BookDetailsUpdate) {
    const saved = await mutate(() => updateBookDetails(book.id, details))
    if (saved) setDialog(null)
    return saved
  }

  async function remove() {
    const removed = await mutate(() => removeBook(book.id))
    if (!removed) return
    resetBookSettings(book.id)
    setDialog(null)
  }

  return (
    <div className={className}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Options for ${book.title}`}
              disabled={mutating}
              className="size-5 rounded border-0 bg-background/80 text-foreground backdrop-blur-sm hover:bg-background/80 [&_svg]:size-3.5"
            />
          }
        >
          <HugeiconsIcon icon={MoreVerticalIcon} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuItem
            disabled={mutating}
            onClick={() => setDialog("details")}
          >
            <HugeiconsIcon icon={InformationCircleIcon} />
            Details
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={mutating}
            onClick={() => setDialog("edit")}
          >
            <HugeiconsIcon icon={Edit02Icon} />
            Edit details
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={mutating}
            onClick={() => coverInput.current?.click()}
          >
            <HugeiconsIcon icon={ImageUploadIcon} />
            Update cover
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={mutating}
            onClick={() =>
              void mutate(() =>
                setBookStatus(book.id, finished ? "Unread" : "Finished")
              )
            }
          >
            <HugeiconsIcon
              icon={finished ? Undo02Icon : CheckmarkCircle02Icon}
            />
            {finished ? "Mark as unread" : "Mark as finished"}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={mutating}
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
          if (file) void mutate(() => replaceBookCover(book.id, file))
        }}
      />
      {mutationError && !dialog && (
        <p
          role="alert"
          className="text-destructive-foreground absolute right-0 bottom-full z-50 mb-1 w-56 rounded-md bg-destructive px-3 py-2 text-xs shadow"
        >
          {mutationError}
        </p>
      )}
      <BookDetailsSheet
        book={book}
        open={dialog === "details"}
        onOpenChange={close}
      />
      <EditBookSheet
        book={book}
        open={dialog === "edit"}
        onOpenChange={close}
        onSave={saveDetails}
        pending={mutating}
        error={mutationError}
      />
      <RemoveBookDialog
        book={book}
        open={dialog === "remove"}
        onOpenChange={close}
        onRemove={() => void remove()}
        pending={mutating}
        error={mutationError}
      />
    </div>
  )
}
