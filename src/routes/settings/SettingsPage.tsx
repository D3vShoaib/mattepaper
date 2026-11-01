import { ArrowLeft01Icon, RefreshCcwIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { StorageSection } from "@/features/library/StorageSection"
import { PwaInstallSection } from "@/features/pwa/PwaInstallSection"
import { navDirection } from "@/lib/nav-direction"
import { AppearanceSection } from "@/routes/settings/components/AppearanceSection"
import { ReadingDefaultsSection } from "@/routes/settings/components/ReadingDefaultsSection"
import { useReaderSettings } from "@/stores/reader-settings"

export function SettingsPage() {
  const { setTheme } = useTheme()
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
      <AppearanceSection />
      <PwaInstallSection />
      <StorageSection />
      <ReadingDefaultsSection />
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
