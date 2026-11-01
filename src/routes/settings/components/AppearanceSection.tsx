import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { SettingsGroup } from "@/components/settings-group"
import { useTheme } from "@/components/theme-provider"

const themeOptions = [
  { value: "system", label: "System", icon: ComputerIcon },
  { value: "light", label: "Light", icon: Sun03Icon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
] as const

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  return (
    <SettingsGroup title="Appearance">
      <ButtonGroup>
        {themeOptions.map(({ value, label, icon }) => (
          <Button
            key={value}
            type="button"
            variant={theme === value ? "default" : "outline"}
            aria-pressed={theme === value}
            onClick={() => setTheme(value)}
          >
            <HugeiconsIcon icon={icon} />
            {label}
          </Button>
        ))}
      </ButtonGroup>
    </SettingsGroup>
  )
}
