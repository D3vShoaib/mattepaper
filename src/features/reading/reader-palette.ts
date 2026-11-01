import { useMemo, useSyncExternalStore } from "react"

export interface ReaderPalette {
  background: string
  foreground: string
  link: string
  dark: boolean
}
const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style"],
  })
  return () => observer.disconnect()
}
const getSnapshot = () => document.documentElement.classList.contains("dark")
function paletteFor(dark: boolean): ReaderPalette {
  const styles = getComputedStyle(document.documentElement)
  return {
    background:
      styles.getPropertyValue("--background").trim() ||
      (dark ? "#151516" : "#ffffff"),
    foreground:
      styles.getPropertyValue("--foreground").trim() ||
      (dark ? "#f2f1ef" : "#171717"),
    link: dark ? "#b9c8ff" : "#304c9c",
    dark,
  }
}
export function getReaderPalette(): ReaderPalette {
  return paletteFor(getSnapshot())
}
export function useReaderPalette() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false)
  return useMemo(() => paletteFor(dark), [dark])
}
