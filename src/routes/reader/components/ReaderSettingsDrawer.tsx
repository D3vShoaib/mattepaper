import { Settings01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  defaultReaderSettings,
  useReaderSettings,
  type ReaderSettings,
} from "@/stores/reader-settings"

function RangeSetting({
  label,
  value,
  min,
  max,
  step,
  suffix = "",
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-primary"
      />
    </label>
  )
}
export function ReaderSettingsDrawer({
  bookId,
  fixedLayout,
}: {
  bookId: string
  fixedLayout: boolean
}) {
  const settings = useReaderSettings(
    (state) => state.books[bookId] ?? defaultReaderSettings
  )
  const update = useReaderSettings((state) => state.update)
  const reset = useReaderSettings((state) => state.reset)
  const change = (value: Partial<ReaderSettings>) => update(bookId, value)
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Reading settings"
          />
        }
      >
        <HugeiconsIcon icon={Settings01Icon} />
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-xl overflow-y-auto p-6">
          <DrawerTitle className="text-base">Reading settings</DrawerTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Saved for this book.
          </p>
          {fixedLayout && (
            <p className="mt-4 text-sm text-muted-foreground">
              This book uses a fixed layout, so typography and margins cannot be
              adjusted.
            </p>
          )}
          <div className="mt-6 space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm">Theme</legend>
              <ButtonGroup className="w-full">
                {(["night", "paper", "sepia"] as const).map((theme) => (
                  <Button
                    key={theme}
                    type="button"
                    className="flex-1 capitalize"
                    variant={settings.theme === theme ? "default" : "outline"}
                    aria-pressed={settings.theme === theme}
                    onClick={() => change({ theme })}
                  >
                    {theme}
                  </Button>
                ))}
              </ButtonGroup>
            </fieldset>
            <fieldset disabled={fixedLayout}>
              <legend className="mb-2 text-sm">Font</legend>
              <ButtonGroup className="w-full">
                {(["serif", "sans"] as const).map((font) => (
                  <Button
                    key={font}
                    type="button"
                    className="flex-1 capitalize"
                    variant={settings.font === font ? "default" : "outline"}
                    aria-pressed={settings.font === font}
                    onClick={() => change({ font })}
                  >
                    {font}
                  </Button>
                ))}
              </ButtonGroup>
            </fieldset>
            <div
              className={fixedLayout ? "pointer-events-none opacity-50" : ""}
            >
              <fieldset disabled={fixedLayout} className="space-y-5">
                <RangeSetting
                  label="Text size"
                  value={settings.fontSize}
                  min={14}
                  max={40}
                  step={1}
                  suffix=" px"
                  onChange={(fontSize) => change({ fontSize })}
                />
                <RangeSetting
                  label="Line spacing"
                  value={settings.lineHeight}
                  min={1.1}
                  max={2.2}
                  step={0.05}
                  onChange={(lineHeight) => change({ lineHeight })}
                />
                <RangeSetting
                  label="Page margins"
                  value={settings.margin}
                  min={8}
                  max={64}
                  step={2}
                  suffix=" px"
                  onChange={(margin) => change({ margin })}
                />
              </fieldset>
            </div>
          </div>
        </div>
        <DrawerFooter className="mx-auto w-full max-w-xl px-6 pb-6">
          <Button variant="outline" onClick={() => reset(bookId)}>
            Reset to defaults
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
