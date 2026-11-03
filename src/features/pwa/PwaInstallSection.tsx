import { SettingsGroup } from "@/components/settings-group"
import { usePwaInstall } from "./pwa-install"
import { PwaInstallButton } from "./PwaInstallButton"

export function PwaInstallSection() {
  const { installed } = usePwaInstall()

  return (
    <SettingsGroup title="Install" hideTitle>
      {installed ? (
        <p role="status" className="text-sm text-muted-foreground">
          Installed
        </p>
      ) : (
        <PwaInstallButton fullWidth />
      )}
    </SettingsGroup>
  )
}
