/* ==========================================================================
   SPATIAL PORTRAIT APPLICATION INITIALIZER
   Handles compact splash intro (<= 850ms), keyboard shortcuts (Arrows, M, Esc),
   and swipe-down-to-dismiss on the shared lightbox.
   ========================================================================== */
(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initPortraitSplash() {
    var splash = document.getElementById('p-splash');
    if (!splash) return;

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      splash.classList.add('is-done');
    }

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      dismiss();
      return;
    }

    if (typeof window.initPortraitSketchSplash === 'function') {
      window.initPortraitSketchSplash(dismiss);
      return;
    }

    splash.addEventListener('pointerdown', dismiss, { passive: true });
    window.setTimeout(dismiss, 850);
  }

  function initLightboxSwipeDismiss() {
    var box = document.getElementById('storyboard-lightbox');
    if (!box) return;
    var startY = 0;

    box.addEventListener('touchstart', function (e) {
      startY = (e.touches && e.touches.length === 1) ? e.touches[0].clientY : 0;
    }, { passive: true });

    box.addEventListener('touchend', function (e) {
      if (!startY || !e.changedTouches || e.changedTouches.length !== 1) return;
      if (e.changedTouches[0].clientY - startY > 90 && typeof window.closeStoryboardLightbox === 'function') {
        window.closeStoryboardLightbox();
      }
      startY = 0;
    }, { passive: true });
  }

  function initKeyboardNavigation() {
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (document.body.classList.contains('has-lightbox-open') && typeof window.closeStoryboardLightbox === 'function') {
          window.closeStoryboardLightbox();
          return;
        }
        if (document.getElementById('p-crm-reader-modal')?.classList.contains('is-open')) {
          window.closeIsolatedCrmReader && window.closeIsolatedCrmReader();
          return;
        }
        if (document.getElementById('p-atlas')?.classList.contains('is-open')) {
          window.closePortraitAtlas && window.closePortraitAtlas();
          return;
        }
        if (document.getElementById('p-bio-drawer')?.classList.contains('is-open')) {
          window.toggleHeroBioDrawer && window.toggleHeroBioDrawer(false);
          return;
        }
      }

      if (document.body.classList.contains('has-lightbox-open')) return;
      if (e.key === 'm' || e.key === 'M') {
        window.togglePortraitAtlas && window.togglePortraitAtlas();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        window.stepPortraitChapter && window.stepPortraitChapter(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        window.stepPortraitChapter && window.stepPortraitChapter(-1);
      }
    });
  }

  onReady(function () {
    initPortraitSplash();
    initLightboxSwipeDismiss();
    initKeyboardNavigation();
  });
})();
