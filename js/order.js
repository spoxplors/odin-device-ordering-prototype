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
  country: 'United Kingdom',
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
  /* 'card' | 'payout'. The CHOICE only: no card details are ever stored here,
     or anywhere else in this prototype. See the payment section in
     checkout.html. */
  paymentMethod: 'card',
  /* 'merchant' = signed-in merchant ordering for themselves.
     'ops'      = internal operations ordering on a merchant's behalf, which
                  requires an explicit merchant choice before submit. */
  mode: 'merchant',
  business: 'Clubessential',
  merchant: 'Clubessential',
  address: null,
  contact: { recipient: '', email: '' },
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

/* Phase 1 has no government branch, so the merchant type only bites in Phase 2. */
function isGovernment() { return isPhase2() && state.merchantType === 'government'; }

/* 'card' | 'payout' | 'invoice' — what the order will actually be settled by. */
function effectivePaymentMethod() {
  if (!isPhase2()) return 'none';
  return isGovernment() ? 'invoice' : state.paymentMethod;
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
  return Object.assign({}, businessByName(state.business).address);
}

function resetAddressToBusiness() {
  state.address = null;
  commit();
}

/* ---------- Cart ---------- */

function cartLines() {
  return DEVICES
    .filter(function (d) { return (state.cart[d.id] || 0) > 0; })
    .map(function (d) {
      const qty = state.cart[d.id];
      return { device: d, qty: qty, lineTotal: d.price * qty };
    });
}

function cartCount() {
  return DEVICES.reduce(function (n, d) { return n + (state.cart[d.id] || 0); }, 0);
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
  const shipping = lines.length ? shippingFor(state.country) : 0;
  const band = taxFor(state.country);
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
    country: state.country,
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

   The catalogue lays these out itself — the cart beside the page title, the
   delivery destination at the head of the filter row — so each control is a
   separate piece. renderFlowBar() composes them, with a breadcrumb, for the
   screens deeper in the flow, which still need a trail back.
   ========================================================================== */

function deliverToHtml() {
  const options = COUNTRIES.map(function (c) {
    return '<option' + (c === state.country ? ' selected' : '') + '>' + esc(c) + '</option>';
  }).join('');

  return '<label class="deliver">' +
    '<span class="t-secondary">Deliver to</span>' +
    '<span class="input deliver__select">' +
      '<select id="flow-country" aria-label="Delivery destination">' + options + '</select>' +
      '<span class="ms ms--secondary" aria-hidden="true">keyboard_arrow_down</span>' +
    '</span>' +
  '</label>';
}

/* Call once the markup from deliverToHtml() is in the document. */
function bindDeliverTo() {
  const select = document.getElementById('flow-country');
  select.addEventListener('change', function () {
    state.country = select.value;
    commit();
    document.dispatchEvent(new CustomEvent('flow:country'));
  });
}

function cartButtonHtml() {
  return '<a class="btn btn--secondary" href="checkout.html">' +
    '<span class="ms" aria-hidden="true">shopping_cart</span>' +
    '<span>Cart</span>' +
    '<span class="badge badge--neutral" id="flow-cart-count">' + cartCount() + '</span>' +
  '</a>';
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
    '<div class="flowbar__middle">' + deliverToHtml() + '</div>' +
    '<div class="flowbar__right">' + cartButtonHtml() + '</div>';

  bindDeliverTo();
}

