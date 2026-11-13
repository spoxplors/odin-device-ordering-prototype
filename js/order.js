/* ==========================================================================
   Shared state and chrome for the device ordering flow.

   Cart, delivery destination, who the order is for, the shipping address and
   submitted orders live in localStorage so the four pages share them. Every
   access is wrapped: in a private window or with site data blocked the reads
   come back empty and the pages still render.
   ========================================================================== */

const STORE_KEY = 'odin.deviceOrdering.v1';

const DEFAULT_STATE = {
  cart: {},
  /* 'US' | 'CA' — the region being ordered in, and the prototype's single
     delivery destination. It decides which devices are on offer, which
     currency they are priced in, and what the shipping address looks like.
     It replaced a free-standing `country`, which had had no control since the
     catalogue's controls row was removed. State saved before this change
     still carries that `country`; it is ignored, and the region defaults to
     the United States so nothing renders empty. */
  region: 'US',
  /* 1 = ordering form only, nothing charged.
     2 = payment added: real totals, and a card / payout choice unless the
         merchant is a government entity.
     Set from ?phase= on entry and switchable in the prototype bar. */
  phase: 1,
  /* 'standard'   = pays in Odin, by card or from next month's payout.
     'government' = pays nothing in Odin; the order goes to a sales rep, who
                    sends a purchase order and invoice outside the platform.
     Phase 2 only — Phase 1 has no such branch and ignores this. */
  merchantType: 'standard',
  /* 'card' | 'payout'. No longer read: the checkout offers no choice, and
     effectivePaymentMethod() returns 'card' for every standard merchant. Kept
     so state saved before that change still loads cleanly, and because
     flow.md has not retired the payout option. It never held card details —
     the CHOICE only, as the payment section in checkout.html explains. */
  paymentMethod: 'card',
  /* 'merchant' = signed-in merchant ordering for themselves.
     'ops'      = internal operations ordering on a merchant's behalf, which
                  requires an explicit merchant choice before submit. */
  mode: 'merchant',
  business: 'Clubessential',
  merchant: 'Clubessential',
  /* null = use the business's address on file for the current region. */
  address: null,
  contact: { recipient: '', email: '', phone: '' },
  orders: []
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return Object.assign({}, DEFAULT_STATE);
    return Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
  } catch (e) {
    return Object.assign({}, DEFAULT_STATE);
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch (e) {
    /* Nothing persists this session; the page still works. */
  }
}

const state = loadState();

function commit() { saveState(state); }

/* ?phase=1|2 is how index.html picks a phase to open. It is sticky:
   once set it stays until the prototype bar or another ?phase= changes it. */
(function applyPhaseFromUrl() {
  const asked = Number(new URLSearchParams(location.search).get('phase'));
  if (asked === 1 || asked === 2) {
    state.phase = asked;
    commit();
  }
})();

function isPhase2() { return state.phase === 2; }

/* ---------- Region ---------- */

/* The whole record, not the code: callers want its currency, tax band,
   shipping rate and address labels as often as its name. */
function currentRegion() { return regionOf(state.region); }

/* Switching region changes what is for sale, so the cart cannot survive it —
   every device belongs to exactly one region and a Victa in a Canadian order
   is a thing the real product could never produce. The address goes too: it
   is the business's address for the old region, in the old region's format,
   and keeping it would put a US state in a Canadian form.

   Placed orders go with them, on the same reasoning and at the user's
   instruction: a reviewer in one region must not be able to read orders from
   the other, and Orders, the order summaries and the Devices table all read
   from the same place. Clearing is what the user asked for over filtering, so
   switching region DISCARDS every order placed before it — there is no
   undo, and a region switch is as destructive as Reset prototype for them.
   That is why `money()` still takes a region per order: an order can outlive
   a switch inside one page's lifetime, and the confirmation screen is still
   on screen when the bar is used. */
function setRegion(code) {
  const next = regionOf(code).code;
  if (next === state.region) return;
  state.region = next;
  state.cart = {};
  state.address = null;
  state.orders = [];
  commit();
}

/* Phase 1 has no government branch, so the merchant type only bites in Phase 2. */
function isGovernment() { return isPhase2() && state.merchantType === 'government'; }

/* 'card' | 'invoice' — what the order will actually be settled by.

   A standard merchant is always 'card': the payout option was removed from the
   checkout, and reading state.paymentMethod here would let a 'payout' stored
   before that change decide an order with no UI left to change it back.
   'payout' can still arrive on an OLD order record, which is why the
   confirmation in checkout.html still has a branch for it. */
function effectivePaymentMethod() {
  if (!isPhase2()) return 'none';
  return isGovernment() ? 'invoice' : 'card';
}

/* The payout a deduction would come out of: next calendar month. */
function nextPayoutMonth() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/* ---------- Escaping: every value below reaches the DOM via innerHTML ---------- */

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ---------- Business / address ---------- */

function businessByName(name) {
  return BUSINESSES.filter(function (b) { return b.name === name; })[0] || BUSINESSES[0];
}

/* The shipping address defaults to the business address on file and is only
   overridden once the user edits it (flow.md Phase 1, step 2). */
function currentAddress() {
  if (state.address) return state.address;
  const addresses = businessByName(state.business).addresses;
  return Object.assign({}, addresses[currentRegion().code] || addresses.US);
}

function resetAddressToBusiness() {
  state.address = null;
  commit();
}

/* ---------- Cart ---------- */

/* Both of these read the region's devices rather than all of them, so a cart
   entry that somehow outlived a region switch cannot be counted or charged. */
function cartLines() {
  return devicesForRegion(state.region)
    .filter(function (d) { return (state.cart[d.id] || 0) > 0; })
    .map(function (d) {
      const qty = state.cart[d.id];
      return { device: d, qty: qty, lineTotal: d.price * qty };
    });
}

function cartCount() {
  return devicesForRegion(state.region).reduce(function (n, d) { return n + (state.cart[d.id] || 0); }, 0);
}

function setQty(deviceId, qty) {
  const n = Math.max(0, Math.min(99, Math.floor(Number(qty) || 0)));
  if (n === 0) delete state.cart[deviceId];
  else state.cart[deviceId] = n;
  commit();
}

function addToCart(deviceId, qty) {
  setQty(deviceId, (state.cart[deviceId] || 0) + (Number(qty) || 1));
}

function clearCart() {
  state.cart = {};
  commit();
}

/* ---------- Totals ----------
   Phase 1 shows the money but never charges it: the beta discount cancels the
   subtotal exactly, and shipping and tax are not calculated.

   Phase 2 drops the discount and adds shipping and tax from the PLACEHOLDER
   tables in js/devices-catalogue.js, so there is a real amount for the card or
   payout choice to act on. Those rates are indicative, not a tax calculation —
   the checkout says so on screen. */

function totals() {
  const lines = cartLines();
  const subtotal = lines.reduce(function (sum, l) { return sum + l.lineTotal; }, 0);

  if (!isPhase2()) {
    const discount = subtotal * BETA_DISCOUNT_RATE;
    return {
      lines: lines,
      subtotal: subtotal,
      discount: discount,
      shipping: 0,
      tax: 0,
      taxLabel: 'Tax',
      taxNote: null,
      total: subtotal - discount
    };
  }

  /* Nothing in the cart means nothing to ship, so the flat rate stays off. */
  const shipping = lines.length ? shippingFor(state.region) : 0;
  const band = taxFor(state.region);
  const tax = (subtotal + shipping) * band.rate;

  return {
    lines: lines,
    subtotal: subtotal,
    discount: 0,
    shipping: shipping,
    tax: tax,
    taxLabel: band.label,
    taxNote: band.note || null,
    total: subtotal + shipping + tax
  };
}

/* ---------- Orders ---------- */

function makeOrderNumber() {
  const n = String(state.orders.length + 1).padStart(4, '0');
  return 'ORD-' + new Date().getFullYear() + '-' + n;
}

/* The order record carries the payment METHOD and nothing else about payment.
   No card number, expiry, CVC or last four digits is written here, to
   localStorage, or anywhere else — see the payment section in checkout.html. */
function submitOrder() {
  const t = totals();
  const method = effectivePaymentMethod();
  const order = {
    number: makeOrderNumber(),
    placedAt: new Date().toISOString(),
    phase: state.phase,
    business: state.business,
    merchant: state.merchant,
    merchantType: isPhase2() ? state.merchantType : 'standard',
    paymentMethod: method,
    /* The region is recorded so this order keeps its own currency when it is
       re-read after the prototype has been switched to the other region. */
    region: state.region,
    country: currentRegion().country,
    address: currentAddress(),
    contact: Object.assign({}, state.contact),
    lines: t.lines.map(function (l) {
      return { id: l.device.id, name: l.device.name, qty: l.qty, unit: l.device.price, lineTotal: l.lineTotal };
    }),
    subtotal: t.subtotal,
    discount: t.discount,
    shipping: t.shipping,
    tax: t.tax,
    taxLabel: t.taxLabel,
    total: t.total,
    /* A government order is not on its way until the purchase order and
       invoice have been dealt with outside Odin, so it does not start as
       In transit the way every other order does. */
    status: method === 'invoice' ? 'Awaiting purchase order' : 'In transit'
  };
  state.orders.unshift(order);
  clearCart();
  commit();
  return order;
}

function orderByNumber(num) {
  return state.orders.filter(function (o) { return o.number === num; })[0];
}

function addressLines(a) {
  return [a.company, a.line1, a.line2, a.city, a.region, a.postcode, a.country]
    .filter(function (v) { return v; });
}

function formatPlaced(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
}

/* ==========================================================================
   Shared flow controls.

   The catalogue lays the cart out itself, beside the page title, so the
   control is a separate piece. renderFlowBar() composed it with a breadcrumb
   for the screens deeper in the flow; nothing calls it any more.
   ========================================================================== */

/* deliverToHtml() and bindDeliverTo() used to live here — a Deliver to select
   over COUNTRIES, last seen in the catalogue's controls row. The region in the
   prototype bar is the delivery destination now, so both they and COUNTRIES
   are gone rather than left dead: two competing destinations would be worse
   than none. git history has them if the control is ever wanted back. */

function cartButtonHtml() {
  return '<a class="btn btn--secondary" href="checkout.html">' +
    '<span class="ms" aria-hidden="true">shopping_cart</span>' +
    '<span>Cart</span>' +
    '<span class="badge badge--neutral" id="flow-cart-count">' + cartCount() + '</span>' +
  '</a>';
}

/* ---------- Toast ----------
   Atlas publishes no toast, so .atlas .flow-toast in css/atlas-components.css
   is composed from tokens. One element is reused per page: a second message
   replaces the first rather than stacking below it, and restarts the three
   seconds.

   role="status" announces it politely rather than interrupting — by the time
   it appears the cart count beside the page title has already changed, so the
   toast is confirmation and not the only signal. */

let flowToastTimer;

function showFlowToast(message) {
  let toast = document.getElementById('flow-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'flow-toast';
    toast.className = 'flow-toast';
    toast.setAttribute('role', 'status');
    /* Inside .atlas, or the component's scoped rules do not reach it. */
    document.querySelector('.atlas').appendChild(toast);
  }

  toast.innerHTML =
    '<span class="ms ms--success" aria-hidden="true">check_circle</span>' +
    '<span>' + esc(message) + '</span>';

  /* Replay the slide when a toast lands while one is already showing. */
  toast.classList.remove('is-visible');
  void toast.offsetWidth;
  toast.classList.add('is-visible');

  clearTimeout(flowToastTimer);
  flowToastTimer = setTimeout(function () {
    toast.classList.remove('is-visible');
  }, 3000);
}

function renderFlowBar(mount, crumbs) {
  const trail = crumbs.map(function (c, i) {
    const last = i === crumbs.length - 1;
    const label = esc(c.label);
    return (c.href && !last ? '<a class="flowbar__crumb link" href="' + esc(c.href) + '">' + label + '</a>'
                            : '<span class="flowbar__crumb flowbar__crumb--current">' + label + '</span>') +
      (last ? '' : '<span class="ms flowbar__sep" aria-hidden="true">chevron_right</span>');
  }).join('');

  mount.innerHTML =
    '<div class="flowbar__left">' + trail +
      '<span class="badge badge--brand flowbar__beta">BETA</span>' +
    '</div>' +
    '<div class="flowbar__right">' + cartButtonHtml() + '</div>';
}

