import { Outlet, useLocation } from "react-router"

export function AppLayout() {
  const isBookshelf = useLocation().pathname === "/"

  return (
    <div className="min-h-svh bg-background text-foreground">
      <main className={isBookshelf ? "flow-root" : "mx-auto max-w-5xl px-6 py-12"}>
        <Outlet />
      </main>
    </div>
  )
}
