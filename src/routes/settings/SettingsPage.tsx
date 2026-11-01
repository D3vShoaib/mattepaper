import {
  ArrowLeft01Icon,
  ComputerIcon,
  Moon02Icon,
  RefreshCcwIcon,
  Sun03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"
import { navDirection } from "@/lib/nav-direction"
import { Button, buttonVariants } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { useTheme } from "@/components/theme-provider"
import { PwaInstallSection } from "@/features/pwa/PwaInstallSection"
import { ReaderSettingsFields } from "@/features/reading/ReaderSettingsFields"
import {
  defaultReaderSettings,
  useReaderSettings,
  type ReaderSettings,
} from "@/stores/reader-settings"

const themeOptions = [
  { value: "system", label: "System", icon: ComputerIcon },
  { value: "light", label: "Light", icon: Sun03Icon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
] as const

function Group({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const defaults = useReaderSettings((state) => state.defaults)
  const update = useReaderSettings((state) => state.updateDefaults)
  const resetAll = useReaderSettings((state) => state.resetAll)
  return (
    <section className="mx-auto max-w-2xl space-y-5 pb-6">
      <header className="flex items-center gap-3">
        <Link
          to="/"
          viewTransition
          onClick={navDirection("back")}
          aria-label="Back to bookshelf"
          className={buttonVariants({ variant: "outline", size: "icon-lg" })}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
      </header>
      <Group title="Appearance">
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
      </Group>
      <PwaInstallSection />
      <Group title="Reading defaults">
        <ReaderSettingsFields
          settings={defaults}
          onChange={update}
          onReset={(keys) => {
            const changes: Partial<ReaderSettings> = {}
            for (const key of keys)
              Object.assign(changes, { [key]: defaultReaderSettings[key] })
            update(changes)
          }}
          isResettable={(key) => defaults[key] !== defaultReaderSettings[key]}
        />
      </Group>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          resetAll()
          setTheme("system")
        }}
      >
        <HugeiconsIcon icon={RefreshCcwIcon} />
        Reset all settings
      </Button>
    </section>
  )
}
