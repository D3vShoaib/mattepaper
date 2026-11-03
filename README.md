# Mattepaper

Mattepaper is an offline-first EPUB reader. Books and reading preferences stay
in the browser on the current device.

## Develop

Requires Node.js 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
```

Run the project checks before shipping:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

To verify installation and offline app-shell behavior, run `pnpm build` and
`pnpm preview` from a secure origin.

## Structure

- `src/routes/` contains the bookshelf, reader, and settings screens.
- `src/features/` owns library, reading, EPUB, font, and PWA behavior.
- `src/features/epub/foliate-adapter.ts` is the React app's boundary to the
  vendored Foliate engine in `packages/foliate-js/`.
- `src/db/` defines the local Dexie database and its migrations.
- `src/stores/` contains persisted UI preferences.
- `src/components/ui/` contains shared Base UI components.

The app has no backend. EPUB files and library data are stored in IndexedDB;
the service worker caches the application shell.
