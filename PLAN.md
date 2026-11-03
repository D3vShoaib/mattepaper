# V1 close-out

Mattepaper is a local-first EPUB reader. Keep the release focused on reliable
import, reading, position restoration, and a quiet interface. Do not add a
backend or expand the supported book formats in this release.

## In the app

- Import and manage EPUBs in an offline bookshelf.
- Read reflowable and fixed-layout EPUBs through the isolated Foliate adapter.
- Save reading position and reader preferences locally.
- Customize typography, page layout, tap zones, and app theme.
- Install the app and cache its application shell as a PWA.

## Release checks

- Verify import, duplicate detection, malformed files, and storage failures.
- Verify progress and explicit unread/reading/finished status across reloads.
- Verify reader cleanup when navigation, loading, or reflow fails.
- Test text selection, links, keyboard controls, touch targets, and screen sizes.
- Test hostile EPUB content against the production CSP and iframe sandbox.
- Test PWA installation, update prompts, and offline restart on supported browsers.
- Confirm database upgrades preserve existing books and reading positions.

## Out of scope for this release

Cloud sync, accounts, backup/restore, bookmarks, highlights, and in-book search
remain future work. Add them only with clear user workflows and data migrations.
