/* ==========================================================================
   The Odin application shell — app bar and sidebar.

   The device ordering flow is not a full page: it renders inside the Odin
   content area, so every page in the flow needs this chrome. Rendering it from
   one place keeps the nav from drifting between the Devices list and the flow.

   renderShell(activeKey) writes the shell into the document and returns the
   <main class="content"> element for the page to fill.
   ========================================================================== */

function renderShell(activeKey) {
  const mount = document.getElementById('shell-root');

  mount.innerHTML =
    '<header class="appbar">' +
      '<div class="appbar__left">' +
        '<div class="entity-switcher">' +
          '<div class="entity-switcher__logo">' +
            '<img src="assets/brand/logomark.png" alt="Odin" width="39" height="40">' +
          '</div>' +
          '<div class="entity-switcher__label">' +
            '<span class="entity-switcher__kicker">Entity</span>' +
            '<span class="entity-switcher__name">Holding Co</span>' +
          '</div>' +
          '<button class="icon-btn" type="button" aria-label="Switch entity">' +
            '<img src="assets/icons/chevron-selector-vertical.svg" alt="" width="20" height="20">' +
          '</button>' +
        '</div>' +
      '</div>' +

      '<div class="appbar__middle">' +
        '<form class="search" id="search-form" role="search">' +
          '<div class="search__field">' +
            '<img src="assets/icons/search.svg" alt="" width="16" height="16">' +
            '<input id="search-input" type="search" placeholder="Search an ID" aria-label="Search an ID" autocomplete="off">' +
          '</div>' +
          '<div class="search__action">' +
            '<button class="search__btn" type="submit" aria-label="Search">' +
              '<img src="assets/icons/search-white.svg" alt="" width="16" height="16">' +
            '</button>' +
          '</div>' +
        '</form>' +
      '</div>' +

      '<div class="appbar__right">' +
        '<button class="user-chip" type="button" aria-label="Account menu">' +
          '<span class="avatar">' +
            '<img src="assets/brand/avatar.png" alt="" width="36" height="36">' +
            '<span class="avatar__initials">MS</span>' +
          '</span>' +
          '<img src="assets/icons/chevron-down-20.svg" alt="" width="20" height="20">' +
        '</button>' +
      '</div>' +
    '</header>' +

    '<div class="shell">' +
      '<nav class="sidebar" aria-label="Main">' +
        '<div class="sidebar__inner">' +
          '<div class="sidebar__collapse">' +
            '<button class="collapse-btn" type="button" aria-label="Collapse menu">' +
              '<img src="assets/icons/chevrons-left.svg" alt="" width="12" height="12">' +
            '</button>' +
          '</div>' +
          NAV_GROUPS.map(function (group) { return navGroup(group, activeKey); }).join(
            '<img class="nav-divider" src="assets/icons/nav-divider.svg" alt="">') +
        '</div>' +
      '</nav>' +
      '<main class="content" id="content"></main>' +
    '</div>';

  return document.getElementById('content');
}

const NAV_GROUPS = [
  { items: [{ key: 'merchants', label: 'Merchants', icon: 'building-04.svg' }] },
  { title: 'Transactions', items: [
    { key: 'transactions', label: 'Transactions', icon: 'transactions.svg' },
    { key: 'payment-intents', label: 'Payment Intents', icon: 'coins-stacked-01.svg' },
    { key: 'charges', label: 'Charges', icon: 'coins-stacked-02.svg' },
    { key: 'disputes', label: 'Disputes', icon: 'shield.svg' }
  ] },
  { title: 'Payouts', items: [
    { key: 'payout-merchant', label: 'Merchant', icon: 'building-04.svg' },
    { key: 'fee', label: 'Fee', icon: 'percent.svg' },
    { key: 'division', label: 'Division', icon: 'building-01.svg' },
    { key: 'transfers', label: 'Transfers', icon: 'coins-swap-02.svg' },
    { key: 'reversals', label: 'Reversals', icon: null }
  ] },
  { title: 'Reports', items: [
    { key: 'exports', label: 'Exports', icon: 'file-download.svg' },
    { key: 'statements', label: 'Statements', icon: 'statement.svg' }
  ] },
  { title: 'Devices', items: [
    { key: 'device-list', label: 'Device list', icon: 'payment-device.svg', href: 'devices.html' },
    { key: 'orders', label: 'Orders', icon: 'payment-device.svg', href: 'orders.html' }
  ] }
];

/* Reversals has no counterpart in the Figma frame; drawn to match the
   Untitled UI stroke set the rest of the sidebar uses. */
const REVERSALS_ICON =
  '<svg class="nav-item__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">' +
    '<path d="M2.5 3.33v5h5M17.5 16.67v-5h-5M15.41 7.5A5.83 5.83 0 0 0 4.1 8.33M4.59 12.5a5.83 5.83 0 0 0 11.31-.83" ' +
          'stroke="#667085" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';

function navGroup(group, activeKey) {
  return '<ul class="nav-group">' +
    (group.title ? '<li class="nav-group__title">' + group.title + '</li>' : '') +
    group.items.map(function (item) {
      const active = item.key === activeKey;
      const icon = item.icon
        ? '<img src="assets/icons/' + item.icon + '" alt="" width="20" height="20">'
        : REVERSALS_ICON;
      return '<li><a class="nav-item' + (active ? ' is-active' : '') + '" href="' + (item.href || '#') + '"' +
        (active ? ' aria-current="page"' : '') + '>' + icon + '<span>' + item.label + '</span></a></li>';
    }).join('') +
  '</ul>';
}
