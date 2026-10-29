/* ==========================================================================
   Mock data for the Devices prototype.
   Everything here is synthetic. No real merchant, customer or payment data
   belongs in this file.
   ========================================================================== */

/* Model catalogue. The `fit` / `inset` values reproduce how each photo is
   cropped inside its 40px tile in the Figma frame. */
const MODELS = [
  { name: 'US Moby 5500',       img: 'assets/devices/us-moby-5500.png',       fit: 'contain', inset: 0 },
  { name: 'Verifone MX915',     img: 'assets/devices/verifone-mx915.png',     fit: 'cover',   inset: 10 },
  { name: 'Ingenico IPP320',    img: 'assets/devices/ingenico-ipp320.png',    fit: 'cover',   inset: 5 },
  { name: 'Ingenico ISMP4',     img: 'assets/devices/ingenico-ismp4.png',     fit: 'contain', inset: 12.5 },
  { name: 'Ingenico Lane 7000', img: 'assets/devices/ingenico-lane-7000.png', fit: 'cover',   inset: 7.5 },
  { name: 'Ingenico Move 5000', img: 'assets/devices/ingenico-move-5000.png', fit: 'contain', inset: 7.5 },
  { name: 'Ingenico Lane 3000', img: 'assets/devices/ingenico-lane-3000.png', fit: 'cover',   inset: 0 },
  { name: 'Ingenico Link 2500', img: 'assets/devices/ingenico-link-2500.png', fit: 'contain', inset: 7.5 },
  { name: 'Ingenico Lane 3600', img: 'assets/devices/ingenico-lane-3600.png', fit: 'cover',   inset: 0 }
];

const STATUSES = ['Activated', 'Sent', 'Pending', 'Deactivated', 'Failed'];

const STATUS_STYLE = {
  Activated:   { cls: 'badge--activated',   dot: 'assets/icons/dot-success.svg' },
  Sent:        { cls: 'badge--sent',        dot: 'assets/icons/dot-success.svg' },
  Pending:     { cls: 'badge--pending',     dot: 'assets/icons/dot-warning.svg' },
  Deactivated: { cls: 'badge--deactivated', dot: 'assets/icons/dot-gray.svg' },
  Failed:      { cls: 'badge--failed',      dot: 'assets/icons/dot-error.svg' }
};

const DEVICE_BUSINESSES = [
  { name: 'Clubessential',   merchants: ['Clubessential', 'Clubessential Golf', 'CE Hospitality'] },
  { name: 'ClubReady',       merchants: ['ClubReady', 'ClubReady Studios'] },
  { name: 'ForeUp',          merchants: ['ForeUp', 'ForeUp Pro Shop'] },
  { name: 'PrestoSports',    merchants: ['PrestoSports'] },
  { name: 'VAP Integration', merchants: ['VAP Integration', 'VAP Events'] },
  { name: 'Vermont Systems', merchants: ['Vermont Systems', 'Vermont Rec'] }
];

const DEVICE_NAMES = [
  'Front Desk 1', 'Front Desk 2', 'Pro Shop', 'Bar Terminal', 'Poolside',
  'Member Services', 'Tennis Hut', 'Halfway House', 'Event Kiosk', 'Test Device',
  'Spa Reception', 'Golf Cart 4', 'Snack Bar', 'Back Office'
];

/* Deterministic PRNG so the table is identical on every reload. */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HEX = '0123456789abcdef';

function makeId(rand) {
  let s = '';
  for (let i = 0; i < 12; i++) s += HEX[Math.floor(rand() * 16)];
  return 'pdv_' + s;
}

function formatDate(d) {
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return date + ' ' + time;
}

function pick(rand, arr) { return arr[Math.floor(rand() * arr.length)]; }

/* Weighted so the table reads like a real fleet: mostly activated/sent. */
function pickStatus(rand) {
  const r = rand();
  if (r < 0.42) return 'Activated';
  if (r < 0.70) return 'Sent';
  if (r < 0.84) return 'Pending';
  if (r < 0.94) return 'Deactivated';
  return 'Failed';
}

function buildDevices(count) {
  const rand = mulberry32(20261028);
  const start = Date.UTC(2024, 1, 13, 15, 43);
  const end = Date.UTC(2026, 9, 5, 17, 3);
  const rows = [];

  for (let i = 0; i < count; i++) {
    const business = pick(rand, DEVICE_BUSINESSES);
    const created = new Date(start + rand() * (end - start));
    // Updated lands between a minute and ~40 days after creation.
    const updated = new Date(created.getTime() + 60000 + rand() * 3.5e9);
    const model = pick(rand, MODELS);

    rows.push({
      id: makeId(rand),
      business: business.name,
      merchant: pick(rand, business.merchants),
      deviceName: pick(rand, DEVICE_NAMES),
      model: model.name,
      modelImg: model.img,
      modelFit: model.fit,
      modelInset: model.inset,
      createdAt: created,
      updatedAt: updated,
      createdLabel: formatDate(created),
      updatedLabel: formatDate(updated),
      status: pickStatus(rand)
    });
  }

  return rows;
}

const DEVICE_ROWS = buildDevices(137);
