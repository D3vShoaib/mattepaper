import { useEffect, useRef } from "react"
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { ResetSetting } from "./ResetSetting"

export function NumberStepper({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
  onReset,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
  onReset?: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (input.current) input.current.value = String(value)
  }, [value])
  const normalize = (number: number) =>
    Math.min(
      max,
      Math.max(
        min,
        Number((min + Math.round((number - min) / step) * step).toFixed(4))
      )
    )
  const commit = () => {
    if (!input.current) return
    const raw = input.current.value.trim()
    const next = raw === "" ? value : Number(raw)
    const result = Number.isFinite(next) ? normalize(next) : value
    input.current.value = String(result)
    if (result !== value) onChange(result)
  }
  return (
    <div className="flex min-h-10 flex-wrap items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-1">
        <ResetSetting label={label} onReset={onReset} />
        <div className="inline-flex h-10 max-w-full items-center overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring/30">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="h-full rounded-none"
            aria-label={`Decrease ${label.toLowerCase()}`}
            disabled={value <= min}
            onClick={() => onChange(normalize(value - step))}
          >
            <HugeiconsIcon icon={MinusSignIcon} />
          </Button>
          <input
            ref={input}
            type="number"
            min={min}
            max={max}
            step={step}
            defaultValue={value}
            aria-label={label}
            onChange={(event) => {
              const inputValue = event.currentTarget
              if (inputValue.value !== "" && inputValue.validity.valid) {
                const next = Number(inputValue.value)
                if (Number.isFinite(next) && next !== value)
                  onChange(normalize(next))
              }
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                event.currentTarget.blur()
              }
            }}
            className="w-14 min-w-0 [appearance:textfield] border-0 bg-transparent text-center text-sm tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {unit && (
            <span
              aria-hidden="true"
              className="pr-1 text-xs text-muted-foreground"
            >
              {unit.trim()}
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="h-full rounded-none"
            aria-label={`Increase ${label.toLowerCase()}`}
            disabled={value >= max}
            onClick={() => onChange(normalize(value + step))}
          >
            <HugeiconsIcon icon={PlusSignIcon} />
          </Button>
        </div>
      </div>
    </div>
  )
}
