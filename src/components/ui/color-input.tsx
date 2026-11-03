export function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <ColorPicker
      aria-label={label}
      value={value}
      format="hex"
      onValueChange={(color) => {
        if (color) onChange(color)
      }}
      i18n={{ labels: { panelLabel: label } }}
    >
      <ColorPickerTrigger size="icon-lg" className="size-8 p-1" title={label}>
        <ColorPickerSwatch className="size-full rounded-sm" />
      </ColorPickerTrigger>
      <ColorPickerContent align="end">
        <ColorPickerPanel>
          <ColorPickerArea />
          <ColorPickerSlider channel="hue" />
          <ColorPickerFields />
        </ColorPickerPanel>
      </ColorPickerContent>
    </ColorPicker>
  )
}
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerFields,
  ColorPickerPanel,
  ColorPickerSlider,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/reui/color-picker"
