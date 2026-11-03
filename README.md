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

## Three UI/UX improvements

1. **Clear form validation:** Sell/Edit shows a specific error beside every invalid field, highlights it, and focuses the first invalid field. Errors update as you correct the values. Demo: open **Sell an item**, click **Publish item** with empty fields, then fill them in. A negative price is rejected; zero is allowed.
2. **Budget filtering:** **Maximum price (EGP)** limits listings to your budget and shows the result count. It works together with search, categories and price sorting. Demo: enter **250** to see the example listings priced at EGP 250 or less. **Clear filters** restores all listings without deleting data.
3. **My listings filter:** **My listings only** lets the current user quickly find their active and sold items. Demo: clear filters, enable it, open **Calculus II textbook**, choose **Edit your listing**, change Status to **Sold**, and save. Refresh to show the saved status persists. Disable the filter to browse everyone’s listings again.

Existing listing fields, ownership restrictions, active status for new listings, numeric non-negative prices, photos, seller email links, browser storage and Reset demo remain supported. No database or backend is needed.

On Windows PowerShell, use `npm.cmd install` and `npm.cmd run dev` if execution policy blocks `npm`. Run `node --test tests/marketplace.test.mjs` for validation/filter checks and `npm.cmd run build` to check the production build.

