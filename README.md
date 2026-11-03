# Campus Marketplace — ACL UI/UX Lab

This is a **standalone React demo** for one session of the UI/UX Rescue Challenge. It uses realistic example records stored in this browser; it does not connect to MongoDB or the previous lab API.

## Run

```bash
npm install
npm run dev
```

Run these commands from the project root (the folder containing `package.json`).
In Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`:

```powershell
cd C:\Users\MR\Task-4.2
npm.cmd install
npm.cmd run dev
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

## Completed redesign

- Browse available items by default; filter by category, condition, maximum price in EGP, and availability. Search and numeric price sorting work together with these filters.
- Compare up to three listings side by side, including price, condition, description, seller, availability, and pickup location.
- Use **My listings** to see your own active and sold items. Publish an item, edit its details, mark it sold, or make it active again.
- Add up to three optional JPG, PNG, or WebP photos, up to 1 MB each. Photos are stored with the listing in this browser. Existing stock photo galleries and unavailable-image fallbacks remain supported.
- Required fields have specific validation messages. Prices accept zero and reject negative or non-finite values. New listings always start active, and edits are restricted to the current owner.
- Dialogs support keyboard focus containment, Escape to close, and focus restoration. The interface includes visible focus indicators, a skip link, reduced-motion support, and layouts for narrow screens.
- Existing records remain compatible with the original `acl-marketplace-v3` storage key. Storage failures keep the editor open and explain how to retry. Reset asks before discarding changes.

## Verification

```bash
npm test
npm run build
```

The dependency-free Node test suite covers creation, ownership, edits, sold/reactivated status, required fields, price validation, combined filters, numeric sorting, and persistence recovery.

For a manual browser check:

1. Set a maximum price, select a category, and sort by price. Clear filters and search for an item.
2. Add two or three items to comparison and check their details side by side.
3. Open another seller’s item and check its gallery, pickup information, and email link. Only your own items should offer editing.
4. Publish a listing, including one priced at zero. Check required-field errors and optional photo addition/removal.
5. Reload the page, find the item in My listings, edit it, and mark it sold. Check the availability filters and reactivate it.
6. Check keyboard navigation, Escape, focus restoration, and the layout at mobile width. Test Reset demo only after saving anything you want to keep.

Automated tests, the production build, and manual Chrome checks at desktop and 375 px mobile widths have been completed. See [manual test results](MANUAL_TEST_RESULTS.md) for observed behavior, fixes, and the remaining email-handler verification limit.

