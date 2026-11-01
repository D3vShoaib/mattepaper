import { useEffect } from "react"
import { Outlet, useLocation } from "react-router"
import { PwaUpdateNotice } from "@/features/pwa/PwaUpdateNotice"
import { requestPersistentStorage } from "@/features/pwa/storage"

export function AppLayout() {
  const path = useLocation().pathname
  const fullWidth = path === "/" || path.startsWith("/read/")

  useEffect(() => {
    void requestPersistentStorage()
  }, [])

  return (
    <div className="app-shell bg-background text-foreground">
      <main
        className={fullWidth ? "flow-root" : "mx-auto max-w-5xl px-4 py-4"}
      >
        <Outlet />
      </main>
      <PwaUpdateNotice />
    </div>
  )
}
