# Manual browser test results

Tested on 3 November 2026 in the existing Google Chrome tab at `http://localhost:5173/` using native computer control. Inspected the desktop window and Chrome responsive emulation at **375 CSS pixels** wide.

## Observed results

| Check | Result | Observed behavior |
| --- | --- | --- |
| Initial browse | Pass | Seven available seed listings, with EGP prices and item metadata. |
| Search | Pass | `headphones` returned Bluetooth headphones at EGP 650. |
| No results and clearing | Pass | `xyznonexistent` produced zero results and an empty state; clearing restored seven listings. |
| Category | Pass | Textbooks showed only the active Calculus II textbook at EGP 320. |
| Budget | Pass | A maximum of EGP 200 showed the lab coat at 200 and sketching kit at 180. |
| Numeric sorting | Pass | Ascending order was 180, 200, 240, 320, 390, 650, 1,450. Descending reversed it. |
| Combined filters | Pass | Electronics + Used + maximum EGP 700 showed only Bluetooth headphones. |
| Availability | Pass | Initially, All listings showed eight records; Sold showed only the MATH 201 workbook at EGP 140. |
| Comparison contents | Pass | Two items appeared side by side with prices, condition, availability, category, pickup, seller, description, and photos. |
| Comparison limits | Pass | One item left Compare disabled. Three were accepted; a fourth showed an explanation. Removing one allowed a replacement. |
| Details, gallery and ownership | Pass | Headphones showed Omar, Gate 3 pickup, the complete description, and three photos. Selecting the second thumbnail changed the main image. No edit control appeared for this other seller. |
| Seller email handoff | Partial | Verified the sample `mailto:` recipient, encoded subject and body, and clicked Contact seller. No email application or chooser appeared. External handler behavior remains unverified; no message was sent. |
| My listings | Pass | Initially showed the current user's two active items and one sold workbook. Other sellers' items were excluded. |
| Required fields | Pass | Empty submission produced specific title, price, category and condition errors and kept the form open. |
| Negative and zero prices | Pass | -1 was rejected with a price error. A listing priced at 0 published successfully and displayed “Free to a good home.” |
| Publishing | Pass | Created “Manual test calculator”; My listings increased to four, the item was active, and a success notice appeared. Creation was tested at zero; a decimal price was tested by editing the same item. |
| Persistence | Pass | Full reload retained the test listing, description, pickup location, owner, price and two remaining photos. |
| Editing, sold and reactivation | Pass | Changed the test item's price to 125.50 and marked it Sold. Available excluded it; Sold included it. Editing back to Active restored availability. |
| Photo validation and removal | Pass | A 1 MB + 1 byte file, a text file, and a four-photo selection were rejected. Three valid PNGs loaded; the middle photo could be removed. The remaining first and third photos persisted. |
| Keyboard dialogs | Pass after fix | Visible focus worked. Shift+Tab wrapped from the close button to the last control; Tab wrapped back. Escape closed dialogs and restored focus to the originating listing control. |
| Mobile layout | Pass after fix | At 375 px, navigation, filters, cards, detail and editor dialogs remained usable. Categories and the comparison table scrolled horizontally within their own containers. Save changes remained on one line. |

## Fixes made during testing

- Corrected selector specificity so invalid number inputs receive their error border and background; reduced form field text to normal weight.
- Used contained comparison photos so wide table columns do not crop away the product.
- Deferred scrolling to results until the editor has closed, and restored focus without scrolling, preventing saves from leaving the view at the footer.
- Added explicit forward and reverse Tab wrapping inside dialogs; retested both directions.
- Adjusted mobile footer button spacing to keep action labels on one line; retested visually.

## Browser data and verification limits

The original seed listings were not edited or reset. The browser retains one clearly named **Manual test calculator** record at **EGP 125.5**, active, with two generated test photos, for inspection. Reset demo was not executed because it would discard existing browser data. Responsive emulation was disabled and developer tools were closed after testing.

Disposable upload fixtures are in the ignored `.cache/visual-tests/` directory. No personal photos were uploaded. This was Chrome desktop and responsive emulation testing, not testing on a physical mobile device or other browsers.

After the fixes, `npm.cmd test` passed all 13 automated tests and `npm.cmd run build` completed successfully.
