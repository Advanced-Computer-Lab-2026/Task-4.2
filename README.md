# Campus Marketplace — ACL UI/UX Lab

This is a **standalone React demo** for one session of the UI/UX Rescue Challenge. It uses realistic example records stored in this browser; it does not connect to MongoDB or the previous lab API.

## Run

```bash
npm install
npm run dev
```

The terminal prints **one local URL**. Open that link in your normal external browser. The development server will **not** open a browser automatically. Press `Ctrl+C` to stop it.

## Functional brief

Users browse listings; creating, editing and marking their own item sold must work. Keep prices numeric and non-negative. A new listing starts active; only the owner may edit it.

### Fields from the prior lab

- `title` — Item title: required text
- `price` — Price: non-negative number
- `category` — Category: textbooks, electronics, furniture, clothing, other
- `condition` — Condition: new, like-new, used, worn
- `description` — Description: optional
- `pickup` — Item-specific pickup/meetup location (extra field for this standalone demo)
- `status` — Status: active or sold when editing

The demo supports create/edit and stores your updates in browser `localStorage` for this browser. The current demo account email is filled automatically in the Sell form; no separate contact-email entry is needed. Contact Seller opens the default email application with a sample recipient address; it does not send an in-app message. Existing example listings use remote stock photos, which require an internet connection; an icon fallback appears if an image cannot load. **Reset demo** restores the example records. You can assume the current signed-in user is `You`.

## User scenario for this session

A student wants to compare second-hand campus items, find an affordable listing and publish an item of their own.

Your redesign should support the scenario above without removing or weakening the existing features.


## Updated marketplace interactions

- Browse items clears search/category filters; My listings shows only your items with direct editing. Category buttons remain beside the listings, including on mobile.
- Item details and listing forms have a sticky close header and support Escape. Background scrolling is locked while a dialog is open.
- Posting and editing support up to six JPG, PNG or WebP photos (10 MB per file), previews, replacement, removal and cover selection. Images are resized before saving in browser storage. Cancel discards the draft; storage errors keep it open so photos can be removed before retrying.

Run `node scripts/check-ui.cjs` for state/interaction checks. These checks simulate React state and browser image/storage APIs; they do not verify browser layout. Run `npm run build` to verify the production build.

Budget filters accept an optional minimum and maximum price in EGP, including both endpoints. A live count shows matching listings. Clear filters resets search, category, price range and sorting within the current Browse items or My listings view. Negative or reversed ranges display a correction message.
