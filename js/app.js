/* ==========================================================================
   Devices table — search, sort, filter, paginate, export.
   All data comes from js/data.js (synthetic); nothing leaves the browser.
   ========================================================================== */

/* Scoped, because this page now also loads js/order.js for the prototype
   settings bar and both files declare `state` and `esc`. Nothing outside
   this file referenced either, so an IIFE is enough to keep them apart. */
(function () {

const state = {
  search: '',
  sort: { key: 'business', dir: 'asc' },
  filters: { status: [], model: '', business: '' },
  page: 1,
  perPage: 50
};

const els = {
  body: document.getElementById('devices-body'),
  empty: document.getElementById('empty-state'),
  viewing: document.getElementById('viewing'),
  prev: document.getElementById('prev-btn'),
  next: document.getElementById('next-btn'),
  perPage: document.getElementById('per-page'),
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search-input'),
  filtersBtn: document.getElementById('filters-btn'),
  filtersPanel: document.getElementById('filters-panel'),
  filtersCount: document.getElementById('filters-count'),
  filterStatus: document.getElementById('filter-status'),
  filterModel: document.getElementById('filter-model'),
  filterBusiness: document.getElementById('filter-business'),
  filtersApply: document.getElementById('filters-apply'),
  filtersClear: document.getElementById('filters-clear'),
  exportBtn: document.getElementById('export-btn'),
  toast: document.getElementById('toast')
};

/* -------------------------------------------------------------------------
   Escaping — every value below is rendered through innerHTML, so anything
   that originates from data (or from what the user typed) is escaped here.
   ------------------------------------------------------------------------- */
function esc(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ---------- Derivation ---------- */

function visibleRows() {
  const q = state.search.trim().toLowerCase();
  const f = state.filters;

  let rows = DEVICE_ROWS.filter(function (d) {
    if (q && d.id.toLowerCase().indexOf(q) === -1 && d.deviceName.toLowerCase().indexOf(q) === -1) return false;
    if (f.status.length && f.status.indexOf(d.status) === -1) return false;
    if (f.model && d.model !== f.model) return false;
    if (f.business && d.business !== f.business) return false;
    return true;
  });

  const key = state.sort.key;
  const dir = state.sort.dir === 'asc' ? 1 : -1;

  rows.sort(function (a, b) {
    const x = a[key];
    const y = b[key];
    if (x instanceof Date) return (x - y) * dir;
    return String(x).localeCompare(String(y)) * dir;
  });

  return rows;
}

/* ---------- Rendering ---------- */

function renderRow(d) {
  const badge = STATUS_STYLE[d.status];
  const inset = d.modelInset ? d.modelInset + '%' : '0';

  return '' +
    '<tr>' +
      '<td class="dt__td"><button class="id-chip" type="button" data-id="' + esc(d.id) + '" title="' + esc(d.id) + '">ID</button></td>' +
      '<td class="dt__td">' + esc(d.business) + '</td>' +
      '<td class="dt__td">' + esc(d.merchant) + '</td>' +
      '<td class="dt__td">' + esc(d.deviceName) + '</td>' +
      '<td class="dt__td">' +
        '<span class="model">' +
          '<span class="model__photo">' +
            '<span style="position:absolute;inset:' + inset + ';border-radius:8px;overflow:hidden;">' +
              '<img src="' + esc(d.modelImg) + '" alt="" style="object-fit:' + esc(d.modelFit) + '">' +
            '</span>' +
          '</span>' +
          '<span class="model__name">' + esc(d.model) + '</span>' +
        '</span>' +
      '</td>' +
      '<td class="dt__td">' + esc(d.createdLabel) + '</td>' +
      '<td class="dt__td">' + esc(d.updatedLabel) + '</td>' +
      '<td class="dt__td">' +
        '<span class="badge ' + badge.cls + '"><img src="' + badge.dot + '" alt="">' + esc(d.status) + '</span>' +
      '</td>' +
    '</tr>';
}

function renderSortIcons() {
  document.querySelectorAll('.dt__th--sortable').forEach(function (th) {
    const key = th.dataset.sort;
    const label = th.dataset.label || th.textContent.trim();
    th.dataset.label = label;

    const icon = key === state.sort.key
      ? '<img class="dt__sort-icon' + (state.sort.dir === 'asc' ? ' dt__sort-icon--asc' : '') + '" src="assets/icons/arrow-down.svg" alt="">'
      : '';

    th.innerHTML = '<span class="dt__th-inner">' + esc(label) + icon + '</span>';
    th.setAttribute('aria-sort', key === state.sort.key ? (state.sort.dir === 'asc' ? 'ascending' : 'descending') : 'none');
  });
}

function render() {
  const rows = visibleRows();
  const pages = Math.max(1, Math.ceil(rows.length / state.perPage));
  if (state.page > pages) state.page = pages;

  const from = (state.page - 1) * state.perPage;
  const slice = rows.slice(from, from + state.perPage);

  els.body.innerHTML = slice.map(renderRow).join('');
  els.empty.hidden = rows.length !== 0;

  els.viewing.textContent = rows.length
    ? 'Viewing ' + (from + 1) + ' - ' + (from + slice.length)
    : 'Viewing 0 - 0';

  els.prev.disabled = state.page <= 1;
  els.next.disabled = state.page >= pages;

  renderSortIcons();
}

/* ---------- Filters ---------- */

function buildFilterOptions() {
  els.filterStatus.innerHTML = STATUSES.map(function (s) {
    return '<label><input type="checkbox" value="' + esc(s) + '">' + esc(s) + '</label>';
  }).join('');

  MODELS.forEach(function (m) {
    els.filterModel.insertAdjacentHTML('beforeend', '<option value="' + esc(m.name) + '">' + esc(m.name) + '</option>');
  });

  DEVICE_BUSINESSES.forEach(function (b) {
    els.filterBusiness.insertAdjacentHTML('beforeend', '<option value="' + esc(b.name) + '">' + esc(b.name) + '</option>');
  });
}

function activeFilterCount() {
  return state.filters.status.length + (state.filters.model ? 1 : 0) + (state.filters.business ? 1 : 0);
}

function syncFilterBadge() {
  const n = activeFilterCount();
  els.filtersCount.hidden = n === 0;
  els.filtersCount.textContent = n;
}

function openFilters(open) {
  els.filtersPanel.hidden = !open;
  els.filtersBtn.setAttribute('aria-expanded', String(open));
}

/* ---------- Export ---------- */

function toCsvCell(value) {
  const s = String(value);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function exportCsv() {
  const rows = visibleRows();
  const header = ['ID', 'Business Name', 'Merchant Name', 'Device Name', 'Model', 'Created At', 'Updated At', 'Status'];
  const lines = [header.join(',')].concat(rows.map(function (d) {
    return [d.id, d.business, d.merchant, d.deviceName, d.model, d.createdLabel, d.updatedLabel, d.status]
      .map(toCsvCell).join(',');
  }));

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'devices.csv';
  a.click();
  URL.revokeObjectURL(url);

  toast(rows.length + ' device' + (rows.length === 1 ? '' : 's') + ' exported');
}

/* ---------- Toast ---------- */

let toastTimer;
function toast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { els.toast.hidden = true; }, 2400);
}

/* ---------- Wiring ---------- */

document.querySelectorAll('.dt__th--sortable').forEach(function (th) {
  th.addEventListener('click', function () {
    const key = th.dataset.sort;
    if (state.sort.key === key) {
      state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sort.key = key;
      state.sort.dir = 'asc';
    }
    state.page = 1;
    render();
  });
});

els.searchForm.addEventListener('submit', function (e) { e.preventDefault(); });

els.searchInput.addEventListener('input', function () {
  state.search = els.searchInput.value;
  state.page = 1;
  render();
});

els.filtersBtn.addEventListener('click', function () {
  openFilters(els.filtersPanel.hidden);
});

document.addEventListener('click', function (e) {
  if (!els.filtersPanel.hidden && !e.target.closest('.filter-wrap')) openFilters(false);
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') openFilters(false);
});

els.filtersApply.addEventListener('click', function () {
  state.filters.status = Array.prototype.map.call(
    els.filterStatus.querySelectorAll('input:checked'), function (i) { return i.value; }
  );
  state.filters.model = els.filterModel.value;
  state.filters.business = els.filterBusiness.value;
  state.page = 1;
  syncFilterBadge();
  openFilters(false);
  render();
});

els.filtersClear.addEventListener('click', function () {
  els.filterStatus.querySelectorAll('input').forEach(function (i) { i.checked = false; });
  els.filterModel.value = '';
  els.filterBusiness.value = '';
  state.filters = { status: [], model: '', business: '' };
  state.page = 1;
  syncFilterBadge();
  render();
});

els.perPage.addEventListener('change', function () {
  state.perPage = Number(els.perPage.value);
  state.page = 1;
  render();
});

els.prev.addEventListener('click', function () { state.page--; render(); });
els.next.addEventListener('click', function () { state.page++; render(); });

els.exportBtn.addEventListener('click', exportCsv);

/* The ID chip copies the device id, the way the live portal does. */
els.body.addEventListener('click', function (e) {
  const chip = e.target.closest('.id-chip');
  if (!chip) return;
  const id = chip.dataset.id;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(id).then(
      function () { toast('Copied ' + id); },
      function () { toast(id); }
    );
  } else {
    toast(id);
  }
});

buildFilterOptions();
syncFilterBadge();
render();
})();
