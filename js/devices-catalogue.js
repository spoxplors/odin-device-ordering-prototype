/* ==========================================================================
   Phase 1 device catalogue — Victa Portable and Victa Mobile.

   Device renders, headlines, intros and specs come from the Verifone Victa
   datasheets bundled with the victa-devices-datasheets skill. Hardware facts
   are Verifone's and must not be edited here.

   PRICES ARE PLACEHOLDERS pending the real figures — change UNIT_PRICES below.
   ========================================================================== */

const CURRENCY = { code: 'GBP', symbol: '£' };

/* PLACEHOLDER — awaiting real prices. */
const UNIT_PRICES = {
  'victa-portable': 299.00,
  'victa-mobile': 249.00
};

/* Every Phase 1 order is 100% discounted while the ordering flow is in beta,
   so nothing is ever charged. Phase 2 drops the discount and charges the real
   total, which is why this is applied per phase rather than globally. */
const BETA_DISCOUNT_RATE = 1;

/* PLACEHOLDER — invented, like UNIT_PRICES above, and not a tax calculation.

   A single flat rate per country is a deliberate simplification so the Phase 2
   totals have something to show. Real figures do not work this way: UK and
   Irish VAT are different rates, Australian and New Zealand GST are different
   rates again, US sales tax is set by state and depends on nexus rather than
   being a national rate at all, and an EU B2B supply may be reverse-charged to
   the customer instead. The checkout says on screen that these are indicative.

   `rate` applies to the subtotal plus shipping. `note` replaces the amount in
   the UI where a rate cannot honestly be given. */
const TAX_RATES = {
  'United Kingdom': { rate: 0.20, label: 'VAT (20%)' },
  'Ireland':        { rate: 0.23, label: 'VAT (23%)' },
  'Australia':      { rate: 0.10, label: 'GST (10%)' },
  'New Zealand':    { rate: 0.15, label: 'GST (15%)' },
  'United States':  { rate: 0,    label: 'Sales tax', note: 'Varies by state' }
};

/* PLACEHOLDER — invented. A flat charge per order, not per device, and not
   weight- or carrier-derived. */
const SHIPPING_RATES = {
  'United Kingdom':  9.99,
  'Ireland':        14.99,
  'Australia':      19.99,
  'New Zealand':    24.99,
  'United States':  19.99
};

function taxFor(country) {
  return TAX_RATES[country] || { rate: 0, label: 'Tax', note: 'Not calculated' };
}

function shippingFor(country) {
  const rate = SHIPPING_RATES[country];
  return rate === undefined ? 0 : rate;
}

const DEVICES = [
  {
    id: 'victa-portable',
    name: 'Victa Portable',
    image: 'assets/devices/victa/victa-portable.png',
    tagline: 'Easily accept payments anywhere and of any type, all on a single device.',
    intro: 'Be ready for every step of the customer journey with a variety of tools built into a single sleek device. Designed to go wherever your business takes you, Verifone Victa Portable gives you a powerful, easy-to-use solution for all your needs.',
    chips: ['Wi-Fi', '4G LTE', 'Bluetooth', 'Thermal printer', 'Barcode scanner'],
    specs: [
      ['Connectivity', 'Wi-Fi 2.4GHz + 5GHz, Bluetooth 5.0, 2G/3G/4G LTE, eSIM / SIM slot'],
      ['Payment types', 'Tap, chip and swipe; EMVCo approved contactless; major NFC schemes'],
      ['Receipts', 'NFC-enabled digital receipts and a built-in thermal printer (58mm x 30mm)'],
      ['Display', '6.7" colour LCD, 720x1600 HD, capacitive multitouch'],
      ['Battery', '5000-mAh Li-ion, over 12 hours of continuous use'],
      ['Security', 'PCI PTS 6.x compliant, supports PCI 7.x'],
      ['Size and weight', '205mm x 82mm x 58mm, 456g']
    ],
    accessories: ['Victa Portable', 'Charger'],
    useCases: 'In-store, on the go'
  },
  {
    id: 'victa-mobile',
    name: 'Victa Mobile',
    image: 'assets/devices/victa/victa-mobile.png',
    tagline: 'Personalize the in-store experience with checkout and operations — all in the palm of your hand.',
    intro: 'Quick, efficient transactions and agile operations build satisfaction and trust, turning shoppers into lifelong customers. Verifone Victa Mobile delivers a powerful, streamlined solution to engage customers wherever they are.',
    chips: ['Wi-Fi', '4G LTE', 'Bluetooth', 'Barcode scanner'],
    specs: [
      ['Connectivity', 'Wi-Fi 2.4GHz + 5GHz, Bluetooth 5.0, 2G/3G/4G LTE, eSIM / SIM slot'],
      ['Payment types', 'Tap, chip and swipe; EMVCo approved contactless; major NFC schemes'],
      ['Receipts', 'NFC-enabled digital receipts'],
      ['Display', '6.7" colour LCD, 720x1600 HD, capacitive multitouch'],
      ['Battery', '5000-mAh Li-ion, over 12 hours of continuous use'],
      ['Security', 'PCI PTS 6.x compliant, supports PCI 7.x'],
      ['Size and weight', '196.5mm x 82mm x 20mm, 363g']
    ],
    accessories: ['Victa Mobile', 'Charger'],
    useCases: 'In-store, on the go'
  }
].map(function (d) {
  d.price = UNIT_PRICES[d.id];
  return d;
});

/* Shipping destinations — the markets Xplor operates in. */
const COUNTRIES = ['Australia', 'New Zealand', 'United Kingdom', 'United States', 'Ireland'];

/* Stand-in for an authorised, tenant-scoped API response. No real merchant or
   customer data belongs in this file. */
const BUSINESSES = [
  {
    name: 'Clubessential',
    merchants: ['Clubessential', 'Clubessential Golf', 'CE Hospitality'],
    address: {
      company: 'Clubessential Holdings',
      line1: '18 Finsbury Circus',
      line2: '',
      city: 'London',
      region: '',
      postcode: 'EC2M 7EB',
      country: 'United Kingdom'
    }
  },
  {
    name: 'ForeUp',
    merchants: ['ForeUp', 'ForeUp Pro Shop'],
    address: {
      company: 'ForeUp Ltd',
      line1: '2 Bedford Square',
      line2: 'Floor 3',
      city: 'Manchester',
      region: '',
      postcode: 'M1 2EB',
      country: 'United Kingdom'
    }
  },
  {
    name: 'Vermont Systems',
    merchants: ['Vermont Systems', 'Vermont Rec'],
    address: {
      company: 'Vermont Systems Pty Ltd',
      line1: '120 Collins Street',
      line2: '',
      city: 'Melbourne',
      region: 'VIC',
      postcode: '3000',
      country: 'Australia'
    }
  }
];

function deviceById(id) {
  return DEVICES.filter(function (d) { return d.id === id; })[0];
}

function money(amount) {
  return CURRENCY.symbol + amount.toFixed(2);
}
