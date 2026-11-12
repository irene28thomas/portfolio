// =========================================================================
// IRENE THOMAS PORTFOLIO — APPLICATION INITIALIZER
// =========================================================================

// =========================================================================
// HARDWARE LAUNCH SUITE — TOUCH SWIPE & PEEK CONTROLLER
// =========================================================================
function initHardwareSliderSwipe() {
  const stage = document.querySelector('.studio-banner-stage-wrapper');
  if (!stage || stage.dataset.swipeInitialized === 'true') return;
  stage.dataset.swipeInitialized = 'true';

  const hardwareItems = [
    {
      src: 'assets/real_works/Callaway_Quantum_Series_900x600.jpg',
      title: 'Callaway Quantum Series',
      desc: 'Directional lighting & aggressive typography crafted for premier GCC golf retail launch campaigns.'
    },
    {
      src: 'assets/real_works/TaylorMade_Qi4D_Series_900x600.jpg',
      title: 'TaylorMade Qi4D Series',
      desc: 'High-contrast typography and carbon-fiber aesthetic for TaylorMade flagship launch.'
    },
    {
      src: 'assets/real_works/PXG_GEN8_Irons_900x600.jpg',
      title: 'PXG GEN8 Irons',
      desc: 'Industrial darkness and chrome metallic finish spotlighting precision golf engineering.'
    }
  ];

  let currentIdx = 0;

  function cycleHardware(dir) {
    currentIdx = (currentIdx + dir + hardwareItems.length) % hardwareItems.length;
    const item = hardwareItems[currentIdx];
    const pills = document.querySelectorAll('.studio-suite-card');
    const targetPill = pills[currentIdx];
    if (typeof switchBannerSlider === 'function') {
      switchBannerSlider(item.src, item.title, item.desc, targetPill);
    }
    if (targetPill && !(window.AtelierMode && window.AtelierMode.isMobile())) {
      targetPill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  window.prevHardwareSlider = function(e) {
    if (e) e.stopPropagation();
    cycleHardware(-1);
  };
  window.nextHardwareSlider = function(e) {
    if (e) e.stopPropagation();
    cycleHardware(1);
  };

  // Sync index when clicked directly
  document.querySelectorAll('.studio-suite-card').forEach((card, idx) => {
    card.addEventListener('click', () => {
      currentIdx = idx;
    });
  });
}

function initAtelierDesktopApp() {
  if (window.__atelierDesktopAppInitialized) return;
  window.__atelierDesktopAppInitialized = true;

  // 1. Initialize Nivara Brand Manual Console
  if (typeof renderManualThumbnails === 'function') {
    renderManualThumbnails();
  }

  // 2. Scrubber Track Click-To-Jump
  const track = document.querySelector('.folio-scrubber-track');
  if (track && window.nivaraSpreads) {
    track.style.cursor = 'pointer';
    track.addEventListener('click', (e) => {
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetIdx = Math.min(window.nivaraSpreads.length - 1, Math.floor(ratio * window.nivaraSpreads.length));
      if (typeof selectManualSpread === 'function') {
        selectManualSpread(targetIdx);
      }
    });
  }

  // 3. Attach gesture navigation for Storefront Carousel
  if (typeof updateDeviceSliderDisplay === 'function') {
    updateDeviceSliderDisplay();
  }

  // 4. Initial Scroll & Sector Tracking
  if (typeof onUnifiedScroll === 'function') {
    onUnifiedScroll();
  }

  // 5. Initialize Hardware Slider Swipe & Gestures
  initHardwareSliderSwipe();

  // 6. Reset poster gallery scroll position
  const posterGrid = document.getElementById('poster-grid');
  if (posterGrid) {
    posterGrid.scrollLeft = 0;
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initAtelierDesktopApp);
} else {
  initAtelierDesktopApp();
}

