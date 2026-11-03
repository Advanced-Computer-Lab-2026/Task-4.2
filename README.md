# Campus Marketplace â€” ACL UI/UX Lab

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

- `title` â€” Item title: required text
- `price` â€” Price: non-negative number
- `category` â€” Category: textbooks, electronics, furniture, clothing, other
- `condition` â€” Condition: new, like-new, used, worn
- `description` â€” Description: optional
- `pickup` â€” Item-specific pickup/meetup location (extra field for this standalone demo)
- `status` â€” Status: active or sold when editing

The demo supports create/edit and stores your updates in browser `localStorage` for this browser. The current demo account email is filled automatically in the Sell form; no separate contact-email entry is needed. Contact Seller opens the default email application with a sample recipient address; it does not send an in-app message. Existing example listings use remote stock photos, which require an internet connection; an icon fallback appears if an image cannot load. **Reset demo** restores the example records. You can assume the current signed-in user is `You`.

## User scenario for this session

A student wants to compare second-hand campus items, find an affordable listing and publish an item of their own.

Your redesign should support the scenario above without removing or weakening the existing features.


## Product comparison and photos

Select **Compare** on up to three listings. The comparison tray stays at the bottom of the page and lets you remove items or clear the selection. **Compare now** opens a responsive side-by-side view of listing details; the lowest price is highlighted for reference.

When creating or editing a listing, use **Product Photos** to browse or drag in up to four JPG, PNG, or WebP images (10 MB maximum per original file). Images are resized to at most 1280 pixels and converted to JPEG in the browser before they are saved in the listing's existing localStorage record. Saved images persist in that browser and appear in cards, item details, and comparison. Browser localStorage has a limited quota, so large photo collections can eventually prevent further saves.

