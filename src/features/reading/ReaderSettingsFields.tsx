import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NumberStepper } from "./NumberStepper"
import { FontSelector } from "./FontSelector"
import { ColorInput } from "@/components/ui/color-input"
import { ResetSetting } from "./ResetSetting"
import { useReaderPalette } from "./reader-palette"
import type {
  ReaderAction,
  ReaderSettings,
  TapZoneKey,
} from "@/features/reading/reader-settings"

type Change = (value: Partial<ReaderSettings>) => void
type Key = keyof ReaderSettings

function SettingsSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-5">
      <Separator className="mb-6" />
      <h3 className="text-base font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function Choices<T extends string>({
  label,
  value,
  options,
  onChange,
  onReset,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
  onReset?: () => void
}) {
  return (
    <div role="group" aria-label={label}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm">{label}</span>
        <ResetSetting label={label} onReset={onReset} />
      </div>
      <ButtonGroup className="flex w-full">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            className="h-10 min-w-0 flex-1 px-2 text-sm font-normal"
            variant={value === option.value ? "default" : "outline"}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  )
}
function ToggleSetting({
  label,
  checked,
  onChange,
  onReset,
  disabled = false,
  children,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  onReset?: () => void
  disabled?: boolean
  children?: ReactNode
}) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4">
      <span className="min-w-0 flex-1 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <ResetSetting label={label} onReset={onReset} />
        {children}
        <Switch
          aria-label={label}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      </div>
    </div>
  )
}
const actionOptions: { value: ReaderAction; label: string }[] = [
  { value: "none", label: "No action" },
  { value: "previous", label: "Previous page" },
  { value: "next", label: "Next page" },
  { value: "toggle", label: "Toggle controls" },
  { value: "contents", label: "Open contents" },
  { value: "settings", label: "Open settings" },
]
const zoneOptions: { key: TapZoneKey; label: string }[] = [
  { key: "topLeftAction", label: "Top left" },
  { key: "topRightAction", label: "Top right" },
  { key: "bottomLeftAction", label: "Bottom left" },
  { key: "bottomRightAction", label: "Bottom right" },
  { key: "centerAction", label: "Center" },
]
export function ReaderSettingsFields({
  settings,
  onChange,
  onReset,
  isResettable,
  fixedLayout = false,
}: {
  settings: ReaderSettings
  onChange: Change
  onReset: (keys: Key[]) => void
  isResettable: (key: Key) => boolean
  fixedLayout?: boolean
}) {
  const palette = useReaderPalette()
  const reset = (...keys: Key[]) =>
    keys.some(isResettable) ? () => onReset(keys) : undefined
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-semibold">Typography and color</h3>
        <div className="mt-5 space-y-6">
          <ToggleSetting
            label="Custom background color"
            checked={settings.backgroundColor !== null}
            onChange={(value) =>
              onChange({
                backgroundColor: value
                  ? palette.dark
                    ? "#161618"
                    : "#ffffff"
                  : null,
              })
            }
            onReset={reset("backgroundColor")}
          >
            {settings.backgroundColor && (
              <ColorInput
                label="Background color"
                value={settings.backgroundColor}
                onChange={(backgroundColor) => onChange({ backgroundColor })}
              />
            )}
          </ToggleSetting>
          {fixedLayout && (
            <p className="text-sm text-muted-foreground">
              This book has a fixed layout. Its page content cannot be restyled.
            </p>
          )}
          <fieldset
            disabled={fixedLayout}
            className="space-y-5 disabled:opacity-50"
          >
            <FontSelector
              settings={settings}
              onChange={onChange}
              onReset={reset("font", "fontAssetId")}
              disabled={fixedLayout}
            />
            <div className="space-y-3">
              <ToggleSetting
                label="Custom text color"
                checked={settings.fontColor !== null}
                onChange={(value) =>
                  onChange({
                    fontColor: value
                      ? palette.dark
                        ? "#fafafa"
                        : "#18181b"
                      : null,
                  })
                }
                onReset={reset("fontColor")}
              />
              {settings.fontColor && (
                <div className="flex justify-end">
                  <ColorInput
                    label="Text color"
                    value={settings.fontColor}
                    onChange={(fontColor) => onChange({ fontColor })}
                  />
                </div>
              )}
            </div>
            <NumberStepper
              label="Text size"
              value={settings.fontSize}
              min={14}
              max={40}
              step={1}
              unit="px"
              onChange={(fontSize) => onChange({ fontSize })}
              onReset={reset("fontSize")}
            />
            <NumberStepper
              label="Line spacing"
              value={settings.lineHeight}
              min={1.1}
              max={2.2}
              step={0.05}
              onChange={(lineHeight) => onChange({ lineHeight })}
              onReset={reset("lineHeight")}
            />
            <SettingsSection title="Text styling">
              <div className="space-y-5">
                <NumberStepper
                  label="Text scale"
                  value={settings.fontScale}
                  min={80}
                  max={150}
                  step={5}
                  unit="%"
                  onChange={(fontScale) => onChange({ fontScale })}
                  onReset={reset("fontScale")}
                />
                <NumberStepper
                  label="Font weight"
                  value={settings.fontWeight}
                  min={400}
                  max={700}
                  step={100}
                  onChange={(fontWeight) => onChange({ fontWeight })}
                  onReset={reset("fontWeight")}
                />
                <Choices
                  label="Text alignment"
                  value={settings.alignment}
                  options={[
                    { value: "start", label: "Start" },
                    { value: "center", label: "Center" },
                    { value: "end", label: "End" },
                    { value: "justify", label: "Justify" },
                  ]}
                  onChange={(alignment) => onChange({ alignment })}
                  onReset={reset("alignment")}
                />
                <div className="space-y-3">
                  <ToggleSetting
                    label="Respect publisher formatting"
                    checked={settings.respectPublisherFormatting}
                    onChange={(respectPublisherFormatting) =>
                      onChange({ respectPublisherFormatting })
                    }
                    onReset={reset("respectPublisherFormatting")}
                  />
                  <ToggleSetting
                    label="Italic"
                    checked={settings.italic}
                    disabled={settings.respectPublisherFormatting}
                    onChange={(italic) => onChange({ italic })}
                    onReset={reset("italic")}
                  />
                  <ToggleSetting
                    label="Underline"
                    checked={settings.underline}
                    disabled={settings.respectPublisherFormatting}
                    onChange={(underline) => onChange({ underline })}
                    onReset={reset("underline")}
                  />
                </div>
                <div className="space-y-3">
                  <ToggleSetting
                    label="Text shadow"
                    checked={settings.shadowEnabled}
                    onChange={(shadowEnabled) => onChange({ shadowEnabled })}
                    onReset={reset("shadowEnabled")}
                  />
                  {settings.shadowEnabled && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm">Shadow color</span>
                        <div className="flex items-center gap-1">
                          <ResetSetting
                            label="Shadow color"
                            onReset={reset("shadowColor")}
                          />
                          <ColorInput
                            label="Shadow color"
                            value={settings.shadowColor}
                            onChange={(shadowColor) =>
                              onChange({ shadowColor })
                            }
                          />
                        </div>
                      </div>
                      <NumberStepper
                        label="Shadow horizontal offset"
                        value={settings.shadowX}
                        min={-8}
                        max={8}
                        step={1}
                        unit="px"
                        onChange={(shadowX) => onChange({ shadowX })}
                        onReset={reset("shadowX")}
                      />
                      <NumberStepper
                        label="Shadow vertical offset"
                        value={settings.shadowY}
                        min={-8}
                        max={8}
                        step={1}
                        unit="px"
                        onChange={(shadowY) => onChange({ shadowY })}
                        onReset={reset("shadowY")}
                      />
                      <NumberStepper
                        label="Shadow blur"
                        value={settings.shadowBlur}
                        min={0}
                        max={16}
                        step={1}
                        unit="px"
                        onChange={(shadowBlur) => onChange({ shadowBlur })}
                        onReset={reset("shadowBlur")}
                      />
                    </div>
                  )}
                </div>
                <Choices
                  label="Font smoothing"
                  value={settings.fontSmoothing}
                  options={[
                    { value: "system", label: "System" },
                    { value: "antialiased", label: "Smooth" },
                  ]}
                  onChange={(fontSmoothing) => onChange({ fontSmoothing })}
                  onReset={reset("fontSmoothing")}
                />
                <ToggleSetting
                  label="Hyphenation"
                  checked={settings.hyphenation}
                  onChange={(hyphenation) => onChange({ hyphenation })}
                  onReset={reset("hyphenation")}
                />
              </div>
            </SettingsSection>
          </fieldset>
        </div>
      </section>
      <SettingsSection title="Text spacing">
        <fieldset
          disabled={fixedLayout}
          className="space-y-5 disabled:opacity-50"
        >
          <NumberStepper
            label="Letter spacing"
            value={settings.letterSpacing}
            min={-0.05}
            max={0.2}
            step={0.01}
            unit="em"
            onChange={(letterSpacing) => onChange({ letterSpacing })}
            onReset={reset("letterSpacing")}
          />
          <NumberStepper
            label="Word spacing"
            value={settings.wordSpacing}
            min={0}
            max={0.5}
            step={0.05}
            unit="em"
            onChange={(wordSpacing) => onChange({ wordSpacing })}
            onReset={reset("wordSpacing")}
          />
          <NumberStepper
            label="Paragraph spacing"
            value={settings.paragraphSpacing}
            min={0}
            max={2}
            step={0.05}
            unit="em"
            onChange={(paragraphSpacing) => onChange({ paragraphSpacing })}
            onReset={reset("paragraphSpacing")}
          />
          <NumberStepper
            label="First-line indentation"
            value={settings.textIndent}
            min={0}
            max={4}
            step={0.1}
            unit="em"
            onChange={(textIndent) => onChange({ textIndent })}
            onReset={reset("textIndent")}
          />
        </fieldset>
      </SettingsSection>
      <section>
        <Separator className="mb-6" />
        <h3 className="text-base font-semibold">Page layout</h3>
        <fieldset
          disabled={fixedLayout}
          className="mt-4 space-y-5 disabled:opacity-50"
        >
          <Choices
            label="Reading mode"
            value={settings.mode}
            options={[
              { value: "paginated", label: "Pages" },
              { value: "scrolled", label: "Scroll" },
            ]}
            onChange={(mode) => onChange({ mode })}
            onReset={reset("mode")}
          />
          <fieldset
            disabled={settings.mode === "scrolled"}
            className="disabled:opacity-50"
          >
            <Choices
              label="Pages per spread"
              value={settings.columns}
              options={[
                { value: "1", label: "One" },
                { value: "auto", label: "Auto" },
              ]}
              onChange={(columns) => onChange({ columns })}
              onReset={reset("columns")}
            />
          </fieldset>
          <SettingsSection title="Margins and column spacing">
            <div className="space-y-5">
              <NumberStepper
                label="Column gap"
                value={settings.columnGap}
                min={0}
                max={96}
                step={2}
                unit="px"
                onChange={(columnGap) => onChange({ columnGap })}
                onReset={reset("columnGap")}
              />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <NumberStepper
                  label="Top margin"
                  value={settings.marginTop}
                  min={0}
                  max={96}
                  step={2}
                  unit="px"
                  onChange={(marginTop) => onChange({ marginTop })}
                  onReset={reset("marginTop")}
                />
                <NumberStepper
                  label="Right margin"
                  value={settings.marginRight}
                  min={0}
                  max={96}
                  step={2}
                  unit="px"
                  onChange={(marginRight) => onChange({ marginRight })}
                  onReset={reset("marginRight")}
                />
                <NumberStepper
                  label="Bottom margin"
                  value={settings.marginBottom}
                  min={0}
                  max={96}
                  step={2}
                  unit="px"
                  onChange={(marginBottom) => onChange({ marginBottom })}
                  onReset={reset("marginBottom")}
                />
                <NumberStepper
                  label="Left margin"
                  value={settings.marginLeft}
                  min={0}
                  max={96}
                  step={2}
                  unit="px"
                  onChange={(marginLeft) => onChange({ marginLeft })}
                  onReset={reset("marginLeft")}
                />
              </div>
            </div>
          </SettingsSection>
        </fieldset>
      </section>
      <SettingsSection title="Tap zones">
        <div className="space-y-4">
          {zoneOptions.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm">{label}</span>
              <div className="flex min-w-0 items-center gap-1">
                <ResetSetting label={`${label} action`} onReset={reset(key)} />
                <Select
                  value={settings[key]}
                  onValueChange={(value) => {
                    const action = actionOptions.find(
                      (item) => item.value === value
                    )
                    if (action) onChange({ [key]: action.value })
                  }}
                >
                  <SelectTrigger
                    aria-label={`${label} action`}
                    className="w-40"
                  >
                    <SelectValue>
                      {
                        actionOptions.find(
                          (item) => item.value === settings[key]
                        )?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {actionOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  )
}
