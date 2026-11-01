import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { useTheme } from "@/components/theme-provider"
import { ReaderSettingsFields } from "@/features/reading/ReaderSettingsFields"
import {
  defaultReaderSettings,
  useReaderSettings,
  type ReaderSettings,
} from "@/stores/reader-settings"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const defaults = useReaderSettings((state) => state.defaults)
  const update = useReaderSettings((state) => state.updateDefaults)
  return (
    <section className="mx-auto max-w-2xl pb-12">
      <Link
        to="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Bookshelf
      </Link>
      <div className="mt-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Customize the app and your reading defaults.
        </p>
      </div>
      <section className="mt-8 space-y-4">
        <div>
          <h2 className="font-heading text-lg font-medium">App appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This controls the app interface, independently of your books.
          </p>
        </div>
        <ButtonGroup>
          {(["system", "light", "dark"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              className="capitalize"
              variant={theme === option ? "default" : "outline"}
              aria-pressed={theme === option}
              onClick={() => setTheme(option)}
            >
              {option}
            </Button>
          ))}
        </ButtonGroup>
      </section>
      <section className="mt-10 space-y-4">
        <div>
          <h2 className="font-heading text-lg font-medium">Reading defaults</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Books use these settings unless you change them in that book’s
            reader.
          </p>
        </div>
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
      </section>
    </section>
  )
}

