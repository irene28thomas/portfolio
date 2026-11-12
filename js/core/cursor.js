// =========================================================
// AMBIENT CURSOR LIGHTING CONTROLLER
// Lightweight 60fps tracking for atmospheric spotlight
// =========================================================
(function initCursorSpotlight() {
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let currentX = mouseX, currentY = mouseY;
  const spotlight = document.getElementById('ambient-cursor-spotlight');
  if (!spotlight) return;

  let hasFineHover = window.AtelierMode ? window.AtelierMode.hasFineHover() : window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  window.addEventListener('atelier:cursorchange', (e) => {
    hasFineHover = Boolean(e.detail && e.detail.hasFineHover);
  });

  window.addEventListener('mousemove', (e) => {
    if (!hasFineHover) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function loopSpotlight() {
    if (hasFineHover) {
      const diffX = mouseX - currentX;
      const diffY = mouseY - currentY;

      if (Math.abs(diffX) > 0.1 || Math.abs(diffY) > 0.1) {
        currentX += diffX * 0.1;
        currentY += diffY * 0.1;
        spotlight.style.setProperty('--mouse-x', `${currentX.toFixed(1)}px`);
        spotlight.style.setProperty('--mouse-y', `${currentY.toFixed(1)}px`);
      }
    }

    if (document.documentElement.dataset.mode === 'mobile') {
      setTimeout(() => requestAnimationFrame(loopSpotlight), 1000);
      return;
    }
    requestAnimationFrame(loopSpotlight);
  }
  requestAnimationFrame(loopSpotlight);
})();
