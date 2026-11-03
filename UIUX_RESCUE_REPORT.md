# Campus Marketplace (Task 4.2) — UI/UX Rescue Challenge Report

**Course / Lab:** Advanced Computer Lab (ACL) — UI/UX Rescue Challenge  
**Target User Scenario:**  
> *"A student wants to compare second-hand campus items, find an affordable listing, and publish an item of their own."*

---

## 1. Executive Summary

This submission redesigns the standalone Campus Marketplace demo to directly support the session scenario without removing or weakening any existing features or validation rules. 

We identified **three distinct, high-impact UI/UX problems** affecting the core student journey:
1. **Discovery & Comparison Barrier:** Students had no way to compare candidate listings side-by-side or filter by affordability limits.
2. **Form Usability & Data Loss Risk:** Form submission errors displayed a vague, unhelpful banner without field-level guidance, and accidental backdrop clicks wiped user drafts permanently.
3. **Listing Transparency & Owner Friction:** Product cards omitted campus meetup locations, hid seller ownership, and required tedious steps for owners to mark items sold.

All three issues have been fixed, tested, and visually documented with before/after screenshots.

---

## 2. Three Distinct UI/UX Problems & Usability Justifications

### Problem 1: Comparison & Affordability Discovery Barrier
* **User's Goal:** A student looking for textbooks or electronics on a tight student budget needs to quickly find affordable listings within their price ceiling and compare competing items (e.g., price, condition, notes, and campus pickup spot) side-by-side before committing.
* **Why the Current UI Hurts Usability:**
  - **No affordability / budget filter:** The only option was a global sort (low-to-high). A student with a 250 EGP budget had to manually scroll through irrelevant listings.
  - **No multi-item comparison:** Opening an item modal obscured the entire marketplace. To compare two calculus books or tech gadgets, students had to repeatedly open, memorize, close, and open another modal.
  - **Sold item clutter:** Sold items (such as the MATH 201 workbook) remained mixed into the search results with no option to hide them.
* **Alternatives & Trade-offs Evaluated:**
  - *Alternative A: Simple price slider only.* Easy to implement, but fails the user scenario requirement of comparing multiple second-hand items.
  - *Alternative B: Multi-item side-by-side comparison dock & matrix + Affordability filters (Selected).* Provides a floating comparison bar (up to 3 items) and a structured comparison modal highlighting the lowest price, condition, campus pickup point, and seller contact.
* **Implemented Solution:**
  - Added a dedicated **Affordability Bar** with Max EGP budget input, quick shortcuts (`≤ 250 EGP`, `≤ 500 EGP`), condition filter, and an `"Available only (hide sold)"` toggle.
  - Added a **`+ Compare`** toggle button on every product card.
  - Added a **Floating Comparison Dock** at the bottom of the screen showing selected items and a **"Compare Side-by-Side ↗"** modal with lowest-price highlighting and campus meetup comparison.

---

### Problem 2: Form Feedback Deficiency & Accidental Data Loss Risk
* **User's Goal:** A student seller wants to publish or edit a listing with clear validation feedback, understanding exactly what inputs need correction, without the anxiety of losing their draft.
* **Why the Current UI Hurts Usability:**
  - **Vague, unhelpful error message:** Submitting an empty or invalid form displayed a generic banner at the bottom: `"Unable to save item. Check the form."` None of the inputs highlighted which field failed, giving the user zero actionable direction.
  - **Accidental modal dismissal & permanent data loss:** Clicking outside the modal (`onMouseDown`) or pressing Escape instantly closed the modal and erased all typed text (title, price, description, pickup location).
  - **Missing photo / visual customization:** Newly published items forced a fallback `📦` emoji with no way to customize or input an image URL.
* **Alternatives & Trade-offs Evaluated:**
  - *Alternative A: Disable submit button until form is valid.* Trade-off: Frustrating for users who don't know which field is preventing submission ("mystery meat" navigation).
  - *Alternative B: Field-level inline validation + Dirty form discard protection + Photo URL/Emoji support (Selected).* Form submits trigger clear, contextual inline error messages on each invalid field, focus the first error, and display an error summary. Backdrop clicks on an edited form trigger a confirmation dialog.
* **Implemented Solution:**
  - Added **field-level inline validation**: Red outline border, `aria-invalid="true"`, and specific error messages (`"Please enter an item title."`, `"Enter a valid price of zero or more EGP."`, `"Please choose a category."`, `"Please choose an item condition."`).
  - Added **Error Summary Banner** at the top of the form listing all failed fields.
  - Added **Draft Protection Modal**: If the user has typed changes and attempts to dismiss the modal, a confirmation prompt prevents accidental loss (`"Discard unsaved changes? [Keep editing] [Discard changes]"`).
  - Added **Photo URL input**, **Listing Icon / Emoji picker**, and live **character counter** (`0/500`) for the description.

---

### Problem 3: Listing Transparency, Owner Controls & Fast Status Management
* **User's Goal:** A student needs to scan essential campus meetup details directly from cards and quickly manage their own listings (identifying owned items and marking them as sold once a campus exchange completes).
* **Why the Current UI Hurts Usability:**
  - **No owner distinction on grid:** The user (`You`) could not distinguish their own listings from others without opening every single card.
  - **Tedious sold status flow:** To mark an item sold after meeting a buyer, an owner had to open details, click "Edit your listing", locate the status dropdown, switch to "Sold", and submit.
  - **Hidden campus pickup locations:** Pickup location (e.g., Gate 3 vs Design building) was hidden inside the modal, forcing repetitive clicking.
* **Alternatives & Trade-offs Evaluated:**
  - *Alternative A: Separate seller dashboard tab.* Trade-off: Fractures the unified campus experience into separate siloed pages.
  - *Alternative B: Integrated Owner Badges + "My Listings" Filter + 1-Click Status Toggles (Selected).* Keeps browsing seamless while empowering the seller with immediate feedback and fast controls.
* **Implemented Solution:**
  - Added **`👤 Your listing`** badges to all listings owned by the logged-in student.
  - Added **`⭐ My Listings`** quick-filter button in the navigation and category bar to view only owned items in 1 click.
  - Added **1-Click "Mark sold" / "Relist"** button directly on the product card and in the item detail view.
  - Surfaced **`📍 Campus Pickup`** location directly on product cards for quick location scanning across campus.

---

## 3. AI Design Suggestion Refined or Rejected

### Suggestion Evaluated:
An initial AI design proposal suggested implementing an **"Algorithmic Deal Score & 5-Axis Radar Chart"** for every item, calculating a mathematical deal rating based on campus market history, and rendering interactive polygon charts inside a multi-step comparison wizard.

### Why It Was Refined / Rejected:
1. **Cognitive Overload for Students:** Campus second-hand transactions are practical and conversational. Students don't want to decipher multi-variable polygon charts to decide if a 240 EGP study lamp is a fair deal.
2. **Artificial Precision:** Second-hand items have nuanced wear and tear (e.g., highlighted textbook pages or cosmetic scratches) that cannot be accurately reduced to an arbitrary algorithmic deal score.
3. **Refined Solution Adopted:** Instead of complex charts, we implemented a clean, **side-by-side comparison matrix** focusing on the criteria students actually care about:
   - Real price with an explicit **"⭐ Lowest Price"** value badge.
   - Physical condition rating.
   - Exact campus pickup/meetup spot (e.g. GUC Library entrance vs Gate 3).
   - Direct action buttons (Contact Seller via email / Edit listing).

---

## 4. Demonstration of Actions & Screenshots

All screenshots are stored in the [`screenshots/`](file:///c:/Users/tonyj/OneDrive/Desktop/projects/Task4ACL/Task-4.2/screenshots) directory:

| Screenshot File | Description | Usability Aspect Demonstrated |
| :--- | :--- | :--- |
| `before_1_homepage.png` | Original marketplace homepage | Lack of budget filtering, no comparison tool, hidden pickup locations, no owner badges. |
| `before_2_vague_error.png` | Original form submission error | Generic `"Unable to save item. Check the form."` alert with no field-level indication. |
| `before_3_item_detail.png` | Original single item modal | Modal blocks browsing; no quick sold toggle for owner; no compare action. |
| `after_1_homepage_enhanced.png` | Redesigned discovery experience | Affordability filter bar, Max EGP input, condition select, "Available only" toggle, "Your listing" badges, compare buttons on cards. |
| `after_2_compare_matrix.png` | Side-by-side comparison modal | Evaluating 2 listings side-by-side with Lowest Price ribbon, condition, campus pickup point, and seller actions. |
| `after_3_unsuccessful_action_inline_errors.png` | **Unsuccessful Action Demonstration** | Submitting empty form highlights each invalid field in red with specific inline error guidance. |
| `after_4_discard_protection_dialog.png` | Draft protection dialog | Confirmation modal preventing accidental loss of unsaved listing data on backdrop or close click. |
| `after_5_main_action_success.png` | **Main Action Demonstration** | Successfully publishing `"Organic Chemistry Lab Manual 4th Ed"` (EGP 175); shows success toast and new card. |

---

## 5. Preserved Behavior & Compliance Verification

| Requirement | Implementation & Verification | Status |
| :--- | :--- | :---: |
| Required Title | Form validates non-empty string; displays inline error if blank. | ✅ Verified |
| Non-negative numeric Price | Validates `Number(price) >= 0`; displays inline error if negative or empty. | ✅ Verified |
| Categories & Conditions | Restricted to valid options (`textbooks`, `electronics`, `furniture`, `clothing`, `other` and `new`, `like-new`, `used`, `worn`). | ✅ Verified |
| Campus Pickup Field | Retained, enhanced with card visibility and comparison specs. | ✅ Verified |
| Status Field | Active or Sold; supported in form and via 1-click owner toggles. | ✅ Verified |
| Owner Permissions | Only items with `owner: 'you'` allow editing or status toggles. | ✅ Verified |
| Contact Seller | Generates properly URI-encoded `mailto:` link with pre-filled subject and body. | ✅ Verified |
| LocalStorage Persistence | Saved under key `acl-marketplace-v3`; auto-syncs on state change. | ✅ Verified |
| Reset Demo Data | Fully restores default seed items and resets all filters. | ✅ Verified |
| Accessibility | Added ARIA roles (`role="dialog"`, `aria-modal="true"`, `aria-invalid`), keyboard `Escape` dismissal, focus styles. | ✅ Verified |

