import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import type { Book } from "@/db"
import type { BookDetailsUpdate } from "@/features/library/book-actions"

export function EditBookSheet({
  book,
  open,
  onOpenChange,
  onSave,
  pending,
  error,
}: {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (details: BookDetailsUpdate) => Promise<boolean>
  pending: boolean
  error: string
}) {
  const [title, setTitle] = useState(book.title)
  const [author, setAuthor] = useState(book.author)
  const [language, setLanguage] = useState(book.language ?? "")
  const [publisher, setPublisher] = useState(book.publisher ?? "")
  const [description, setDescription] = useState(book.description ?? "")
  const canSave = title.trim().length > 0

  async function save() {
    const saved = await onSave({
      title,
      author,
      language,
      publisher,
      description,
    })
    if (saved) onOpenChange(false)
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
        {error && (
          <p role="alert" className="px-6 pb-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <SheetFooter className="flex-row gap-2">
          <SheetClose
            render={<Button variant="outline" className="basis-3/10" />}
          >
            Cancel
          </SheetClose>
          <Button
            className="basis-7/10"
            disabled={!canSave || pending}
            onClick={() => void save()}
          >
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
