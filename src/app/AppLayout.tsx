import { Outlet, useLocation } from "react-router"

export function AppLayout() {
  const path = useLocation().pathname
  const fullWidth = path === "/" || path.startsWith("/read/")

  return (
    <div className="min-h-svh bg-background text-foreground">
      <main
        className={fullWidth ? "flow-root" : "mx-auto max-w-5xl px-6 py-12"}
      >
        <Outlet />
      </main>
    </div>
  )
}
