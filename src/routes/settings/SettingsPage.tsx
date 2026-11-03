import { RefreshCcwIcon } from "@hugeicons/core-free-icons"
import { LibraryBigIcon } from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router"
import { cn } from "cn"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-provider"
import { StorageSection } from "@/features/library/StorageSection"
import { PwaInstallSection } from "@/features/pwa/PwaInstallSection"
import { navDirection } from "@/lib/nav-direction"
import { AppearanceSection } from "@/routes/settings/components/AppearanceSection"
import { ReadingDefaultsSection } from "@/routes/settings/components/ReadingDefaultsSection"
import { FullscreenSection } from "@/routes/settings/components/FullscreenSection"
import { useReaderSettings } from "@/stores/reader-settings"
import { useBookshelfSettings } from "@/stores/bookshelf-settings"
import { useAppSettings } from "@/stores/app-settings"

export function SettingsPage() {
  const { setTheme } = useTheme()
  const resetAll = useReaderSettings((state) => state.resetAll)
  const resetBookshelf = useBookshelfSettings((state) => state.resetAll)
  const resetApp = useAppSettings((state) => state.resetAll)
  return (
    <section className="mx-auto max-w-2xl space-y-10">
      <header className="pointer-events-none sticky top-[env(safe-area-inset-top)] z-20 -mx-4 flex items-center px-3 py-2">
        <Link
          to="/"
          viewTransition
          onClick={navDirection("back")}
          aria-label="Back to bookshelf"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-lg" }),
            "pointer-events-auto size-12 shrink-0 rounded-full border-2 border-foreground/25 bg-background hover:bg-background dark:hover:bg-background [&_svg]:size-5"
          )}
        >
          <LibraryBigIcon className="size-5" />
        </Link>
        <h1 className="sr-only">Settings</h1>
      </header>
      <PwaInstallSection />
      <AppearanceSection />
      <FullscreenSection />
      <StorageSection />
      <Separator />
      <ReadingDefaultsSection />
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full text-sm"
        onClick={() => {
          resetAll()
          resetBookshelf()
          resetApp()
          setTheme("dark")
        }}
      >
        <HugeiconsIcon icon={RefreshCcwIcon} />
        Reset all settings
      </Button>
    </section>
  )
}
