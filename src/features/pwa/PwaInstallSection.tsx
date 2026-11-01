import {
  BookDownloadIcon,
  Books02Icon,
  CheckmarkCircle02Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import { usePwaInstall } from "./pwa-install"

export function PwaInstallSection() {
  const { canInstall, installed, isIos, install } = usePwaInstall()

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-sm font-medium text-muted-foreground">
        Install
      </h2>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
            <HugeiconsIcon icon={Books02Icon} className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Mattepaper</p>
            <p className="text-xs text-muted-foreground">
              {installed
                ? "Installed on this device"
                : "Works offline"}
            </p>
          </div>
          {installed ? (
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="size-4 text-primary"
              />
              Installed
            </span>
          ) : canInstall ? (
            <Button onClick={() => void install()}>
              <HugeiconsIcon icon={BookDownloadIcon} />
              Install
            </Button>
          ) : null}
        </div>
        {!installed && isIos && (
          <p className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Share01Icon} className="mt-0.5 size-4 shrink-0" />
            <span>
              Tap the Share button in Safari, then choose{" "}
              <strong className="font-medium text-foreground">
                Add to Home Screen
              </strong>
              .
            </span>
          </p>
        )}
        {!installed && !canInstall && !isIos && (
          <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            Use your browser’s “Install app” or “Add to Home Screen” option to
            install Mattepaper.
          </p>
        )}
      </div>
    </section>
  )
}
