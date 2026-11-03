import { createBrowserRouter, Link, RouterProvider } from "react-router"
import { LibraryBigIcon } from "lucide-react"
import { AppLayout } from "@/app/AppLayout"

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { BookshelfPage } =
            await import("@/routes/bookshelf/BookshelfPage")
          return { Component: BookshelfPage }
        },
      },
      {
        path: "read/:bookId",
        lazy: async () => {
          const { ReaderPage } = await import("@/routes/reader/ReaderPage")
          return { Component: ReaderPage }
        },
      },
      {
        path: "settings",
        lazy: async () => {
          const { SettingsPage } =
            await import("@/routes/settings/SettingsPage")
          return { Component: SettingsPage }
        },
      },
      {
        path: "*",
        element: (
          <section>
            <h1 className="font-heading text-3xl font-semibold">
              Page not found
            </h1>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 text-sm underline"
            >
              <LibraryBigIcon className="size-4" aria-hidden="true" />
              Return to bookshelf
            </Link>
          </section>
        ),
      },
    ],
  },
])

export function App() {
  return <RouterProvider router={router} />
}

export default App
