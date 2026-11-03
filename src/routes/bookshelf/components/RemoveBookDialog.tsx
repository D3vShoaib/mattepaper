import { AlertDialog } from "@base-ui/react/alert-dialog"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import type { Book } from "@/db"

export function RemoveBookDialog({
  book,
  open,
  onOpenChange,
  onRemove,
  pending,
  error,
}: {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemove: () => void
  pending: boolean
  error: string
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[min(90vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-5 text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <AlertDialog.Title className="text-base font-medium">
            Remove this book?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
            “{book.title}” and its reading progress will be deleted from this
            device. You can import the EPUB again later.
          </AlertDialog.Description>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="mt-5 flex gap-2">
            <AlertDialog.Close
              render={
                <Button
                  variant="outline"
                  className="basis-1/2"
                  disabled={pending}
                >
                  Cancel
                </Button>
              }
            />
            <Button
              variant="destructive"
              className="basis-1/2"
              disabled={pending}
              onClick={onRemove}
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
