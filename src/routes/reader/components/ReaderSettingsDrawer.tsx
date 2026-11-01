import { RefreshCcwIcon, Settings01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ReaderSettingsFields } from "@/features/reading/ReaderSettingsFields"
import { Separator } from "@/components/ui/separator"
import {
  effectiveReaderSettings,
  useReaderSettings,
} from "@/stores/reader-settings"

export function ReaderSettingsDrawer({
  bookId,
  fixedLayout,
  open,
  onOpenChange,
}: {
  bookId: string
  fixedLayout: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const settings = useReaderSettings(
    useShallow((state) => effectiveReaderSettings(state, bookId))
  )
  const overrides = useReaderSettings((state) => state.books[bookId])
  const update = useReaderSettings((state) => state.update)
  const resetFields = useReaderSettings((state) => state.resetFields)
  const resetBook = useReaderSettings((state) => state.reset)
  const hasOverrides = !!overrides && Object.keys(overrides).length > 0
  return (
    <Drawer
      showSwipeHandle
      modal={false}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="Reading settings"
          />
        }
      >
        <HugeiconsIcon icon={Settings01Icon} />
      </DrawerTrigger>
      <DrawerContent className="max-h-[60dvh]">
        <DrawerTitle className="sr-only">Reading settings</DrawerTitle>
        <div className="mx-auto min-h-0 w-full max-w-xl flex-1 overflow-y-auto px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <ReaderSettingsFields
            settings={settings}
            onChange={(change) => update(bookId, change)}
            onReset={(keys) => resetFields(bookId, keys)}
            isResettable={(key) =>
              !!overrides &&
              Object.prototype.hasOwnProperty.call(overrides, key)
            }
            fixedLayout={fixedLayout}
          />
        </div>
        <Separator />
        <DrawerFooter className="mx-auto w-full max-w-xl flex-row gap-2 px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            variant="outline"
            className="basis-3/10"
            title="Reset to global settings"
            aria-label="Reset to global settings"
            disabled={!hasOverrides}
            onClick={() => resetBook(bookId)}
          >
            <HugeiconsIcon icon={RefreshCcwIcon} />
            Reset
          </Button>
          <DrawerClose
            render={
              <Button type="button" variant="outline" className="basis-7/10" />
            }
          >
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
