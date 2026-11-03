# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A standalone React 18 + Vite 5 demo ("Campus Marketplace") for one session of the ACL **UI/UX Rescue Challenge**. The app works but is deliberately weak on UX. The job is to redesign it for the scenario in `README.md` (a student compares second-hand campus items, finds an affordable one, and publishes their own listing) **without removing or weakening any existing feature**. There is no backend, router, test suite or linter.

The `AGENTS.md` in a parent directory (`C:\GUC\Sem7`) is for a different project (Diwan). It does not apply here.

## Commands

```bash
npm install
npm run dev       # scripts/dev.mjs: Vite on 127.0.0.1:5173 (next free port if taken); prints one URL; never opens a browser
npm run build     # vite build -> dist/
npm run preview   # serve the build on 127.0.0.1
```

`.npmrc` silences npm output (`loglevel=silent`), so a quiet `npm install` is normal.

## Architecture

- `src/main.jsx` mounts `App`. `src/App.jsx` holds the whole app: seed data, validation, image fallback and every view. `src/styles.css` is all the styling: one minified block with hard-coded hex colours and Google Fonts (DM Sans, Outfit).
- **State** lives in `App` with `useState`. `items` is saved to `localStorage` under the key `acl-marketplace-v3` on every change. If that key is missing or invalid, the app falls back to the `seed` array. Changing the seed shape means bumping the key, or old saved data will be loaded instead. **Reset demo** (in the footer) restores `seed`.
- **Views:** one page (promo hero, then a discovery section with search, sort and category chips, then the listing grid) plus two overlays controlled by state:
  - `selected` (an item id) opens the detail dialog: photo gallery (`activePhoto`), pickup and seller info, and either **Edit your listing** (owner) or a `mailto:` **Contact seller** link (other people's active items).
  - `editor` (`{id, form}`; `id` is null when creating) opens the sell/edit form.
- **Ownership:** the demo user is hard-coded (`currentUser` = `You` / `you@example.com`). Items have `owner: 'you' | 'other'`. `startEdit` refuses items that aren't yours. Saving always sets the owner and seller fields from `currentUser`. The seller email field is read-only.
- **Validation:** `findError(form)` checks for a title, a finite price of zero or more, a category and a condition from their lists, and a status of `active`/`sold`. `submit` currently throws away the specific message and shows a generic error. New items are always created as `status: 'active'`. The status select appears only when editing.
- `ListingImage` falls back to the item's `emoji` when a remote Unsplash photo fails to load. Seed photos need an internet connection. Credits are in `PHOTO_CREDITS.md`.
- `cap()` turns stored lowercase values (`like-new`, `textbooks`) into display labels.

## Functional rules to preserve (from README)

- Fields: `title` (required), `price` (number, zero or more, EGP), `category` (textbooks, electronics, furniture, clothing, other), `condition` (new, like-new, used, worn), `description` (optional), `pickup`, `status` (active/sold, only when editing).
- Browse, search, filter, sort, create, edit and mark your own item as sold must all keep working. Only the owner can edit. A new listing starts active.
- Contact Seller only opens the default email app. There is no in-app messaging. Keep the `localStorage` persistence and the Reset demo button.
