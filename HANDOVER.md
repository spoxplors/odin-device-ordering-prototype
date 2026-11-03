# Handover — Odin device ordering POC

Last updated: 3 November 2026

Picking this up fresh: read this file top to bottom first. *Decisions already
made* and *Gotchas worth knowing* are the two sections that will save you
repeating work — several of them were arrived at the hard way. `README.md`
covers the same ground in more detail for the Devices page and the flow.

## Where this stands

Four things exist and work:

1. **The Odin Devices list page** (`devices.html`) — a static replica of the live
   portal page, styled in Odin green.
2. **Phases 1 and 2 of the device ordering flow** — the same five screens on
   **Atlas** tokens in Xplor Pay purple, entered from the *Order devices* button
   on the Devices page. Which phase is live is a setting, not a separate set of
   pages: see *Phases are a setting* below.
3. **`index.html`** — the way in, listing the three phases and opening
   Phase 1 or Phase 2.
4. **A published copy.** The whole prototype is on GitHub Pages at
   <https://spoxplors.github.io/odin-device-ordering-prototype/> so the link can
   be shared with colleagues. Read *Publishing* below before pushing anything.

The flow renders **inside the Odin content area**, not as a full page: every
screen draws the Odin app bar and sidebar and puts its own content straight onto
the page background — no panel, no **Devices** heading above it.

Everything below was driven end to end in a browser and verified. **None of it
has been reviewed by a human.** The user has been steering it screen by screen,
so the *Decisions* section is where their instructions are recorded — read it
before changing anything there.

Most recent round of changes, in order:

- **The device prices are the user's real figures** — Victa Portable 522.17,
  Victa Mobile 549.63 — **and the currency moved from GBP to USD** with them.
  Shipping and tax are still invented; see *Open items*.
- **The sidebar collapses.** Its collapse button now works on every page that
  draws the shell, toggling to a 72px icons-only rail and back. The preference
  is remembered — see the bullet in *Decisions*.
- **The checkout's Contact card became *Delivery Contact Information***, gained
  a description reading *Optionally add contact information for delivery
  updates.* and a **Contact phone number** field under Email, sharing Email's
  *Used for delivery updates only.* helper. `state.contact` grew a `phone`.
- **The catalogue's controls row was removed** — the *Deliver to* control and
  the filter chips both, on the user's instruction. The catalogue now shows
  every device, and the chips survive only as the plain `.tag`s on each card.
  This took the last writer of `state.country` with it: see *Open items*.

The round before that:

- **The prototype was published** — a public GitHub repo and a GitHub Pages
  site. See *Publishing* below; it changes what may go into a commit.
- `prototype-start.html` became **`index.html`**, and what was `index.html` —
  the Odin Devices page — became **`devices.html`**. Pages serves `index.html`
  at the site root and the user chose the starter page as the landing page.
  Every link, the nav entry in `js/shell.js` and the comments in `js/order.js`
  and `js/prototype-bar.js` moved with them
- **the prototype settings bar went onto every page except the starter page**,
  `devices.html` included — see the bullet in *Decisions* for the script
  collision that caused, which is the one trap in this round
- **the *Available to order* badge stopped being a pill** and took the Atlas
  Badge component's 4px radius. Every other badge stays a pill, deliberately
- **the gap under every page head halved** to one `--space-gap-section` (32px).
  The user asked for it on checkout first, then for all pages
- the catalogue's card image boxes came down from 320px to **250px**
  (`.atlas .device-card__media`), and the device detail page's hero box from
  560px to **450px** (`.atlas .detail__media`)
- the order summary gained a *Back to orders* link, as must any summary page
  added later

The round before that again:

- **Phase 2 was built**: real totals in place of the beta discount, a payment
  section on checkout (card or next month's payout), a government-entity branch
  that takes no payment in Odin at all, and a prototype settings bar for driving
  all of it. Read *Card data* and *Phases are a setting* below before changing
  any of it
- `index.html` was added — a starter page listing the three phases
  and what each contains, with a single button into Phase 1 (the user chose
  `devices.html`, the Devices page, over the catalogue) and the Phase 2 and 3
  buttons disabled until those are built
- the flow bar came off `order-summary.html` too, along with that page's
  *Order Devices* button — **no page has a flow bar now**, and `renderFlowBar()`
  in `js/order.js` and the `.flowbar*` rules in `css/order.css` are dead code
- the flow bar came off `checkout.html` (both its screens) and `device.html`
- `checkout.html` gained a page title, and *Edit order* now opens a Cart dialog
  instead of linking back to the catalogue
- *Included accessories* on both devices became the device name plus *Charger*
- a back link went onto `device.html` (*Back*) and all three of `checkout.html`'s
  screens (*Return to Devices*), all reaching `order.html`

```bash
node .claude/serve.js   # http://localhost:4178
```

No build step, no dependencies.

## What is where

| | |
|---|---|
| `index.html` | Starter page — the three phases and the way into each. `css/prototype-start.css` |
| `devices.html` | Devices list (Odin green). `css/styles.css`, `js/app.js`, `js/data.js`, plus the ordering state module for the prototype bar |
| `js/shell.js` | The Odin app bar and sidebar, shared by all six pages; also the sidebar's collapse toggle |
| `order.html` | Catalogue — device cards. No filters, no *Deliver to* |
| `device.html?id=…` | Device detail — specs, accessories, quantity, Add to cart |
| `checkout.html` | Checkout, the Cart dialog behind *Edit order*, and the confirmation screen after submit |
| `orders.html` | Submitted orders, status *In transit*; rows open a summary |
| `order-summary.html?no=…` | One order: status, address, lines, totals |
| `css/atlas.css` | Atlas design tokens (Light + Xplor Pay purple) |
| `css/atlas-components.css` | Atlas primitives built on those tokens |
| `css/order.css` | Layout for the ordering flow only |
| `css/prototype-start.css` | Layout for the starter page only |
| `js/devices-catalogue.js` | Victa device data, prices, businesses, countries |
| `js/order.js` | Cart, totals, address, orders; the phase / merchant-type helpers and the Cart control |
| `js/prototype-bar.js` | The prototype settings bar. `css/prototype-bar.css` |
| `user-flows/flow.md` | The source flow spec — three phases |
| `assets/devices/victa/` | Victa renders from the datasheets skill |

`index.html` is the exception to everything below: it is the way into
the prototype rather than a screen inside Odin, so it draws no app bar or
sidebar, loads no `css/styles.css` and runs no JavaScript — `.atlas` is the
whole page there, which is why `css/prototype-start.css` gives it the page
background and min-height that `css/order.css` deliberately withholds. Its
phase contents are a reading of `user-flows/flow.md`; if that spec moves, the
page does not follow on its own.

Every other page follows the same shape: `renderShell(activeKey)` writes the Odin app
bar and sidebar and returns `<main class="content">`, then the page moves its
own `<template id="page-template">` into it. The key is the nav item to
highlight — `'device-list'` on `devices.html`, `order.html`, `device.html` and
`checkout.html`, `'orders'` on `orders.html` and `order-summary.html`. The nav
is defined once, in `js/shell.js`.

The flow pages load both design systems, so scoping is now load-bearing: every
rule in `css/atlas-components.css` and `css/order.css` is prefixed with
`.atlas`, and the Odin shell lives outside that scope. `devices.html` does not
load the Atlas stylesheets at all.

**Scoping alone is not enough.** Both systems publish `.card` and `.badge`, and
a property that Atlas never declares still falls through to Odin's rule — which
is how Odin's `display: flex`, `overflow: hidden` and `mix-blend-mode: multiply`
were reaching Atlas components. `css/order.css` now declares those explicitly
under *Keeping the two systems apart*. If you add a component whose class name
exists in both systems, check it the same way: disable `styles.css` in devtools
and diff the computed styles. Anything that changes was coming from Odin.

## Publishing — this repo is public

| | |
|---|---|
| Repo | <https://github.com/spoxplors/odin-device-ordering-prototype> |
| Live site | <https://spoxplors.github.io/odin-device-ordering-prototype/> |
| Pages source | `main`, root folder, legacy deploy-from-branch — no Actions workflow |

Pushing to `main` redeploys. The build takes well under a minute.

```bash
git add -A && git commit -m "…" && git push
```

**Public means public.** A Pages site is reachable by anyone with the link and
is indexable; there is no internal-only setting, and a free account cannot
serve Pages from a private repo at all. The user was told this and chose public
with the sensitive material withheld. So, before every push:

- **No Figma file keys, library keys or internal URLs.** The three Figma
  identifiers were redacted out of this file and out of the header comment in
  `css/atlas.css` when the repo went up — see *Reference*. Do not put them back.
- **No real merchant, cardholder, payment or personal data.** That was already
  the rule (*Data and content* below); publication gives it a public blast
  radius. The personal email address in the supplied checkout mockup stayed out
  for this reason among others.
- `assets/odin-devices-current.png` — a reference screenshot of the live Odin
  portal, used by no page — is **gitignored**. Keep it that way.
- `.DS_Store` is gitignored, at the root and anywhere below it.

`.nojekyll` at the root stops Pages running the files through Jekyll, which
would otherwise drop anything whose name begins with an underscore.

**Pages serves from Linux, which is case-sensitive; macOS is not.** A reference
to `assets/Devices/…` works locally and 404s on the live site. Every asset was
checked at publish time and all returned 200 — check again on the live URL, not
localhost, whenever you add files.

Taking it down: deleting the repo stops the link working immediately, though
anything already crawled may persist in caches for a while.

## Decisions already made — do not relitigate without asking

- **`index.html` is the starter page; `devices.html` is the Devices list.**
  They were the other way round until publication: Pages serves `index.html` at
  the site root and the user picked the starter page as the landing page.
  Swapping them back would change the public URL and break any link already
  shared.
- **One section gap under every page head.** `.atlas .page__head` carries
  `--space-gap-section` (32px), half what it was. The user asked for it on
  checkout, was told the rule is shared by five pages, and asked for all of
  them — so a `page__head--tight` modifier existed for one turn and was then
  removed. Editing that rule now moves every page, which is the intent.
- **Phases are a setting, not separate pages.** Phase 1 and Phase 2 are the
  same five screens. `state.phase` decides which behaviour is live: 1 keeps the
  100% beta discount and shows no payment step, 2 charges a real total. It is
  set from `?phase=` — which is how `index.html`'s two buttons differ
  — and then from the prototype bar, which strips the parameter so a reload
  cannot undo the last change. `BETA_DISCOUNT_RATE` was not deleted; it is
  applied in Phase 1 only.
- **The prototype settings bar is deliberately outside both design systems.**
  Which phase is live and whether the merchant is a government entity would
  come off the merchant's account in real Odin; in a static prototype they have
  nowhere to come from, so the reviewer sets them. The bar sits above the Odin
  app bar in its own hardcoded dark greys — the only colours in the repo
  belonging to neither Odin nor Atlas — because anything token-derived would
  read as product. **This is the one sanctioned exception to the Atlas-only
  rule**; do not extend it, and do not reference those greys from anywhere else.
  It also takes its own height out of `.shell`'s viewport budget, or the whole
  document gains a scrollbar and the content area stops being what scrolls.
- **The bar is on every page except `index.html`**, the Odin
  Devices page included. Putting it on `devices.html` meant loading
  `js/devices-catalogue.js` and `js/order.js` there too, since the bar reads
  and writes the flow's `state` and there is to be one source of truth for
  the settings. Those files and the Devices page's own scripts both declared
  `DEVICES`, `BUSINESSES` and `state`, which is a fatal redeclaration in one
  document, so `js/data.js`'s two constants became `DEVICE_ROWS` and
  `DEVICE_BUSINESSES` and **`js/app.js` is now wrapped in an IIFE** — nothing
  outside it referenced its globals. If you add a script to `devices.html`,
  check it against those two files first. `devices.html` still loads no Atlas
  stylesheet: `css/prototype-bar.css` belongs to neither system.
- **The Merchant / Internal ops toggle moved into that bar**, out of the
  *Ordering for* card on checkout. It is a prototype setting, not something a
  real user would flip mid-checkout. The business and merchant pickers stayed.
- **Phase 2 has no separate review screen.** flow.md gives one; the user chose
  to put payment on the checkout page instead, so the checkout is the review.
- **A government entity never reaches a payment step.** The section is headed
  *Place order* rather than *Payment* and holds a single callout in place of
  the options, the submit button reads *Submit to sales rep*, and the order
  lands as **`Awaiting purchase order`** rather than
  *In transit* — it is not on its way until the purchase order and invoice are
  settled outside Odin. Both status badge helpers already treat anything that
  is not *In transit* as neutral, so that status needed no badge work.
- **The merchant type is ignored in Phase 1**, which has no government branch
  in flow.md. The bar's control is disabled there and says *Phase 2 only*.
- **Atlas only.** Pull components and variables from the Atlas Figma library and
  nothing else. Never `ODIN - Design System`, `Apollo-Web`, `Audit: ODIN DS` or
  legacy Stardust, even when an unscoped search surfaces a closer match. Scope
  every `search_design_system` call with the Atlas `includeLibraryKeys`.
- **Light + Xplor Pay purple only.** Dark mode, the EzyPay orange brand and the
  Compact/Comfortable density modes are out of scope. This is why the single
  resolved value the Figma MCP returns per token is enough.
- **The flow does not match the Devices page, on purpose.** Atlas is purple and
  restyles form fields (label above the input, 32/40 control heights, 8px
  radius, a focus ring). The user accepted this.
- **Inside the Odin content area**, not a full page and not the drawer +
  stepper Odin uses elsewhere. The flow sits on the page background with no
  panel around it. The user supplied two revised screenshots as the target.
- **No page has the flow bar.** It started on the three deeper screens, then
  came off `checkout.html` (both its screens, checkout and the confirmation)
  and `device.html`, and finally off `order-summary.html`. Nothing calls
  `renderFlowBar()` any more. The summary lost its *Order Devices* button in
  the same pass — the nav's *Device list* item is the way back to ordering.
  Of the three controls it composed, only `cartButtonHtml()` is still called —
  by the catalogue and the device detail page. `deliverToHtml()` and
  `bindDeliverTo()` went dead when the catalogue's controls row was removed,
  and `COUNTRIES` in `js/devices-catalogue.js` is now read by dead code alone.
- **The order summary carries a back link to Orders**, and so must any
  summary page added later. It is the same `.back-link` tertiary button with a
  chevron as the two pages below, but it reads *Back to orders* and goes to
  `orders.html` rather than `order.html` — the summary is reached from the
  orders table, not from the catalogue. It sits above the page head on both the
  rendered order and the *Order not found* state; the not-found state keeps its
  inline *Back to orders* link in the prose as well, on the same reasoning as
  checkout's empty state. This does not bring the flow bar back: the head is
  still the title alone.
- **The *Available to order* badge follows the Atlas Badge component, so it is
  not a pill.** Atlas's Badge (node `2359:1068`) binds
  `component/badge/radius` = 4px, and its description names Odin's 16px pills
  as a known divergence. The user asked for this badge to match the
  brand-subtle variant, so `.atlas .device-card > .badge` in `css/order.css`
  overrides the radius to `--radius-small`. Everything else about `.badge`
  already matched the component exactly — `background/brand/subtle` (#f4f2ff),
  `text/brand` (#6923f4), 24px height, 8px padding-x, 4px gap, Label/Default.
  **Every other badge in the prototype stays a pill** — the order statuses,
  the starter page's *Built* / *Not built yet*. The user was asked whether to
  align those with Atlas's 4px radius as well and chose to keep them as
  pills, so the divergence below is deliberate on both sides: this one badge
  follows the component, the rest follow Odin's pill convention. Changing
  that is a one-line edit to `.atlas .badge`, but do not make it unasked.
- **A back link stands in for the breadcrumb on those two pages.** Both go to
  `order.html`, both use `.back-link` in `css/order.css` — a tertiary button
  with a chevron, pulled left by its own padding so the label lines up with
  the content edge. The labels differ because the user chose them: *Back* on
  the device detail page, *Return to Devices* on all three of checkout's
  screens — the checkout itself, the empty cart and the confirmation. On the
  last two it sits alongside a button going to the same place (*Browse
  devices*, *Order more devices*); the user asked for it there anyway, so that
  the way out is in the same spot on every screen.
- **The device detail page repeats the catalogue's page head.** Same
  `.page__head`, same *Order Devices* title, same cart button filled by
  `cartButtonHtml()` — so the title and the cart stay put as you move between
  the two. The *Back* link sits above it, and the device's own name stepped
  down to an `h2` (keeping `.t-page-title`, so it looks unchanged) to leave one
  `h1` per page. This partly reverses the bullet below: the detail page shows
  the cart count again, though never *Deliver to*.
- **The delivery country can no longer be set anywhere.** It shrank with the
  flow bar to the catalogue's controls row, and went entirely when the user had
  that row removed. `state.country` keeps whatever is in `localStorage` —
  `United Kingdom` on a fresh state or after *Reset prototype* — and in Phase 2
  that fixes shipping and the tax band with it. Checkout still *shows* the
  country under the submit button; the country field in its address form writes
  `state.address.country`, the shipping label, not `state.country`. Putting the
  choice back means either a control in the prototype bar or making that
  address field drive `state.country`; the user has not asked for either. See
  *Open items*.
- **The catalogue follows its own mockup**, minus its controls row. The cart
  sits beside the page title; the mockup dropped the BETA badge and the *Which
  device is right for me?* link, and the user later dropped *Deliver to* and the
  filter chips as well, so the page head is now followed straight by the grid.
  `.atlas .controls` and `.atlas .filters` in `css/order.css` and `.atlas .chip`
  in `css/atlas-components.css` are dead but kept, marked as such, so the row
  can go back as it was.
- **The collapsed sidebar is remembered, under its own key.** Every page is
  its own document, so a collapse held only in memory would undo itself on the
  first nav click — the user asked for the button to work, and across a
  multi-page prototype that means persisting it. It is written to
  **`odin.sidebarCollapsed`**, not to `odin.deviceOrdering.v1`: pages draw a
  sidebar whether or not they load `js/order.js`, and *Reset prototype* should
  not spring the menu open. Dropping the persistence is a matter of deleting
  the two `localStorage` lines in `js/shell.js`.
  Collapsed, `.sidebar.is-collapsed` in `css/styles.css` takes the rail to
  `--sidebar-w-collapsed` (72px) and hides the labels and group titles with
  `display: none` rather than removing them, so a screen reader still reads the
  full nav; `applySidebarCollapsed()` adds each label as a `title` so sighted
  users get a tooltip, and swaps the button's `aria-label` and `aria-expanded`.
  There is no animation, because `css/styles.css` uses no transitions anywhere.
- **The contact card is the same in both modes.** The user asked for the new
  heading, description and phone field while looking at the page as internal
  ops, and was asked whether the change should be ops-only; they chose both
  modes, so there is one card and one copy. All three fields stay optional —
  the description says so and nothing gates submit on them.
- **Checkout has a page title.** `<h1 class="t-page-title">Checkout</h1>` in
  the same `.page__head` the catalogue, Orders and the order summary use, on
  both the filled and the empty-cart screens.
- **The cart is edited in a dialog, not back at the catalogue.** *Edit order*
  on checkout opens the composed `.modal` — one row per line with the
  thumbnail, unit price, a quantity stepper, a remove button and the line
  total, and the subtotal above *Return to checkout*. Quantity changes land in
  the cart as they are made; there is no Cancel. Emptying the cart in the
  dialog drops the checkout to its empty state on close. The user supplied a
  Stripe screenshot for the anatomy only — the colour and type are Atlas.
- **Merchant self-serve and internal ops**, where ops must pick the merchant
  before submit.
- **Orders has its own nav item.** The Devices group is *Device list* →
  `devices.html` and *Orders* → `orders.html`, both on the same icon, as the
  user's mockup shows. That is why the Devices page no longer carries a
  *Device orders* button: the nav covers it.
- **One purple button on the Devices page.** *+ Order Devices* uses
  `.btn--brand` in `css/styles.css` — Xplor Pay purple on an otherwise green
  page, marking the doorway into the Atlas flow. Its three values mirror the
  Atlas brand tokens and are the only purple in `styles.css`. Odin green is
  otherwise untouched.
- **100% BETA discount.** Prices and totals are shown, the discount cancels the
  subtotal exactly, the payment total is always 0.00 and there is no payment
  step. Shipping and tax are rows but are not calculated — that is Phase 2.
- **Phase 1 is five screens, not one form.** flow.md's Phase 1 is a single form;
  the supplied mockups (Stripe's Terminal hardware flow) show catalogue →
  detail → checkout → confirmation, and the user chose the mockups. If it feels
  oversized, collapsing back to one form is a small change.

## Card data — read before touching the payment section

**No card data is stored anywhere, and it must stay that way.**

The card fields on checkout are inert mocks. Nothing typed into them is written
to `state`, to `localStorage`, to the order record, or to the console. They are
read once — in the submit handler, to check they are not empty — and discarded.
Only the *choice* of method (`card` | `payout` | `invoice`) is recorded on the
order. Not even a last four digits is kept.

There is **no on-screen warning** saying so: the section carried one and the
user had it removed, so nothing on the page now tells a reviewer the fields are
fake. The guarantee is in the code, not in the UI — keep it that way when
editing `cardFieldsBlock()` and the submit handler in `checkout.html`.

A side effect worth knowing: because nothing is retained, anything that
re-renders the checkout (editing the address, closing the Cart dialog) clears
the card fields and they have to be typed again. That is the intended
trade-off, not a bug.

**This is not the pattern for the real build.** Production Odin must use the
payment provider's hosted or tokenised fields, so a card number never enters
Odin's DOM at all — that is what keeps Odin out of PCI DSS SAQ-D scope. The
prototype deliberately does not model that, because the point here is the
layout and the branching, not the integration.

The simulated payment always succeeds. Failed-payment behaviour is still an
open question in flow.md.

## Open items

1. **Tax and shipping are placeholders; the unit prices are not.**
   `UNIT_PRICES` at the top of `js/devices-catalogue.js` are the user's own
   figures. `TAX_RATES` and `SHIPPING_RATES` beside them are still invented.

   The tax table especially is a simplification that should not be mistaken for
   a calculation: it is one flat rate per country. Real figures do not work that
   way — UK and Irish VAT are different rates, Australian and New Zealand GST
   are different rates again, US sales tax is set by state and turns on nexus
   rather than being a national rate (which is why the US row shows *Varies by
   state* instead of an amount), and an EU B2B supply may be reverse-charged to
   the customer. The checkout says on screen that the rates are indicative.
   Everything is priced in **USD** regardless of destination, which is a
   further simplification — and one that now shows. The user supplied the unit
   prices in dollars and chose USD when asked, but `SHIPPING_RATES` and the
   VAT / GST labels were written against sterling and were not reworked, so a
   United Kingdom order reads *VAT (20%)* and `$9.99` shipping. That was put to
   the user with the figures spelled out and accepted. Changing it means
   revisiting both tables; the currency itself is one line, `CURRENCY` in
   `js/devices-catalogue.js`.

   Orders already in `localStorage` keep the numbers they were placed with and
   are re-rendered through the current symbol, so an order placed before this
   change shows its old sterling amounts with a dollar sign. *Reset prototype*
   clears them.
2. **The modal scrim is invented.** Atlas publishes no scrim token, so
   `.atlas .modal` in `css/atlas-components.css` uses `--color-text-primary`
   (`#14141c`) at 50% — the ink the shadow tokens are mixed from. Same standing
   as the four values below: reasoned, not read.
3. **Included accessories no longer match the datasheets.** On the user's
   instruction both devices now list only the device itself and *Charger*,
   replacing the *Feature base / Mounting pole / Stylus* list that came from
   Verifone's datasheets. A `_Victa_Portable_Xplor.pdf` was supplied alongside
   the instruction but could not be opened here — no PDF tooling on this
   machine — so the list is the user's words, not the PDF's. Worth checking the
   PDF against it.
4. **Four Atlas token values are unverified**, marked `UNVERIFIED` in
   `css/atlas.css`: `--color-icon-primary`, `--color-icon-secondary`,
   `--color-icon-disabled` and the `--type-page-title-*` ramp. No frame in the
   Atlas file binds them, so `get_variable_defs` returns nothing; they are
   reasoned from neighbouring tokens. Needs a designer's eye.
5. **Nothing can set the delivery destination.** Removing the catalogue's
   controls row removed the only writer of `state.country`, so every order is
   priced and shipped to the stored country and a reviewer cannot try another.
   The tax and shipping tables are still wired and still work; only the way in
   is gone. Worth a decision: a control in the prototype bar, the checkout
   address field driving it, or leaving it fixed on purpose.
6. **Phases 1 and 2 have not been reviewed** by the user.
7. **Phase 3** (payment plans) is untouched. See flow.md.
8. **Failed payment is not modelled** — the simulated payment always succeeds,
   and flow.md still lists the behaviour as an open question.
9. **How Odin identifies a government entity is an open question.** The
   prototype bar stands in for whatever that turns out to be — a flag on the
   merchant account, or a self-declared choice on the form.
10. **Payout-deduction terms are not modelled.** The option names next calendar
    month and the full amount; what happens to a merchant with no payout due,
    and whether this survives into Phase 3, are both unanswered.
11. flow.md lists **six open questions** that are still open — notably where
    the flow is entered in real Odin, which users may order, and how the
    *In transit* update reaches Odin.

## Gotchas worth knowing

**Figma MCP, Atlas file `withheld from this repo`**
- `get_metadata` on the ➡️ Icons page fails reproducibly with an SSE parse
  error. Use `get_screenshot`, or a scoped component search, instead.
- `search_design_system` fails on multi-query batches against this file. Send
  one query per call.
- `get_variable_defs` needs a concrete node, not a page id, and only returns
  tokens a node actually *uses* — which is why the four values above are
  missing. There is no "list all variables" call.
- Component descriptions in Atlas are long and genuinely useful: they document
  every token binding, the MUI mapping, the deliberate semantic fallbacks and
  the open gaps. Read them before building a component.

**Atlas content**
- Atlas publishes controls but **no page containers** — no Tabs, Table, Drawer,
  Modal or Stepper, and Chip is WIP. Page shells, filter chips, the quantity
  stepper, the Cart dialog and the orders table are all composed from tokens
  here. The composed pieces live in `css/atlas-components.css` (chip, stepper,
  modal) and `css/order.css` (page shell, grids, orders table, cart rows).
- Atlas icons are **Material Symbols** (each icon names its Material Symbols
  glyph), so the flow loads Material Symbols and binds size and colour to Atlas
  tokens.
- Several Atlas component descriptions say *"NO CHEVRON-DOWN ICON EXISTS"* and
  use `Icon/Placeholder`. That is **stale** — `Icon/Action/chevron-down` exists.
  The descriptions predate the icon set landing. Worth telling whoever owns
  Atlas; it affects every Select in the system.
- Atlas has a documented dark-mode bug: `color/background/hover` equals
  `color/background/surface/raised-2`, making hovered menu rows invisible in
  dark. Not our problem while we are light-only.

**Data and content**
- No real merchant, cardholder or payment data belongs in this repo. The
  businesses, merchants and addresses in `js/devices-catalogue.js` are invented
  and stand in for an authorised, tenant-scoped API response.
- The supplied checkout mockup contains a personal email address. It was
  deliberately **not** carried into the prototype; the email field uses a
  neutral placeholder. Keep it that way. The phone field's placeholder is
  `+44 20 7946 0000`, from Ofcom's range reserved for fiction, for the same
  reason — do not replace it with a real number.
- **The checkout now collects a name, an email and a phone number**, and all
  three sit in `localStorage` under `odin.deviceOrdering.v1` and on every order
  placed. That is personal data as soon as anyone types something real into it,
  and the prototype is on a public URL, so reviewers should use invented
  details. It never leaves the browser — there is no backend — but *Reset
  prototype* is the only thing that clears it, and it survives reloads until
  then. Unlike the card fields (see *Card data*), these values are deliberately
  retained, because the order record is meant to carry them.
- Device renders, headlines and specs come from the Verifone Victa datasheets
  bundled with the `victa-devices-datasheets` skill. The hardware facts are
  Verifone's — do not edit them.
- The mockups are screenshots of **Stripe's** product UI, used for interaction
  pattern and page anatomy only, not Stripe's visual design or copy.

## Verifying a change

Serve, then in a browser at 1553×1079. The prototype bar drives the phase, who
is ordering and the merchant type; *Reset prototype* clears `localStorage`.

Phase 2:

- Standard merchant: subtotal, shipping and tax add to a non-zero total. The
  destination can no longer be changed in the UI, so to exercise the other tax
  bands — including the United States, which shows *Varies by state* rather
  than an amount — edit `country` in `odin.deviceOrdering.v1` in devtools and
  reload
- submit is refused with empty card fields, and the first field takes focus
- filling them and submitting shows *Processing payment…*, then a confirmation
  reading *Paid today … by card*
- the payout option hides the card fields, and its confirmation says the amount
  comes out of next month's payout
- **nothing from the card fields reaches `localStorage`** — check
  `odin.deviceOrdering.v1` in devtools straight after a card submit; the order
  should carry `paymentMethod` and nothing else about payment
- government entity: no payment section, the sales-rep callout in its place,
  *Submit to sales rep*, a neutral confirmation icon rather than the green tick,
  and the order lands as *Awaiting purchase order*
- internal ops still blocks submit until a merchant is chosen
- the contact card reads *Delivery Contact Information* with its description
  and three optional fields in **both** modes and both phases, and submit is
  not blocked when they are all empty
- what is typed into the phone field survives a reload and appears on the order
  record under `contact.phone` — and a `localStorage` entry written before the
  field existed still renders an empty box, not `undefined`

Phase 1 — it must still behave exactly as it did before Phase 2 existed:

- the 100% discount, *Free during beta* shipping, a $0.00 payment total, and no
  payment section anywhere
- the merchant type control in the bar is disabled and reads *Phase 2 only*

Both phases:

- the orders table and the order summaries render Phase 1 and Phase 2 orders
  side by side without either looking broken
- the bar appears on all six pages, `devices.html` included, but not on
  `index.html` — and the Devices table, its filters, sorting and
  export still work, which is what the `js/app.js` IIFE protects

And as before:

- adding to cart from a detail page survives navigation to checkout
- *Edit order* on checkout opens the Cart dialog; + / − and the remove button
  change the cart, the subtotal keeps up, Escape and the scrim close it, and
  the checkout behind shows the new lineup, line totals and totals
- removing the last line in the dialog leaves the checkout on its empty state
- quantity changes update line totals; the BETA discount always brings the
  payment total to 0.00
- every amount on every screen carries a `$` and none a `£` — the catalogue,
  the detail page, the checkout, the Cart dialog, the orders table and the
  summaries all format through `money()`
- submit is blocked with an empty cart, and in ops mode until a merchant is set
- the address edit → confirm round-trip works and the edited address reaches the
  order
- submitting produces a confirmation with an order number and an orders row with
  status *In transit*
- no Odin green in the Atlas flow, and no Atlas purple in the Odin shell —
  except the deliberate `.btn--brand` on the Devices page
- *Device list* is highlighted across the ordering flow and *Orders* on the
  orders and summary pages
- no page draws a flow bar, and the order summary's head is the title alone
- `index.html`'s one live button opens `devices.html`, its Phase 2 and
  3 buttons are disabled, and no Odin green appears on the page itself
- the device detail page carries the catalogue's head: *Order Devices*, the
  cart button with a live count, and *Back* above it — and the page still has
  exactly one `h1`
- the back link reaches `order.html` from the device detail page and from all
  three of checkout's screens, and the one on checkout survives the re-render
  that closing the Cart dialog triggers
- a row in the orders table opens that order's summary; the order number also
  works as a link, and a number that matches nothing shows *Order not found*
- the flow keeps its full height and the content area scrolls — it must not
  shrink to fit (`.atlas { flex: 0 0 auto }` in `css/order.css`)
- disabling `css/styles.css` in devtools changes nothing inside `.atlas`.
  Comparing computed styles before and after will always show Odin's `:root`
  variables going undefined, `-webkit-font-smoothing` changing, and widths
  moving as the sidebar collapses — those are artefacts of the test. Compare a
  component you suspect against `.card`, which is known clean: anything
  differing *beyond* that shared set is real leakage.

After a push, verify on the **live site** as well as localhost. Case-sensitive
paths and files left out of the commit only fail there: load each page and
check the network panel for anything that is not 200.

The sidebar's collapse button should work on all six shell pages and survive
navigation between them: collapse it on the Devices page, click through to the
catalogue and the checkout, and it should still be a 72px rail with the chevron
pointing right and each icon showing its label on hover. Clicking it again
restores the 240px menu. Neither state may give the document a horizontal
scrollbar, and the content area — not the document — must still be what scrolls.

Cart and orders live in `localStorage` under `odin.deviceOrdering.v1`. Clear it
to start from an empty state; the sidebar preference is separate, under
`odin.sidebarCollapsed`. It is per-origin, so an order placed on one port
is invisible on another — if a test order seems to have vanished, check the
port before chasing the bug. Everyone opening the live site gets their own
`localStorage`, so no reviewer can see another's test orders.

## Reference

Figma file keys and the Atlas library key are held outside this repo, which
is public. Ask the design team, or read them from the Figma files directly.

- Odin Devices Figma: file `withheld from this repo`, frame `1677:87270`
- Atlas Figma: file `withheld from this repo`, Foundations page `5:2`
- Atlas library key: `withheld from this repo`
- Flow diagram: Miro board linked at the top of `user-flows/flow.md`
- Repo: <https://github.com/spoxplors/odin-device-ordering-prototype>
- Live site: <https://spoxplors.github.io/odin-device-ordering-prototype/>
