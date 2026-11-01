import { SettingsGroup } from "@/components/settings-group"
import { ReaderSettingsFields } from "@/features/reading/ReaderSettingsFields"
import {
  defaultReaderSettings,
  useReaderSettings,
  type ReaderSettings,
} from "@/stores/reader-settings"

export function ReadingDefaultsSection() {
  const defaults = useReaderSettings((state) => state.defaults)
  const update = useReaderSettings((state) => state.updateDefaults)
  return (
    <SettingsGroup title="Reading defaults">
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
    </SettingsGroup>
  )
}
