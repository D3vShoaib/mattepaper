import type { ReactNode } from "react"

/** Titled block used by every section of the settings page. */
export function SettingsGroup({
  title,
  hideTitle = false,
  children,
}: {
  title: string
  hideTitle?: boolean
  children: ReactNode
}) {
  return (
    <section className="space-y-5">
      <h2 className={hideTitle ? "sr-only" : "text-lg font-semibold"}>
        {title}
      </h2>
      {children}
    </section>
  )
}
