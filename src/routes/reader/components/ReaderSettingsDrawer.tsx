import { Settings01Icon } from "@hugeicons/core-free-icons"
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
        <DrawerFooter className="mx-auto w-full max-w-xl px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <DrawerClose
            render={
              <Button type="button" variant="outline" className="w-full" />
            }
          >
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
