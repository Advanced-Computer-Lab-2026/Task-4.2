# Campus Marketplace — ACL UI/UX Lab

This is a **standalone React demo** for one session of the UI/UX Rescue Challenge. It uses realistic example records stored in this browser; it does not connect to MongoDB or the previous lab API.

## Run

```bash
npm install
npm run dev
```

The terminal prints **one local URL**. Open that link in your normal external browser. The development server will **not** open a browser automatically. Press `Ctrl+C` to stop it.

## Functional brief

Users browse active listings; sold items are hidden from the public browse view and remain available in the owner's My listings view. Creating, editing and marking their own item sold must work. Keep prices numeric and non-negative. A new listing starts active; only the owner may edit it.

### Fields from the prior lab

- `title` — Item title: required text
- `price` — Price: non-negative number
- `category` — Category: textbooks, electronics, furniture, clothing, other
- `condition` — Condition: new, like-new, used, worn
- `description` — Description: optional
- `pickup` — Item-specific pickup/meetup location (extra field for this standalone demo)
- `status` — Status: active or sold when editing

The demo supports create/edit on a dedicated listing page and stores your updates in browser `localStorage` for this browser. Add a JPG, PNG, WEBP, or GIF photo when creating or editing a listing; photos are resized before saving, and existing sample listings use remote stock photos that require an internet connection. An icon fallback appears if a listing image cannot load. The current demo account email is filled automatically in the Sell form; no separate contact-email entry is needed. Log out and Log in as You simulate account switching only; this standalone demo has no authentication backend and keeps your listings in local storage. Contact Seller opens the default email application with a sample recipient address; it does not send an in-app message. **Reset demo** restores the example records. You can assume the current signed-in user is `You`.

## User scenario for this session

A student wants to compare second-hand campus items, find an affordable listing and publish an item of their own.

Your redesign should support the scenario above without removing or weakening the existing features.
