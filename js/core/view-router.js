/**
 * ATELIER SINGLE-PAGE VIEWPORT & ORIENTATION ROUTER
 * Synchronously resolves 'portrait' vs 'landscape' inside index.html before CSS/DOM mount.
 * Zero redirect to external HTML files — works identically on GitHub Pages HTTP(S) and file:///.
 */
(function () {
  var STORAGE_KEY = 'atelier_view_override';
  var RESIZE_DEBOUNCE_MS = 180;

  function readOverride() {
    try {
      var val = window.sessionStorage.getItem(STORAGE_KEY);
      return (val === 'portrait' || val === 'landscape') ? val : null;
    } catch (_) {
      return null;
    }
  }

  function writeOverride(val) {
    try {
      if (val === 'portrait' || val === 'landscape') {
        window.sessionStorage.setItem(STORAGE_KEY, val);
      } else {
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) { /* ignore storage restrictions */ }
  }

  function readQueryView() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var q = params.get('view');
      if (q === 'portrait' || q === 'landscape' || q === 'auto') return q;
    } catch (_) { /* ignore */ }
    return null;
  }

  function detectNaturalView() {
    var w = window.innerWidth || document.documentElement.clientWidth || 1280;
    var h = window.innerHeight || document.documentElement.clientHeight || 800;
    return h > w ? 'portrait' : 'landscape';
  }

  function resolveInitialView() {
    var queryView = readQueryView();
    if (queryView === 'auto') {
      writeOverride(null);
      return detectNaturalView();
    }
    if (queryView === 'portrait' || queryView === 'landscape') {
      writeOverride(queryView);
      return queryView;
    }
    var stored = readOverride();
    if (stored) return stored;
    return detectNaturalView();
  }

  // Redirect legacy /portrait.html URLs silently onto index.html if bookmarked
  try {
    if (/portrait\.html$/i.test(window.location.pathname || '')) {
      var unifiedPath = window.location.pathname.replace(/portrait\.html$/i, 'index.html');
      window.location.replace(unifiedPath + '?view=portrait' + (window.location.hash || ''));
      return;
    }
  } catch (_) { /* ignore */ }

  var activeView = resolveInitialView();
  window.__ATELIER_VIEW__ = activeView;

  var root = document.documentElement;
  root.setAttribute('data-atelier-view', activeView);
  if (activeView === 'portrait') {
    root.classList.add('p-spatial-html');
  } else {
    root.classList.remove('p-spatial-html');
  }

  /**
   * Synchronously disables <link data-view-css="..."> tags belonging to the inactive mode
   * so landscape and portrait stylesheets never cascade into one another.
   */
  window.__applyAtelierCssGate = function () {
    var targetView = window.__ATELIER_VIEW__ || 'landscape';
    var links = document.querySelectorAll('link[data-view-css]');
    for (var i = 0; i < links.length; i++) {
      var mode = links[i].getAttribute('data-view-css');
      links[i].disabled = (mode !== targetView);
    }
  };

  /**
   * Programmatic switcher between 'portrait', 'landscape', and 'auto' on the same URL.
   */
  window.switchAtelierView = function (mode, hashOverride) {
    var targetHash = typeof hashOverride === 'string'
      ? (hashOverride && hashOverride.charAt(0) !== '#' ? '#' + hashOverride : hashOverride)
      : (window.location.hash || '');

    if (mode === 'auto') {
      writeOverride(null);
    } else if (mode === 'portrait' || mode === 'landscape') {
      writeOverride(mode);
    } else {
      return;
    }

    var params;
    try {
      params = new URLSearchParams(window.location.search || '');
    } catch (_) {
      params = null;
    }

    var queryStr = '';
    if (params) {
      if (mode === 'auto') {
        params.delete('view');
      } else {
        params.set('view', mode);
      }
      var serialized = params.toString();
      if (serialized) queryStr = '?' + serialized;
    } else if (mode !== 'auto') {
      queryStr = '?view=' + encodeURIComponent(mode);
    }

    var nextUrl = (window.location.pathname || 'index.html') + queryStr + targetHash;
    if (nextUrl === window.location.pathname + window.location.search + window.location.hash) {
      window.location.reload();
    } else {
      window.location.assign(nextUrl);
    }
  };

  function maybeReloadOnViewportFlip() {
    // Do not auto-flip while user has explicitly locked a mode via ?view= or sessionStorage
    var q = readQueryView();
    if (q === 'portrait' || q === 'landscape') return;
    if (readOverride()) return;

    var nextView = detectNaturalView();
    if (nextView !== window.__ATELIER_VIEW__) {
      window.location.reload();
    }
  }

  var resizeTimer = null;
  function scheduleFlipCheck() {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(maybeReloadOnViewportFlip, RESIZE_DEBOUNCE_MS);
  }

  window.addEventListener('resize', scheduleFlipCheck, { passive: true });
  window.addEventListener('orientationchange', scheduleFlipCheck, { passive: true });
  window.addEventListener('pageshow', maybeReloadOnViewportFlip);
})();
