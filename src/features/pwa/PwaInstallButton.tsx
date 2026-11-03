import { DownloadSquare01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePwaInstall } from "./pwa-install"

export function PwaInstallButton({
  fullWidth = false,
}: {
  fullWidth?: boolean
}) {
  const { canInstall, installed, isIos, install } = usePwaInstall()

  if (installed) return null

  if (canInstall)
    return (
      <Button
        variant={fullWidth ? "default" : "outline"}
        size="icon-lg"
        className={fullWidth ? "h-11 w-full gap-2 text-sm" : undefined}
        aria-label="Install Mattepaper"
        title="Install Mattepaper"
        onClick={() => void install()}
      >
        <HugeiconsIcon icon={DownloadSquare01Icon} />
        {fullWidth && "Install Mattepaper"}
      </Button>
    )

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={fullWidth ? "default" : "outline"}
            size="icon-lg"
            className={fullWidth ? "h-11 w-full gap-2 text-sm" : undefined}
            aria-label="Install Mattepaper"
            title="Install Mattepaper"
          />
        }
      >
        <HugeiconsIcon icon={DownloadSquare01Icon} />
        {fullWidth && "Install Mattepaper"}
      </PopoverTrigger>
      <PopoverContent align="end">
        <PopoverHeader>
          <PopoverTitle>Install Mattepaper</PopoverTitle>
          <PopoverDescription>
            {isIos
              ? "Tap the Share button in Safari, then choose Add to Home Screen."
              : "Use your browser’s Install app option, usually in the address bar or menu. It isn’t offered yet on this page, for example in development mode."}
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}
