# Device Ordering — Odin POC

> **Internal Xplor prototype.** A clickable proof of concept for device
> ordering in Odin — not a product, not supported, and not for
> distribution outside Xplor. Prices, tax, shipping, merchants and
> addresses are invented placeholders. No real customer or payment data
> is present, and none should be added. Device photography and hardware
> specifications are Verifone's and Ingenico's.

Static prototype of the Odin portal **Devices** page, built as the base for a new
device ordering flow.

## Running it

```bash
node .claude/serve.js
```

Then open <http://localhost:4178>. No build step, no dependencies —
`.claude/serve.js` is a ~30-line read-only static server for local use only
(`python3 -m http.server 4178` works just as well).

## Layout

```
devices.html          page markup (section header, table card)
js/shell.js         the Odin app bar and sidebar, shared by every page
css/styles.css      design tokens + all styling
js/data.js          synthetic device data and the model catalogue
js/app.js           search, sort, filter, pagination, CSV export
assets/devices/     device photos exported from Figma
assets/icons/       nav + UI icons exported from Figma
assets/brand/       logomark and avatar
```

Every page renders the Odin shell from `js/shell.js` and then moves its own
`<template id="page-template">` into the content area, so the app bar and
sidebar are defined once. The Devices group in that nav is **Device list**
(`devices.html`) and **Orders** (`orders.html`); the ordering flow has no nav
item of its own yet, so it keeps *Device list* highlighted.

The Devices page's single action, **+ Order Devices**, uses `.btn--brand` —
Xplor Pay purple rather than Odin green, marking the doorway into the Atlas
flow. Those three values in `css/styles.css` mirror the Atlas brand tokens and
are the only purple outside the flow.

## Source of truth

Styling, spacing, type and colour come from the Figma frame
**Payment Devices · `1677:87270`** in *Payment Devices – Device Management*
(file `withheld from this repo`). Design tokens are declared as CSS custom
properties at the top of `css/styles.css` and map 1:1 to the Figma variables
(`Gray/*`, `Primary/*`, `Warning/*`, `Error/*`, `Shadow/*`, Roboto type ramp).

Three things follow the **live portal** rather than the Figma frame, as agreed:

| | Figma frame | This build |
|---|---|---|
| Page title | Payment Devices | **Devices** |
| Sidebar | Users / Permissions / Entities | **Merchants, Transactions, Payouts, Reports, Devices** |
| Column order | …Model, Status, Created, Updated | …Model, Created At, Updated At, **Status** last |

Every icon and photo is exported from the Figma frame, with one exception:
**Reversals** has no counterpart in that frame, so its icon is drawn inline in
`js/shell.js` to match the Untitled UI stroke set (20px, 1.6 stroke, `#667085`).

## Behaviour

- **Search** (header) filters on device ID and device name.
- **Column sort** on every column except ID; default is Business Name ascending.
- **Filters** popover: status (multi-select), model, business. The button shows
  a count when filters are active.
- **Export** downloads the current filtered set as `devices.csv`.
- **Rows per page** (10/25/50/100) and Previous/Next pagination.
- **ID chip** copies the device ID to the clipboard.

## Data

`js/data.js` generates 137 synthetic devices from a fixed seed, so the table is
identical on every reload. Business, merchant and device names are invented.

**No real merchant, cardholder or payment data belongs in this repository.** If
this prototype is ever pointed at a real data source, that happens behind the
portal's existing authentication and authorisation — the mock array is a
stand-in for an authorised, tenant-scoped API response, not a data store.

---

# Device ordering flow — Phase 1

Built from `user-flows/flow.md` Phase 1 and the supplied mockups. Entered from
the **Order devices** button on the Devices page.

| Page | File | What it does |
|---|---|---|
| Catalogue | `order.html` | Victa Portable and Victa Mobile cards, filter chips |
| Detail | `device.html?id=…` | Specs, accessories, quantity, Add to cart |
| Checkout | `checkout.html` | Line items, totals, ordering-for, address, submit; *Edit order* opens the Cart dialog |
| Confirmation | `checkout.html` after submit | Order number and what happens next |
| Orders | `orders.html` | Submitted orders with status *In transit* |
| Order summary | `order-summary.html?no=…` | One order: status, address, lines, totals |

## Where the flow lives

The flow is **not** a full page. Each screen renders inside the Odin content
area, straight onto the page background — `.atlas` is only a token scope there
and draws nothing. The catalogue puts the cart beside the page title and
*Deliver to* at the head of the filter row.

The breadcrumb / *Deliver to* / Cart bar is down to one page,
`order-summary.html`. The catalogue and Orders never had it — the sidebar
already says where you are — and the user has since had it taken off
`device.html` and `checkout.html`, which now carry a back link to `order.html`
instead (`.back-link` in `css/order.css`).

That leaves the catalogue's filter row and `order-summary.html` as the only
places the delivery country can be changed.

Because both design systems load on the same page, every rule in
`css/atlas-components.css` and `css/order.css` is scoped to `.atlas`, and the
Odin shell sits outside that scope. `devices.html` does not load the Atlas
stylesheets at all.

Scoping decides which rule wins per property, but a property Atlas never
declares still falls through to Odin's rule of the same name. `css/order.css`
closes the three that did — `display`, `overflow` and `mix-blend-mode` on
`.card` and `.badge` — under *Keeping the two systems apart*. To check a new
component, disable `css/styles.css` in devtools and diff the computed styles;
anything that changes was coming from Odin.

## Design system

This flow uses **Atlas**, not the Odin green of the Devices page — a deliberate
split. `css/atlas.css` holds the Atlas tokens under Atlas's own variable names
(Light + Xplor Pay purple only), so code generated from Figma drops in
unchanged. `css/atlas-components.css` builds Button, Text field, Select, Card,
Callout and Badge against those tokens, following the bindings each component's
Figma description documents. `css/order.css` is layout only.

Atlas publishes controls but no page containers — no Tabs, Table, Drawer, Modal
or Stepper, and Chip is WIP — so the page shell, filter chips, quantity stepper,
Cart dialog and orders table are composed from tokens. Icons are Material
Symbols, which is what Atlas's own icon set is built from.

**Four token values could not be read from Figma** and are marked UNVERIFIED in
`css/atlas.css`: `--color-icon-primary`, `--color-icon-secondary`,
`--color-icon-disabled` and the `--type-page-title-*` ramp. No Atlas frame binds
them, so they are reasoned from neighbouring tokens. Worth a designer check.

The Cart dialog's scrim is a fifth reasoned value: Atlas publishes no scrim
token, so `.atlas .modal` uses `--color-text-primary` (`#14141c`) at 50%, the
ink the shadow tokens are mixed from.

## Money

Prices and totals are shown, and a **100% BETA discount** cancels the subtotal
exactly, so the payment total is always 0.00 and there is no payment step.
Shipping and tax appear as rows but are not calculated — that is Phase 2.

**`UNIT_PRICES` in `js/devices-catalogue.js` are placeholders** pending real
figures.

## Device content

Device renders, headlines, intros and specs come from the Verifone Victa
datasheets bundled with the `victa-devices-datasheets` skill. The hardware facts
are Verifone's; do not edit them.

One exception, on the user's instruction: **Included accessories** no longer
follows the datasheets. Both devices now list the device name and *Charger*,
replacing *Feature base / Mounting pole / Stylus*.

## Data

No real merchant, cardholder or payment data belongs in this repository. The
businesses, merchants and addresses in `js/devices-catalogue.js` are invented
and stand in for an authorised, tenant-scoped API response. Cart and orders are
kept in `localStorage` so the pages share state; every access is wrapped, so the
pages still render where storage is unavailable.

## Not in Phase 1

Payment (Phase 2), payment plans (Phase 3), the government-entity branch, tax ID
collection, and real shipping or tax calculation. `user-flows/flow.md` also
lists six open questions that are still open.
