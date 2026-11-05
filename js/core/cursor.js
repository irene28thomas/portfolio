// =========================================================
// CURSOR SPOTLIGHT & MAGNETIC BADGE
// =========================================================
// =========================================================
(function initCursorInteraction() {
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let currentX = mouseX, currentY = mouseY;
  const spotlight = document.getElementById('ambient-cursor-spotlight');
  const badge = document.getElementById('magnetic-cursor-badge');

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  let badgeX = mouseX, badgeY = mouseY;

  // Unified single-RAF loop with idle thresholding & translate3d
  function loopCursor() {
    const diffX = mouseX - currentX;
    const diffY = mouseY - currentY;

    if (Math.abs(diffX) > 0.08 || Math.abs(diffY) > 0.08) {
      currentX += diffX * 0.1;
      currentY += diffY * 0.1;
      if (spotlight) {
        spotlight.style.setProperty('--mouse-x', `${currentX.toFixed(1)}px`);
        spotlight.style.setProperty('--mouse-y', `${currentY.toFixed(1)}px`);
      }
    }

    if (badge && badge.classList.contains('is-visible')) {
      badgeX += (mouseX - badgeX) * 0.18;
      badgeY += (mouseY - badgeY) * 0.18;
      badge.style.transform = `translate3d(${badgeX.toFixed(1)}px, ${badgeY.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(loopCursor);
  }
  requestAnimationFrame(loopCursor);

  document.querySelectorAll('[data-cursor], .stream-card, .poster-card, .promo-card, .img-upload-box').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const txt = el.getAttribute('data-cursor') || 'EXAMINE';
      if (badge) { badge.innerText = txt; badge.classList.add('is-visible'); }
    }, { passive: true });
    el.addEventListener('mouseleave', () => {
      if (badge) badge.classList.remove('is-visible');
    }, { passive: true });
  });
})();
