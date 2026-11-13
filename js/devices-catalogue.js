/* ==========================================================================
   Device catalogue, regions and money.

   The prototype sells into two regions and they do not overlap: the United
   States gets the two Verifone Victa devices in USD, Canada gets the two
   Ingenico devices in CAD. A device belongs to exactly one region, which is
   why its price needs no currency of its own — the region supplies it.

   Victa renders, headlines, intros and specs come from the Verifone Victa
   datasheets bundled with the victa-devices-datasheets skill. The Link/2500
   and Lane/3600 come from the Ingenico datasheets the user supplied. Hardware
   facts belong to those manufacturers and must not be edited here. Where a
   value could not be read out of a datasheet it is left out rather than
   guessed — see the notes on each device.

   UNIT_PRICES are the user's own figures. Shipping and tax are invented; see
   the notes on each.
   ========================================================================== */

/* The region replaces the old per-country delivery destination. It decides
   three things at once — which devices are on offer, which currency they are
   priced in, and what the shipping address looks like — so it is the one
   setting a reviewer changes in the prototype bar.

   `tax.rate` applies to the subtotal plus shipping. `tax.note` replaces the
   amount in the UI where a rate cannot honestly be given, which is why the
   United States shows wording rather than a figure.

   PLACEHOLDER, both of them: `shipping` is a flat invented charge per order,
   not per device and not carrier-derived, and the tax treatment is a
   simplification rather than a calculation. US sales tax is set by state and
   turns on nexus, so no national rate exists to show. Canadian GST at 5% is
   federal and does apply everywhere, but provincial PST, and the provinces on
   HST, add more on top and are not modelled. The checkout says on screen that
   the rates are indicative. */
const REGIONS = {
  US: {
    code: 'US',
    label: 'United States',
    country: 'United States',
    currency: { code: 'USD', symbol: '$' },
    shipping: 19.99,
    tax: { rate: 0, label: 'Sales tax', note: 'Varies by state' },
    /* What the shipping address calls its two variable fields, and the list
       behind the subdivision picker. */
    subdivisionLabel: 'State',
    postcodeLabel: 'ZIP code',
    postcodePlaceholder: '94107',
    subdivisions: [
      ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
      ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
      ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'],
      ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
      ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
      ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
      ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'],
      ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'],
      ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'],
      ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
      ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'],
      ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
      ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']
    ]
  },
  CA: {
    code: 'CA',
    label: 'Canada',
    country: 'Canada',
    currency: { code: 'CAD', symbol: '$' },
    shipping: 24.99,
    tax: { rate: 0.05, label: 'GST (5%)', note: null },
    subdivisionLabel: 'Province',
    postcodeLabel: 'Postal code',
    postcodePlaceholder: 'M5V 2T6',
    subdivisions: [
      ['AB', 'Alberta'], ['BC', 'British Columbia'], ['MB', 'Manitoba'],
      ['NB', 'New Brunswick'], ['NL', 'Newfoundland and Labrador'],
      ['NT', 'Northwest Territories'], ['NS', 'Nova Scotia'], ['NU', 'Nunavut'],
      ['ON', 'Ontario'], ['PE', 'Prince Edward Island'], ['QC', 'Quebec'],
      ['SK', 'Saskatchewan'], ['YT', 'Yukon']
    ]
  }
};

const REGION_CODES = ['US', 'CA'];

/* Everything that formats money or prices an order goes through here, so an
   unknown code can never leave a page half-rendered. */
function regionOf(code) {
  return REGIONS[code] || REGIONS.US;
}

/* The region currently being ordered in. js/order.js owns `state` and loads
   after this file, so the guard covers the window before it exists — and the
   Devices page, which loads this file for the prototype bar alone. */
function currentRegionCode() {
  return typeof state !== 'undefined' && state.region ? state.region : 'US';
}

/* Supplied by the user. Each price is in its own region's currency: the two
   Victa devices in USD, the two Ingenico devices in CAD. */
const UNIT_PRICES = {
  'victa-portable': 522.17,
  'victa-mobile': 549.63,
  'link-2500-le': 400,
  'lane-3600': 400
};

/* Every Phase 1 order is 100% discounted while the ordering flow is in beta,
   so nothing is ever charged. Phase 2 drops the discount and charges the real
   total, which is why this is applied per phase rather than globally. */
const BETA_DISCOUNT_RATE = 1;

function taxFor(regionCode) {
  return regionOf(regionCode).tax;
}

function shippingFor(regionCode) {
  return regionOf(regionCode).shipping;
}

const DEVICES = [
  {
    id: 'victa-portable',
    region: 'US',
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
    region: 'US',
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
  },
  {
    /* Ingenico Link/2500 Companion LE. Specs are from the supplied datasheet,
       which gives four columns — Slim and Standard, two each — without saying
       which the LE is. Size, weight and battery are therefore given as the
       range the datasheet covers rather than pinned to one column. */
    id: 'link-2500-le',
    region: 'CA',
    name: 'Link 2500 LE',
    image: 'assets/devices/ingenico/link-2500-le.webp',
    /* The render is a product shot on white rather than a cut-out, so it is
       multiplied onto the sunken image box — see css/order.css. */
    imageOnWhite: true,
    tagline: 'Your smart, sleek and simple payments solution.',
    intro: 'Link/2500 brings payment acceptance to any mobile business. Pocket-sized, light and robust, it makes a complete acceptance point wherever the sale happens, with Bluetooth and Wi-Fi, improved power management and support for multiple alternative payment methods.',
    chips: ['Wi-Fi', 'Bluetooth', 'Contactless', 'Chip & PIN', 'Magstripe'],
    specs: [
      ['Operating system', 'Telium TETRA'],
      ['Memory', '256 MB RAM / 256 MB Flash'],
      ['Card readers', 'Contactless (ISO 14443), smart card (EMV Level 1, 50K lifespan), magstripe (ISO 1/2/3, 100K lifespan)'],
      ['Display', '2.4" colour display, backlit, QVGA (240x320 pixels)'],
      ['Keypad', 'Mechanical, 20 keys, raised marking'],
      ['Connectivity', 'Bluetooth, Wi-Fi (dual band), LAN, Apple IAP chip'],
      ['Connections', 'USB Type-C, host and slave (3K insertions)'],
      ['Battery', 'Li-ion, 600–1200 mAh depending on model (1200 mAh removable)'],
      ['Security', 'PCI PTS 6.x online'],
      ['Size and weight', '129 x 70 x 13–17 mm (5.07 x 2.75 x 0.51–0.67"), 120–155 g']
    ],
    accessories: ['Link 2500 LE', 'USB A to USB C cable (1.5m)'],
    useCases: 'In-store, on the go'
  },
  {
    /* Ingenico Lane/3600. The supplied datasheet's specification table is set
       in a subset-embedded font that could not be read on this machine, so the
       rows below come from the parts of the datasheet that did read — the
       feature copy. Display size, dimensions, weight, connectivity and the
       in-box contents are missing rather than guessed; see HANDOVER.md. */
    id: 'lane-3600',
    region: 'CA',
    name: 'Lane 3600',
    image: 'assets/devices/ingenico/lane-3600.webp',
    imageOnWhite: true,
    tagline: 'Fast, secure and compact PIN pad solution.',
    intro: 'A compact PIN pad built for easy self-checkout and for semi-attended kiosks. Lane/3600 accepts every payment method through a single, easy-to-identify contactless zone, and its optimised dimensions and adaptation plate make it straightforward to integrate.',
    chips: ['Contactless', 'Chip & PIN', 'Magstripe', 'QR code reader'],
    specs: [
      ['Processor', 'High speed Cortex A7'],
      ['Memory', 'Up to 512 MB RAM / 256 MB Flash'],
      ['Payment types', 'All payment methods, through one easy-to-identify contactless reader with an extended contactless zone'],
      ['Camera', 'Fully integrated 0.3 MP rear camera, with fast QR code reading'],
      ['Display', 'Glass lens, with high-performance card and swipe insertion'],
      ['Security', 'PCI PTS v6, detection of abnormal cable removal, secured lock receptacle'],
      ['Integration', 'Optimised dimensions and adaptation plate for semi-attended kiosks']
    ],
    accessories: ['Lane 3600'],
    useCases: 'Counter, self-checkout'
  }
].map(function (d) {
  d.price = UNIT_PRICES[d.id];
  return d;
});

/* The catalogue and the cart only ever see one region's devices. deviceById()
   deliberately searches all of them, so a device on an order placed in the
   other region still resolves when that order is rendered. */
function devicesForRegion(regionCode) {
  const code = regionOf(regionCode).code;
  return DEVICES.filter(function (d) { return d.region === code; });
}

/* Stand-in for an authorised, tenant-scoped API response. No real merchant or
   customer data belongs in this file — every business, address and postcode
   below is invented. Each business has one address per region, because the
   region is the delivery destination and an address has to match it. */
const BUSINESSES = [
  {
    name: 'Clubessential',
    merchants: ['Clubessential', 'Clubessential Golf', 'CE Hospitality'],
    addresses: {
      US: {
        company: 'Clubessential Holdings',
        line1: '2200 Market Street',
        line2: 'Suite 900',
        city: 'Cincinnati',
        region: 'OH',
        postcode: '45202',
        country: 'United States'
      },
      CA: {
        company: 'Clubessential Holdings Canada',
        line1: '150 King Street West',
        line2: 'Suite 2100',
        city: 'Toronto',
        region: 'ON',
        postcode: 'M5H 1J9',
        country: 'Canada'
      }
    }
  },
  {
    name: 'ForeUp',
    merchants: ['ForeUp', 'ForeUp Pro Shop'],
    addresses: {
      US: {
        company: 'ForeUp Inc',
        line1: '1200 Riverside Drive',
        line2: 'Floor 3',
        city: 'Provo',
        region: 'UT',
        postcode: '84604',
        country: 'United States'
      },
      CA: {
        company: 'ForeUp Canada Inc',
        line1: '1055 West Georgia Street',
        line2: '',
        city: 'Vancouver',
        region: 'BC',
        postcode: 'V6E 3P3',
        country: 'Canada'
      }
    }
  },
  {
    name: 'Vermont Systems',
    merchants: ['Vermont Systems', 'Vermont Rec'],
    addresses: {
      US: {
        company: 'Vermont Systems Inc',
        line1: '12 Market Place',
        line2: '',
        city: 'Essex Junction',
        region: 'VT',
        postcode: '05452',
        country: 'United States'
      },
      CA: {
        company: 'Vermont Systems Canada Inc',
        line1: '275 Portage Avenue',
        line2: '',
        city: 'Winnipeg',
        region: 'MB',
        postcode: 'R3B 2B3',
        country: 'Canada'
      }
    }
  }
];

function deviceById(id) {
  return DEVICES.filter(function (d) { return d.id === id; })[0];
}

/* Every amount on every screen formats through here, so the ISO code the user
   asked for lands everywhere at once: $522.17 USD, $400.00 CAD.

   `regionCode` is optional and exists for records rather than for live state:
   an order carries the region it was placed in, so an order placed in one
   region still shows its own currency after the prototype is switched to the
   other. Orders saved before regions existed have no region and fall back to
   the current one, exactly as they did before. */
function money(amount, regionCode) {
  const currency = regionOf(regionCode || currentRegionCode()).currency;
  return currency.symbol + amount.toFixed(2) + ' ' + currency.code;
}
