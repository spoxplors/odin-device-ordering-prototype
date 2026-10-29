/* ==========================================================================
   Prototype settings bar.

   States that the real Odin would read off the merchant's account — which
   launch phase is live, whether the merchant is a government entity — have
   nowhere to come from in a static prototype. This bar lets whoever is
   reviewing set them directly.

   It is deliberately not Odin chrome and not Atlas: see the note at the top of
   css/prototype-bar.css. It sits above the Odin app bar so it reads as
   scaffolding around the product rather than part of it.

   Loaded after js/order.js on every page of the prototype except
   index.html, which is the way in rather than a screen inside it.
   That includes devices.html, the Odin Devices page, which loads js/order.js
   solely to give this bar the state it reads and writes.
   ========================================================================== */

(function () {
  const PHASES = [
    { value: '1', label: 'Phase 1 · Ordering form' },
    { value: '2', label: 'Phase 2 · Payment added' }
  ];

  const MODES = [
    { value: 'merchant', label: 'Merchant' },
    { value: 'ops', label: 'Internal ops' }
  ];

  const MERCHANT_TYPES = [
    { value: 'standard', label: 'Standard merchant' },
    { value: 'government', label: 'Government entity' }
  ];

  function options(list, selected) {
    return list.map(function (o) {
      return '<option value="' + esc(o.value) + '"' +
        (String(o.value) === String(selected) ? ' selected' : '') + '>' + esc(o.label) + '</option>';
    }).join('');
  }

  function group(id, label, list, selected, disabled, note) {
    return '<span class="proto-bar__group">' +
      '<label class="proto-bar__label" for="' + id + '">' + esc(label) + '</label>' +
      '<select id="' + id + '"' + (disabled ? ' disabled' : '') + '>' + options(list, selected) + '</select>' +
      (note ? '<span class="proto-bar__note">' + esc(note) + '</span>' : '') +
    '</span>';
  }

  /* The bar owns the setting from here on, so the ?phase= that opened the page
     is dropped — left in place it would undo the next change on any reload. */
  function reloadWithoutPhase() {
    const url = new URL(location.href);
    url.searchParams.delete('phase');
    location.replace(url.toString());
  }

  function render() {
    const bar = document.createElement('div');
    bar.className = 'proto-bar';
    /* Scaffolding, not page content: it is not part of the document outline. */
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Prototype settings');

    const phase1 = !isPhase2();

    bar.innerHTML =
      '<span class="proto-bar__brand"><span class="proto-bar__dot"></span>Prototype settings</span>' +
      group('proto-phase', 'Phase', PHASES, state.phase, false) +
      group('proto-mode', 'Ordering as', MODES, state.mode, false) +
      group('proto-merchant-type', 'Merchant type', MERCHANT_TYPES, state.merchantType, phase1,
            phase1 ? 'Phase 2 only' : '') +
      '<span class="proto-bar__spacer"></span>' +
      '<button class="proto-bar__reset" type="button" id="proto-reset">Reset prototype</button>';

    document.body.insertBefore(bar, document.body.firstChild);
    document.body.classList.add('has-proto-bar');

    bar.querySelector('#proto-phase').addEventListener('change', function () {
      state.phase = Number(this.value);
      commit();
      reloadWithoutPhase();
    });

    bar.querySelector('#proto-mode').addEventListener('change', function () {
      state.mode = this.value;
      /* Same rule the checkout applied when this control lived there: ops has
         to choose a merchant deliberately, so the inherited one is cleared. */
      state.merchant = this.value === 'ops' ? '' : businessByName(state.business).merchants[0];
      commit();
      reloadWithoutPhase();
    });

    bar.querySelector('#proto-merchant-type').addEventListener('change', function () {
      state.merchantType = this.value;
      commit();
      reloadWithoutPhase();
    });

    bar.querySelector('#proto-reset').addEventListener('click', function () {
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* nothing to clear */ }
      location.replace(location.pathname);
    });
  }

  render();
})();
