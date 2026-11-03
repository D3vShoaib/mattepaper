import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AppSettings {
  showFullscreenButton: boolean
  setShowFullscreenButton: (visible: boolean) => void
  resetAll: () => void
}

export const useAppSettings = create<AppSettings>()(
  persist(
    (set) => ({
      showFullscreenButton: false,
      setShowFullscreenButton: (showFullscreenButton) =>
        set({ showFullscreenButton }),
      resetAll: () => set({ showFullscreenButton: false }),
    }),
    {
      name: "mattepaper-app-settings",
      partialize: ({ showFullscreenButton }) => ({ showFullscreenButton }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<AppSettings> | null
        return {
          ...current,
          showFullscreenButton:
            typeof saved?.showFullscreenButton === "boolean"
              ? saved.showFullscreenButton
              : false,
        }
      },
    }
  )
)
