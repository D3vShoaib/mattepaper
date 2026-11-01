import type { ReactNode } from "react"

/** Titled block used by every section of the settings page. */
export function SettingsGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}
